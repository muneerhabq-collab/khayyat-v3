'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Empty } from '@/components/ui/empty';
import { sendWA } from '@/lib/whatsapp';
import { Plus, Search, Users, UserPlus, MessageCircle, Phone } from 'lucide-react';

export default function Customers() {
  const r=useRouter(); const {store}=useStore();
  const [custs,setCusts]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [showAdd,setShowAdd]=useState(false);
  const [nn,setNn]=useState(''); const [np,setNp]=useState(''); const [saving,setSaving]=useState(false);

  useEffect(()=>{if(store)load();},[store]);
  async function load(){const{data}=await supabase.from('customers').select('*').eq('store_id',store!.id).order('created_at',{ascending:false});if(data)setCusts(data);setLoading(false);}
  async function add(){if(!nn||!np||!store)return;setSaving(true);const{data}=await supabase.from('customers').insert({store_id:store.id,name:nn,phone:np}).select().single();if(data){setCusts(p=>[data,...p]);setShowAdd(false);setNn('');setNp('');}setSaving(false);}
  const fc=custs.filter(c=>c.name.includes(search)||c.phone.includes(search));

  return <div>
    <Header title="العملاء" action={<Button size="sm" icon={<UserPlus className="w-4 h-4"/>} onClick={()=>setShowAdd(true)}>عميل جديد</Button>}/>
    <div className="p-4 space-y-4">
      <Input placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search className="w-4 h-4"/>}/>
      {showAdd&&<Card className="animate-scale-in !border-brand-200 !bg-brand-50/30"><h3 className="text-sm font-bold text-srf-700 mb-3">عميل جديد</h3><div className="space-y-3"><Input label="الاسم" value={nn} onChange={e=>setNn(e.target.value)}/><Input label="الجوال" value={np} onChange={e=>setNp(e.target.value)} dir="ltr"/><div className="flex gap-2"><Button size="sm" loading={saving} onClick={add} className="flex-1">حفظ</Button><Button variant="ghost" size="sm" onClick={()=>setShowAdd(false)}>إلغاء</Button></div></div></Card>}
      {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skel h-20 w-full"/>)}</div>
      :fc.length===0?<Empty icon={<Users className="w-8 h-8"/>} title={search?'لا نتائج':'لا عملاء'} action={!search&&<Button icon={<UserPlus className="w-4 h-4"/>} onClick={()=>setShowAdd(true)}>إضافة</Button>}/>
      :<div className="space-y-2">{fc.map(c=><Card key={c.id} hoverable onClick={()=>r.push(`/customers/${c.id}`)} className="!p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">{c.name.charAt(0)}</div><div><p className="text-sm font-bold text-srf-800">{c.name}</p><p className="text-xs text-srf-500" dir="ltr">{c.phone}</p></div></div><div className="flex gap-1"><button onClick={e=>{e.stopPropagation();sendWA(c.phone,`مرحباً ${c.name}`);}} className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center press"><MessageCircle className="w-4 h-4 text-[#25D366]"/></button><button onClick={e=>{e.stopPropagation();window.open(`tel:${c.phone}`);}} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center press"><Phone className="w-4 h-4 text-blue-600"/></button></div></div></Card>)}</div>}
    </div>
  </div>;
}
