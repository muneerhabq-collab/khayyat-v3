'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Store { id:string; name:string; owner_id:string; phone:string|null; city:string|null; email:string|null; address:string|null; }
interface Member { id:string; store_id:string; user_id:string; role:string; display_name:string; branch_id:string|null; }
interface Branch { id:string; store_id:string; name:string; branch_type:string; is_main:boolean; is_active:boolean; phone:string|null; }

interface Ctx {
  user: User|null; store: Store|null; member: Member|null;
  branches: Branch[]; mainBranch: Branch|null; members: Member[];
  loading: boolean; role: string|null; refresh: () => Promise<void>;
}

const C = createContext<Ctx>({ user:null, store:null, member:null, branches:[], mainBranch:null, members:[], loading:true, role:null, refresh:async()=>{} });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User|null>(null);
  const [store, setStore] = useState<Store|null>(null);
  const [member, setMember] = useState<Member|null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data:{ user:u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }
      setUser(u);
      const { data:m } = await supabase.from('store_members').select('*').eq('user_id', u.id).eq('is_active', true).limit(1).single();
      if (m) {
        setMember(m);
        const { data:s } = await supabase.from('stores').select('*').eq('id', m.store_id).single();
        if (s) setStore(s);
        const { data:b } = await supabase.from('branches').select('*').eq('store_id', m.store_id).eq('is_active', true).order('is_main', { ascending: false });
        if (b) setBranches(b);
        const { data:allM } = await supabase.from('store_members').select('*').eq('store_id', m.store_id).eq('is_active', true);
        if (allM) setMembers(allM);
      }
    } catch(e) { console.error('Store load:', e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  const mainBranch = branches.find(b => b.is_main) || null;

  return (
    <C.Provider value={{ user, store, member, branches, mainBranch, members, loading, role: member?.role||null, refresh: load }}>
      {children}
    </C.Provider>
  );
}

export const useStore = () => useContext(C);
