'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Empty } from '@/components/ui/empty';
import { fmtCurrency, timeAgo, cn } from '@/lib/utils';
import { Plus, Search, Scissors } from 'lucide-react';

const TABS = [{s:'all',l:'الكل'},{s:'pending',l:'جديد'},{s:'confirmed',l:'مؤكد'},{s:'cutting',l:'قص'},{s:'sewing',l:'خياطة'},{s:'ready',l:'جاهز'},{s:'delivered',l:'مسلّم'}];

export default function Orders() {
  const r=useRouter(); const {store}=useStore();
  const [orders,setOrders]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [tab,setTab]=useState('all');

  useEffect(()=>{ if(store) load(); },[store]);
  async function load() { const{data}=await supabase.from('orders').select('*, customer:customers(*)').eq('store_id',store!.id).order('created_at',{ascending:false}); if(data)setOrders(data); setLoading(false); }

  const filtered = orders.filter(o => {
    const ms = tab==='all'||o.status===tab;
    const mq = !search||o.customer?.name?.includes(search)||o.order_number?.includes(search);
    return ms&&mq;
  });

  return <div>
    <Header title="الطلبات" action={<Button size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>r.push('/orders/new')}>طلب جديد</Button>}/>
    <div className="p-4 space-y-4">
      <Input placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search className="w-4 h-4"/>}/>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">{TABS.map(t=><button key={t.s} onClick={()=>setTab(t.s)} className={cn('shrink-0 px-3 py-1.5 rounded-full text-sm font-medium',tab===t.s?'bg-brand-500 text-white':'bg-srf-100 text-srf-600')}>{t.l}</button>)}</div>
      {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skel h-24 w-full"/>)}</div>
      :filtered.length===0?<Empty icon={<Scissors className="w-8 h-8"/>} title="لا توجد طلبات" action={!search&&<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>r.push('/orders/new')}>طلب جديد</Button>}/>
      :<div className="space-y-2">{filtered.map((o:any)=><Card key={o.id} hoverable onClick={()=>r.push(`/orders/${o.id}`)} className="!p-3"><div className="flex items-start justify-between mb-2"><div><span className="text-sm font-bold text-srf-800 block truncate">{o.customer?.name||'عميل'}</span><span className="text-xs text-srf-500">#{o.order_number}</span></div><Badge status={o.status} size="sm"/></div><div className="flex justify-between text-xs text-srf-500"><span>{timeAgo(o.created_at)}</span><span className="font-semibold text-srf-700 text-sm">{fmtCurrency(o.total_price)}</span></div></Card>)}</div>}
    </div>
  </div>;
}
