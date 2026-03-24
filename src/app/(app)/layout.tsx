'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Nav } from '@/components/layout/nav';
import { StoreProvider } from '@/hooks/use-store';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const r=useRouter(); const [ok,setOk]=useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}})=>{ if(!user) r.replace('/login'); else setOk(true); });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>{ if(!s?.user) r.replace('/login'); });
    return ()=>subscription.unsubscribe();
  }, [r]);
  if(!ok) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>;
  return <StoreProvider><div className="min-h-screen pb-20">{children}<Nav/></div></StoreProvider>;
}
