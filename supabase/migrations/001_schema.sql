CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'محل جديد',
  owner_id UUID NOT NULL,
  phone TEXT, email TEXT, address TEXT, city TEXT DEFAULT 'الرياض',
  logo_url TEXT, settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  branch_type TEXT NOT NULL DEFAULT 'branch' CHECK (branch_type IN ('branch','warehouse','workshop')),
  phone TEXT, address TEXT, city TEXT,
  is_main BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_branches_store ON branches(store_id);

CREATE TABLE store_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'receptionist' CHECK (role IN ('owner','manager','receptionist','tailor')),
  display_name TEXT NOT NULL DEFAULT 'موظف',
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);
CREATE INDEX idx_members_user ON store_members(user_id);
CREATE INDEX idx_members_store ON store_members(store_id);

CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_customers_store ON customers(store_id);

CREATE TABLE measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'مقاس أساسي',
  chest NUMERIC, shoulder NUMERIC, sleeve_length NUMERIC, sleeve_width NUMERIC,
  body_length NUMERIC, neck NUMERIC, waist NUMERIC, hip NUMERIC, cuff_width NUMERIC,
  bottom_width NUMERIC, arm_hole NUMERIC, front_length NUMERIC, back_length NUMERIC,
  collar_type TEXT, pocket_style TEXT, pocket_count INTEGER DEFAULT 2,
  closure_type TEXT, closure_visible BOOLEAN DEFAULT true,
  cuff_style TEXT, slit_style TEXT, embroidery_style TEXT, embroidery_color TEXT, lining_type TEXT,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_msr_customer ON measurements(customer_id);

CREATE TABLE suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, contact_name TEXT, phone TEXT, email TEXT,
  address TEXT, city TEXT, bank_name TEXT, bank_iban TEXT, tax_number TEXT,
  notes TEXT, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_suppliers_store ON suppliers(store_id);

CREATE TABLE fabrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL, fabric_type TEXT NOT NULL, color TEXT, sku TEXT,
  price_per_meter NUMERIC DEFAULT 0, min_stock_alert NUMERIC DEFAULT 10,
  default_meters_per_thobe NUMERIC DEFAULT 3,
  is_active BOOLEAN DEFAULT true, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_fabrics_store ON fabrics(store_id);

CREATE TABLE fabric_stock (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  meters_in_stock NUMERIC DEFAULT 0, meters_reserved NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_fstock_fabric ON fabric_stock(fabric_id);

CREATE TABLE fabric_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  order_id UUID, from_branch_id UUID REFERENCES branches(id), to_branch_id UUID REFERENCES branches(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('add','deduct','transfer','adjust','return')),
  meters NUMERIC NOT NULL, note TEXT, created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ftx_fabric ON fabric_transactions(fabric_id);

CREATE TABLE purchase_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) NOT NULL,
  po_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','received','cancelled')),
  items JSONB DEFAULT '[]'::JSONB, total_amount NUMERIC DEFAULT 0,
  notes TEXT, sent_at TIMESTAMPTZ, received_at TIMESTAMPTZ, created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_po_store ON purchase_orders(store_id);

CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES branches(id),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  assigned_tailor_id UUID,
  order_number TEXT NOT NULL, 
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cutting','sewing','finishing','ready','delivered','cancelled')),
  items JSONB DEFAULT '[]'::JSONB NOT NULL,
  total_price NUMERIC DEFAULT 0, deposit_paid NUMERIC DEFAULT 0,
  delivery_date DATE, priority INTEGER DEFAULT 0,
  notes TEXT, qr_code TEXT, created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_orders_num ON orders(store_id, order_number);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(store_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);

CREATE TABLE order_status_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  from_status TEXT, to_status TEXT NOT NULL, note TEXT, changed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_logs_order ON order_status_logs(order_id);

-- Triggers
CREATE OR REPLACE FUNCTION auto_ts() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at=NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER t1 BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION auto_ts();
CREATE TRIGGER t2 BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION auto_ts();
CREATE TRIGGER t3 BEFORE UPDATE ON measurements FOR EACH ROW EXECUTE FUNCTION auto_ts();
CREATE TRIGGER t4 BEFORE UPDATE ON fabrics FOR EACH ROW EXECUTE FUNCTION auto_ts();
CREATE TRIGGER t5 BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION auto_ts();
CREATE TRIGGER t6 BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION auto_ts();
CREATE TRIGGER t7 BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION auto_ts();

-- Auto-create store on signup
CREATE OR REPLACE FUNCTION on_user_signup() RETURNS TRIGGER AS $$
DECLARE sid UUID; bid UUID;
BEGIN
  INSERT INTO stores (name, owner_id) VALUES (COALESCE(NEW.raw_user_meta_data->>'shop_name','محل جديد'), NEW.id) RETURNING id INTO sid;
  INSERT INTO branches (store_id, name, branch_type, is_main) VALUES (sid, 'الفرع الرئيسي', 'branch', true) RETURNING id INTO bid;
  INSERT INTO store_members (store_id, user_id, role, display_name, branch_id) VALUES (sid, NEW.id, 'owner', COALESCE(NEW.raw_user_meta_data->>'full_name','المالك'), bid);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'signup_err: % %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION on_user_signup();

-- RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "s1" ON stores FOR SELECT USING (owner_id = auth.uid() OR id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid()));
CREATE POLICY "s2" ON stores FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "m1" ON store_members FOR SELECT USING (user_id = auth.uid() OR store_id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid()));
CREATE POLICY "m2" ON store_members FOR INSERT WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "m3" ON store_members FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "m4" ON store_members FOR DELETE USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY['branches','customers','measurements','suppliers','fabrics','fabric_stock','fabric_transactions','purchase_orders','orders','order_status_logs']) LOOP
  EXECUTE format('CREATE POLICY "%s_r" ON %I FOR SELECT USING (store_id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid()))', t, t);
  EXECUTE format('CREATE POLICY "%s_i" ON %I FOR INSERT WITH CHECK (store_id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid()))', t, t);
  EXECUTE format('CREATE POLICY "%s_u" ON %I FOR UPDATE USING (store_id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid()))', t, t);
  EXECUTE format('CREATE POLICY "%s_d" ON %I FOR DELETE USING (store_id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid()))', t, t);
END LOOP; END $$;
