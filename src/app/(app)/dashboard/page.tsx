'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { fmtCurrency, timeAgo } from '@/lib/utils';
import { Plus, Scissors, Clock, Package, TrendingUp, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  const r = useRouter();
  const { store, member, loading: sL } = useStore();
  const [stats, setStats] = useState({total:0,active:0,ready:0,revenue:0});
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if(store) load(); }, [store]);
  async function load() {
    const { data } = await supabase.from('orders').select('*, customer:customers(*)').eq('store_id', store!.id).order('created_at', { ascending: false });
    if(data) {
      const active = data.filter((o:any)=>['pending','confirmed','cutting','sewing','finishing'].includes(o.status));
      const ready = data.filter((o:any)=>o.status==='ready');
      const now = new Date(); const ms = new Date(now.getFullYear(),now.getMonth(),1).toISOString();
      const rev = data.filter((o:any)=>o.status==='delivered'&&o.updated_at>=ms).reduce((s:number,o:any)=>s+(o.total_price||0),0);
      setStats({total:data.length,active:active.length,ready:ready.length,revenue:rev});
      setRecent(data.slice(0,5));
    }
    setLoading(false);
  }

  if(sL) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>;

  const cards = [
    {l:'طلبات نشطة',v:stats.active,icon:Scissors,c:'text-brand-600',bg:'bg-brand-50'},
    {l:'جاهزة',v:stats.ready,icon:Package,c:'text-green-600',bg:'bg-green-50'},
    {l:'الإجمالي',v:stats.total,icon:Clock,c:'text-blue-600',bg:'bg-blue-50'},
    {l:'إيراد الشهر',v:fmtCurrency(stats.revenue),icon:TrendingUp,c:'text-teal-600',bg:'bg-teal-50'},
  ];

  return <div>
    <Header title={`أهلاً ${member?.display_name||''}`} action={<Button size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>r.push('/orders/new')}>طلب جديد</Button>}/>
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-3">{cards.map(s=>{const I=s.icon;return<Card key={s.l} className="!p-3"><div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}><I className={`w-5 h-5 ${s.c}`}/></div><p className="text-xl font-bold text-srf-900">{loading?<span className="skel w-12 h-6 block"/>:s.v}</p><p className="text-xs text-srf-500 mt-0.5">{s.l}</p></Card>;})}</div>
      <div>
        <div className="flex items-center justify-between mb-3"><h2 className="text-base font-bold text-srf-800">آخر الطلبات</h2><button onClick={()=>r.push('/orders')} className="text-sm text-brand-600 font-medium flex items-center gap-1">الكل <ArrowLeft className="w-3.5 h-3.5"/></button></div>
        {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skel h-20 w-full"/>)}</div>
        :recent.length===0?<Empty icon={<Scissors className="w-8 h-8"/>} title="لا توجد طلبات" desc="ابدأ بإنشاء أول طلب" action={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>r.push('/orders/new')}>طلب جديد</Button>}/>
        :<div className="space-y-2">{recent.map((o:any)=><Card key={o.id} hoverable onClick={()=>r.push(`/orders/${o.id}`)} className="!p-3"><div className="flex items-start justify-between"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-srf-800 truncate">{o.customer?.name||'عميل'}</span><Badge status={o.status} size="sm"/></div><p className="text-xs text-srf-500">#{o.order_number} · {timeAgo(o.created_at)}</p></div><span className="text-sm font-semibold text-srf-700">{fmtCurrency(o.total_price)}</span></div></Card>)}</div>}
      </div>
    </div>
  </div>;
}
