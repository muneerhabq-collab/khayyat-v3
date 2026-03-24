'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { genOrderNum, cn, fmtCurrency, GARMENTS } from '@/lib/utils';
import { orderWA } from '@/lib/whatsapp';
import { Plus, Trash2, UserPlus, Search, MessageCircle, Save, X } from 'lucide-react';

export default function NewOrder() {
  const r=useRouter(); const {store,user}=useStore();
  const [custs,setCusts]=useState<any[]>([]); const [msrs,setMsrs]=useState<any[]>([]);
  const [saving,setSaving]=useState(false);
  const [sel,setSel]=useState<any>(null); const [q,setQ]=useState(''); const [showQ,setShowQ]=useState(false);
  const [showNew,setShowNew]=useState(false); const [nn,setNn]=useState(''); const [np,setNp]=useState('');
  const [items,setItems]=useState([{id:'1',name:'',qty:1,price:0,notes:''}]);
  const [dd,setDd]=useState(''); const [dep,setDep]=useState(0); const [notes,setNotes]=useState('');
  const [wa,setWa]=useState(true);

  useEffect(()=>{ if(store) supabase.from('customers').select('*').eq('store_id',store.id).order('name').then(({data})=>{if(data)setCusts(data)}); },[store]);

  async function pickCust(c:any) { setSel(c);setShowQ(false);setQ(''); const{data}=await supabase.from('measurements').select('*').eq('customer_id',c.id); if(data)setMsrs(data); }
  async function addCust() { if(!nn||!np||!store)return; const{data}=await supabase.from('customers').insert({store_id:store.id,name:nn,phone:np}).select().single(); if(data){pickCust(data);setShowNew(false);setNn('');setNp('');setCusts(p=>[...p,data]);} }
  function uItem(i:number,u:any){setItems(p=>p.map((x,j)=>j===i?{...x,...u}:x));}
  const total=items.reduce((s,i)=>s+(i.qty*i.price),0);

  async function submit() {
    if(!sel||!items[0]?.name||!store)return; setSaving(true);
    const num=genOrderNum();
    const{data:order,error}=await supabase.from('orders').insert({store_id:store.id,customer_id:sel.id,order_number:num,status:'pending',items:items.filter(i=>i.name),total_price:total,deposit_paid:dep,delivery_date:dd||null,notes:notes||null,created_by:user?.id}).select('*, customer:customers(*)').single();
    if(error){console.error(error);setSaving(false);return;}
    if(order){ await supabase.from('order_status_logs').insert({order_id:order.id,store_id:store.id,from_status:null,to_status:'pending',note:'تم إنشاء الطلب'}); if(wa&&sel.phone)orderWA(sel.phone,sel.name,num,'pending',store.name); r.replace(`/orders/${order.id}`); }
  }

  const fc=custs.filter(c=>c.name.includes(q)||c.phone.includes(q));

  return <div>
    <Header title="طلب جديد" showBack/>
    <div className="p-4 space-y-4 pb-32">
      <Card><h3 className="text-sm font-bold text-srf-700 mb-3">العميل</h3>
        {sel?<div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl p-3"><div><p className="text-sm font-semibold text-brand-800">{sel.name}</p><p className="text-xs text-brand-600" dir="ltr">{sel.phone}</p></div><button onClick={()=>{setSel(null);setMsrs([]);}} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100"><X className="w-4 h-4 text-brand-600"/></button></div>
        :<div className="space-y-3"><div className="relative"><Input placeholder="ابحث عن عميل..." value={q} onChange={e=>{setQ(e.target.value);setShowQ(true);}} onFocus={()=>setShowQ(true)} icon={<Search className="w-4 h-4"/>}/>{showQ&&q&&<div className="absolute top-full mt-1 left-0 right-0 bg-white border border-srf-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">{fc.length===0?<p className="p-3 text-sm text-srf-500 text-center">لا نتائج</p>:fc.map(c=><button key={c.id} onClick={()=>pickCust(c)} className="w-full text-right p-3 hover:bg-srf-50 border-b border-srf-100 last:border-0"><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-srf-500" dir="ltr">{c.phone}</p></button>)}</div>}</div>
          <Button variant="secondary" size="sm" icon={<UserPlus className="w-4 h-4"/>} onClick={()=>setShowNew(true)} className="w-full">عميل جديد</Button>
          {showNew&&<div className="space-y-3 border border-srf-200 rounded-xl p-3 animate-scale-in"><Input label="الاسم" value={nn} onChange={e=>setNn(e.target.value)}/><Input label="الجوال" value={np} onChange={e=>setNp(e.target.value)} dir="ltr"/><div className="flex gap-2"><Button size="sm" onClick={addCust} className="flex-1">حفظ</Button><Button variant="ghost" size="sm" onClick={()=>setShowNew(false)}>إلغاء</Button></div></div>}
        </div>}
      </Card>
      <Card><h3 className="text-sm font-bold text-srf-700 mb-3">الأصناف</h3><div className="space-y-4">
        {items.map((item,idx)=><div key={item.id} className="space-y-3 border border-srf-100 rounded-xl p-3 relative">
          {items.length>1&&<button onClick={()=>setItems(p=>p.filter((_,i)=>i!==idx))} className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4"/></button>}
          <Select label="الصنف" placeholder="اختر" value={item.name} onChange={e=>uItem(idx,{name:e.target.value})} options={GARMENTS.map(g=>({value:g,label:g}))}/>
          <div className="grid grid-cols-2 gap-3"><Input label="الكمية" type="number" min="1" value={item.qty} onChange={e=>uItem(idx,{qty:parseInt(e.target.value)||1})}/><Input label="السعر" type="number" min="0" value={item.price||''} onChange={e=>uItem(idx,{price:parseFloat(e.target.value)||0})} suffix="ر.س"/></div>
          {msrs.length>0&&<Select label="المقاس" placeholder="اختر" value={item.notes||''} onChange={e=>uItem(idx,{notes:e.target.value})} options={msrs.map((m:any)=>({value:m.id,label:m.label}))}/>}
        </div>)}
        <Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>setItems(p=>[...p,{id:String(Date.now()),name:'',qty:1,price:0,notes:''}])} className="w-full">صنف آخر</Button>
      </div></Card>
      <Card><h3 className="text-sm font-bold text-srf-700 mb-3">تفاصيل</h3><div className="space-y-3"><Input label="تاريخ التسليم" type="date" value={dd} onChange={e=>setDd(e.target.value)} dir="ltr"/><Input label="العربون" type="number" min="0" value={dep||''} onChange={e=>setDep(parseFloat(e.target.value)||0)} suffix="ر.س"/><div className="space-y-1.5"><label className="block text-sm font-medium text-srf-700">ملاحظات</label><textarea className="w-full h-20 px-3 py-2 bg-white border border-srf-200 rounded-xl text-srf-900 placeholder:text-srf-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none" value={notes} onChange={e=>setNotes(e.target.value)}/></div></div></Card>
      <Card className="!p-3"><label className="flex items-center justify-between cursor-pointer"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-[#25D366]"/></div><span className="text-sm font-medium text-srf-700">واتساب</span></div><div className={cn('w-11 h-6 rounded-full relative',wa?'bg-[#25D366]':'bg-srf-300')} onClick={()=>setWa(!wa)}><div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',wa?'left-0.5':'right-0.5')}/></div></label></Card>
    </div>
    <div className="fixed bottom-16 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-srf-200/60 p-4 z-30"><div className="flex items-center justify-between mb-3"><span className="text-sm text-srf-500">الإجمالي</span><span className="text-xl font-bold">{total.toLocaleString('ar-SA')} ر.س</span></div><Button size="lg" className="w-full" icon={<Save className="w-5 h-5"/>} loading={saving} disabled={!sel||!items[0]?.name} onClick={submit}>حفظ الطلب</Button></div>
  </div>;
}
