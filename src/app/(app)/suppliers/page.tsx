'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { sendWA } from '@/lib/whatsapp';
import { Plus, Search, Truck, X, Save, Edit3, Trash2, MessageCircle, Phone, Mail, FileText } from 'lucide-react';

export default function Suppliers() {
  const {store}=useStore();
  const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState('');
  const [showForm,setShowForm]=useState(false); const [editing,setEditing]=useState<any>(null);
  const [f,sF]=useState({name:'',contact_name:'',phone:'',email:'',address:'',city:'',bank_name:'',bank_iban:'',tax_number:'',notes:''});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{if(store)load();},[store]);
  async function load(){const{data}=await supabase.from('suppliers').select('*').eq('store_id',store!.id).eq('is_active',true).order('name');if(data)setItems(data);setLoading(false);}

  async function save(){if(!f.name||!store)return;setSaving(true);
    const d={store_id:store.id,name:f.name,contact_name:f.contact_name||null,phone:f.phone||null,email:f.email||null,address:f.address||null,city:f.city||null,bank_name:f.bank_name||null,bank_iban:f.bank_iban||null,tax_number:f.tax_number||null,notes:f.notes||null};
    if(editing)await supabase.from('suppliers').update(d).eq('id',editing.id);
    else await supabase.from('suppliers').insert(d);
    setShowForm(false);setSaving(false);setEditing(null);load();}

  function startEdit(s:any){setEditing(s);sF({name:s.name,contact_name:s.contact_name||'',phone:s.phone||'',email:s.email||'',address:s.address||'',city:s.city||'',bank_name:s.bank_name||'',bank_iban:s.bank_iban||'',tax_number:s.tax_number||'',notes:s.notes||''});setShowForm(true);}

  const fc=items.filter(s=>!search||s.name.includes(search)||s.contact_name?.includes(search));

  return <div>
    <Header title="الموردين" action={<Button size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>{setEditing(null);sF({name:'',contact_name:'',phone:'',email:'',address:'',city:'',bank_name:'',bank_iban:'',tax_number:'',notes:''});setShowForm(true);}}>مورد جديد</Button>}/>
    <div className="p-4 space-y-4">
      <Input placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search className="w-4 h-4"/>}/>

      {showForm&&<Card className="animate-scale-in !border-brand-200">
        <div className="flex justify-between mb-3"><h4 className="text-sm font-bold">{editing?'تعديل مورد':'مورد جديد'}</h4><button onClick={()=>setShowForm(false)} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><X className="w-4 h-4"/></button></div>
        <div className="space-y-3">
          <Input label="اسم الشركة/المورد" value={f.name} onChange={e=>sF(p=>({...p,name:e.target.value}))}/>
          <Input label="اسم المسؤول" value={f.contact_name} onChange={e=>sF(p=>({...p,contact_name:e.target.value}))}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="الجوال" value={f.phone} onChange={e=>sF(p=>({...p,phone:e.target.value}))} dir="ltr"/>
            <Input label="الإيميل" value={f.email} onChange={e=>sF(p=>({...p,email:e.target.value}))} dir="ltr"/>
          </div>
          <Input label="العنوان" value={f.address} onChange={e=>sF(p=>({...p,address:e.target.value}))}/>
          <Input label="المدينة" value={f.city} onChange={e=>sF(p=>({...p,city:e.target.value}))}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="البنك" value={f.bank_name} onChange={e=>sF(p=>({...p,bank_name:e.target.value}))}/>
            <Input label="IBAN" value={f.bank_iban} onChange={e=>sF(p=>({...p,bank_iban:e.target.value}))} dir="ltr"/>
          </div>
          <Input label="الرقم الضريبي" value={f.tax_number} onChange={e=>sF(p=>({...p,tax_number:e.target.value}))} dir="ltr"/>
          <div className="space-y-1.5"><label className="block text-sm font-medium text-srf-700">ملاحظات</label><textarea className="w-full h-16 px-3 py-2 bg-white border border-srf-200 rounded-xl text-srf-900 placeholder:text-srf-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none" value={f.notes} onChange={e=>sF(p=>({...p,notes:e.target.value}))}/></div>
          <Button size="sm" loading={saving} onClick={save} icon={<Save className="w-4 h-4"/>} className="w-full">حفظ</Button>
        </div>
      </Card>}

      {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skel h-24 w-full"/>)}</div>
      :fc.length===0?<Empty icon={<Truck className="w-8 h-8"/>} title="لا موردين" desc="أضف موردي الأقمشة" action={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>setShowForm(true)}>إضافة مورد</Button>}/>
      :<div className="space-y-2">{fc.map(s=><Card key={s.id} className="!p-3">
        <div className="flex items-start justify-between mb-2">
          <div><p className="text-sm font-bold text-srf-800">{s.name}</p>{s.contact_name&&<p className="text-xs text-srf-500">{s.contact_name}</p>}</div>
          <div className="flex gap-1">
            {s.phone&&<button onClick={()=>sendWA(s.phone,`مرحباً ${s.contact_name||s.name}`)} className="w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center press"><MessageCircle className="w-3.5 h-3.5 text-[#25D366]"/></button>}
            {s.phone&&<button onClick={()=>window.open(`tel:${s.phone}`)} className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center press"><Phone className="w-3.5 h-3.5 text-blue-600"/></button>}
            <button onClick={()=>startEdit(s)} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 text-srf-500"/></button>
            <button onClick={async()=>{await supabase.from('suppliers').update({is_active:false}).eq('id',s.id);load();}} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-srf-500">
          {s.phone&&<span dir="ltr">{s.phone}</span>}
          {s.email&&<span>· {s.email}</span>}
          {s.city&&<span>· {s.city}</span>}
        </div>
      </Card>)}</div>}
    </div>
  </div>;
}
