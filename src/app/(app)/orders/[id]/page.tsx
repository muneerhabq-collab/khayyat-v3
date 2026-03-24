'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fmtCurrency, fmtDate, fmtDateTime, nextStatus, cn, STATUS, FLOW } from '@/lib/utils';
import { orderWA, sendWA } from '@/lib/whatsapp';
import { MessageCircle, Phone, Clock, ArrowLeft, User, Calendar, FileText, CheckCircle } from 'lucide-react';

export default function OrderDetail() {
  const {id}=useParams(); const r=useRouter(); const {store,user}=useStore();
  const [order,setOrder]=useState<any>(null); const [logs,setLogs]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [updating,setUpdating]=useState(false);

  useEffect(()=>{if(store)load();},[store,id]);
  async function load() { const{data}=await supabase.from('orders').select('*, customer:customers(*)').eq('id',id).single(); if(data){setOrder(data); const{data:l}=await supabase.from('order_status_logs').select('*').eq('order_id',data.id).order('created_at',{ascending:true}); if(l)setLogs(l);} setLoading(false); }

  async function update(ns:string) { if(!order||!store)return; setUpdating(true); await supabase.from('orders').update({status:ns}).eq('id',order.id); await supabase.from('order_status_logs').insert({order_id:order.id,store_id:store.id,from_status:order.status,to_status:ns}); if(order.customer?.phone)orderWA(order.customer.phone,order.customer.name,order.order_number,ns,store.name); await load(); setUpdating(false); }

  if(loading) return <div><Header title="الطلب" showBack/><div className="p-4 space-y-4">{[1,2,3].map(i=><div key={i} className="skel h-32 w-full"/>)}</div></div>;
  if(!order) return <div><Header title="غير موجود" showBack/><div className="p-4 text-center text-srf-500 mt-20">لم يتم العثور</div></div>;

  const ns=nextStatus(order.status); const rem=order.total_price-order.deposit_paid; const step=FLOW.indexOf(order.status);

  return <div>
    <Header title={`#${order.order_number}`} showBack action={<Badge status={order.status}/>}/>
    <div className="p-4 space-y-4 pb-32">
      <Card><div className="flex items-center gap-1 overflow-x-auto pb-2">{FLOW.map((s,i)=><div key={s} className="flex items-center shrink-0"><div className="flex flex-col items-center"><div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',i<=step?'bg-brand-500 text-white':'bg-srf-100 text-srf-400',i===step&&'ring-2 ring-brand-200 ring-offset-1')}>{i<=step?<CheckCircle className="w-4 h-4"/>:i+1}</div><span className={cn('text-[9px] mt-1 whitespace-nowrap',i<=step?'text-brand-600 font-semibold':'text-srf-400')}>{STATUS[s]?.label}</span></div>{i<FLOW.length-1&&<div className={cn('w-4 h-0.5 mx-0.5 mt-[-12px]',i<step?'bg-brand-500':'bg-srf-200')}/>}</div>)}</div></Card>
      <Card hoverable onClick={()=>order.customer&&r.push(`/customers/${order.customer_id}`)}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center"><User className="w-5 h-5 text-brand-600"/></div><div><p className="text-sm font-bold text-srf-800">{order.customer?.name}</p><p className="text-xs text-srf-500" dir="ltr">{order.customer?.phone}</p></div></div><div className="flex gap-1"><button onClick={e=>{e.stopPropagation();order.customer?.phone&&sendWA(order.customer.phone,'');}} className="w-9 h-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center press"><MessageCircle className="w-4 h-4 text-[#25D366]"/></button><button onClick={e=>{e.stopPropagation();order.customer?.phone&&window.open(`tel:${order.customer.phone}`);}} className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center press"><Phone className="w-4 h-4 text-blue-600"/></button></div></div></Card>
      <Card><p className="text-sm font-bold text-srf-700 mb-3">الأصناف</p>{(order.items||[]).map((item:any,i:number)=><div key={i} className="flex justify-between py-2 border-b border-srf-100 last:border-0"><div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-srf-500">الكمية: {item.qty||item.quantity}</p></div><span className="text-sm font-semibold text-srf-700">{fmtCurrency((item.qty||item.quantity)*(item.price||item.unit_price))}</span></div>)}</Card>
      <Card><p className="text-sm font-bold text-srf-700 mb-3">المالي</p><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-srf-500">الإجمالي</span><span className="font-semibold">{fmtCurrency(order.total_price)}</span></div><div className="flex justify-between text-sm"><span className="text-srf-500">العربون</span><span className="text-green-600 font-semibold">{fmtCurrency(order.deposit_paid)}</span></div><div className="border-t border-srf-100 pt-2 flex justify-between text-sm"><span className="font-bold text-srf-700">المتبقي</span><span className={cn('font-bold',rem>0?'text-red-600':'text-green-600')}>{fmtCurrency(rem)}</span></div></div></Card>
      <Card><p className="text-sm font-bold text-srf-700 mb-3">التفاصيل</p><div className="space-y-3">{order.delivery_date&&<div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-srf-400"/><div><p className="text-xs text-srf-500">التسليم</p><p className="text-sm font-medium">{fmtDate(order.delivery_date)}</p></div></div>}<div className="flex items-center gap-3"><Clock className="w-4 h-4 text-srf-400"/><div><p className="text-xs text-srf-500">الإنشاء</p><p className="text-sm font-medium">{fmtDateTime(order.created_at)}</p></div></div>{order.notes&&<div className="flex items-start gap-3"><FileText className="w-4 h-4 text-srf-400 mt-0.5"/><div><p className="text-xs text-srf-500">ملاحظات</p><p className="text-sm">{order.notes}</p></div></div>}</div></Card>
      <Card><p className="text-sm font-bold text-srf-700 mb-3">السجل</p>{logs.map((l:any,i:number)=><div key={l.id} className="flex gap-3"><div className="flex flex-col items-center"><div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1.5"/>{i<logs.length-1&&<div className="w-0.5 flex-1 bg-srf-200 my-1"/>}</div><div className="pb-4"><p className="text-sm font-medium">{STATUS[l.to_status]?.label||l.to_status}</p><p className="text-xs text-srf-500">{fmtDateTime(l.created_at)}</p></div></div>)}</Card>
    </div>
    {ns&&order.status!=='cancelled'&&<div className="fixed bottom-16 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-srf-200/60 p-4 z-30"><div className="flex gap-2"><Button size="lg" className="flex-1" loading={updating} onClick={()=>update(ns)} icon={<ArrowLeft className="w-5 h-5"/>}>نقل: {STATUS[ns]?.label}</Button>{order.status!=='delivered'&&<Button variant="danger" size="lg" onClick={()=>update('cancelled')} disabled={updating}>إلغاء</Button>}</div></div>}
  </div>;
}
