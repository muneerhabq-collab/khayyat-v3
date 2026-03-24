-- إصلاح مشكلة RLS recursion
-- المشكلة: policies تستعلم من store_members اللي هو نفسه محمي بـ RLS

-- حل: ننشئ function بـ SECURITY DEFINER تتجاوز RLS
CREATE OR REPLACE FUNCTION my_store_ids()
RETURNS SETOF UUID AS $$
  SELECT store_id FROM store_members WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- إعادة بناء كل الـ policies باستخدام الـ function

-- store_members
DROP POLICY IF EXISTS "m1" ON store_members;
DROP POLICY IF EXISTS "m2" ON store_members;
DROP POLICY IF EXISTS "m3" ON store_members;
DROP POLICY IF EXISTS "m4" ON store_members;
CREATE POLICY "m_sel" ON store_members FOR SELECT USING (user_id = auth.uid() OR store_id IN (SELECT my_store_ids()));
CREATE POLICY "m_ins" ON store_members FOR INSERT WITH CHECK (store_id IN (SELECT my_store_ids()));
CREATE POLICY "m_upd" ON store_members FOR UPDATE USING (store_id IN (SELECT my_store_ids()));
CREATE POLICY "m_del" ON store_members FOR DELETE USING (store_id IN (SELECT my_store_ids()));

-- stores
DROP POLICY IF EXISTS "s1" ON stores;
DROP POLICY IF EXISTS "s2" ON stores;
CREATE POLICY "s_sel" ON stores FOR SELECT USING (owner_id = auth.uid() OR id IN (SELECT my_store_ids()));
CREATE POLICY "s_upd" ON stores FOR UPDATE USING (owner_id = auth.uid());

-- كل الجداول الباقية
DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT unnest(ARRAY['branches','customers','measurements','suppliers','fabrics','fabric_stock','fabric_transactions','purchase_orders','orders','order_status_logs']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_r" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_i" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_u" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_d" ON %I', t, t);
    EXECUTE format('CREATE POLICY "%s_r" ON %I FOR SELECT USING (store_id IN (SELECT my_store_ids()))', t, t);
    EXECUTE format('CREATE POLICY "%s_i" ON %I FOR INSERT WITH CHECK (store_id IN (SELECT my_store_ids()))', t, t);
    EXECUTE format('CREATE POLICY "%s_u" ON %I FOR UPDATE USING (store_id IN (SELECT my_store_ids()))', t, t);
    EXECUTE format('CREATE POLICY "%s_d" ON %I FOR DELETE USING (store_id IN (SELECT my_store_ids()))', t, t);
  END LOOP;
END $$;
