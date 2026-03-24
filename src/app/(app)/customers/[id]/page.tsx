'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fmtCurrency, timeAgo, cn, MFIELDS, COLLARS, POCKETS, CLOSURES, CUFFS, SLITS, EMBROIDERY, LINING } from '@/lib/utils';
import { sendWA } from '@/lib/whatsapp';
import { MessageCircle, Phone, Plus, Ruler, Save, Scissors, Trash2, Edit3, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function CustomerDetail() {
  const {id}=useParams(); const r=useRouter(); const {store}=useStore();
  const [cust,setCust]=useState<any>(null); const [msrs,setMsrs]=useState<any[]>([]); const [ords,setOrds]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false); const [editing,setEditing]=useState<any>(null);
  const [form,setForm]=useState<any>({label:'مقاس أساسي',pocket_count:2,closure_visible:true});
  const [saving,setSaving]=useState(false); const [showDes,setShowDes]=useState(false); const [exp,setExp]=useState<string|null>(null);

  useEffect(()=>{if(store)load();},[store,id]);
  async function load(){
    const{data:c}=await supabase.from('customers').select('*').eq('id',id).single();
    if(c){setCust(c); const{data:m}=await supabase.from('measurements').select('*').eq('customer_id',c.id).order('created_at',{ascending:false}); if(m)setMsrs(m); const{data:o}=await supabase.from('orders').select('*').eq('customer_id',c.id).order('created_at',{ascending:false}).limit(10); if(o)setOrds(o);}
    setLoading(false);
  }
  const uf=(k:string,v:any)=>setForm((p:any)=>({...p,[k]:v}));
  async function saveMsr(){if(!cust||!store||!form.label)return;setSaving(true);const d:any={customer_id:cust.id,store_id:store.id,label:form.label}; MFIELDS.forEach(f=>{d[f.key]=form[f.key]||null;}); ['collar_type','pocket_style','pocket_count','closure_type','closure_visible','cuff_style','slit_style','embroidery_style','embroidery_color','lining_type','notes'].forEach(k=>{d[k]=form[k]??null;}); if(editing)await supabase.from('measurements').update(d).eq('id',editing.id); else await supabase.from('measurements').insert(d); setShowForm(false);setSaving(false);load();}

  const desFields=[{k:'collar_type',l:'الياقة',o:COLLARS},{k:'pocket_style',l:'الجيب',o:POCKETS},{k:'closure_type',l:'الإغلاق',o:CLOSURES},{k:'cuff_style',l:'الكبك',o:CUFFS},{k:'slit_style',l:'الفتحة',o:SLITS},{k:'embroidery_style',l:'التطريز',o:EMBROIDERY},{k:'lining_type',l:'البطانة',o:LINING}];

  if(loading)return<div><Header title="العميل" showBack/><div className="p-4 space-y-4">{[1,2,3].map(i=><div key={i} className="skel h-32 w-full"/>)}</div></div>;
  if(!cust)return<div><Header title="غير موجود" showBack/></div>;

  return <div>
    <Header title={cust.name} showBack/>
    <div className="p-4 space-y-4 pb-24">
      <Card><div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl">{cust.name.charAt(0)}</div><div><h2 className="text-lg font-bold">{cust.name}</h2><p className="text-sm text-srf-500" dir="ltr">{cust.phone}</p></div></div><div className="flex gap-2"><Button variant="wa" size="sm" icon={<MessageCircle className="w-4 h-4"/>} onClick={()=>sendWA(cust.phone,`مرحباً ${cust.name}`)} className="flex-1">واتساب</Button><Button variant="secondary" size="sm" icon={<Phone className="w-4 h-4"/>} onClick={()=>window.open(`tel:${cust.phone}`)} className="flex-1">اتصال</Button></div></Card>

      <div><div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-srf-800">المقاسات</h3><Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>{setEditing(null);setForm({label:'مقاس أساسي',pocket_count:2,closure_visible:true});setShowDes(false);setShowForm(true);}}>إضافة</Button></div>
        {showForm&&<Card className="mb-3 animate-scale-in !border-brand-200"><div className="flex items-center justify-between mb-3"><h4 className="text-sm font-bold">{editing?'تعديل':'مقاس جديد'}</h4><button onClick={()=>setShowForm(false)} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><X className="w-4 h-4 text-srf-500"/></button></div><div className="space-y-4">
          <Input label="التسمية" placeholder="ثوب رسمي" value={form.label||''} onChange={e=>uf('label',e.target.value)}/>
          <div><p className="text-xs font-bold text-brand-600 mb-2 flex items-center gap-1"><Ruler className="w-3.5 h-3.5"/>القياسات (سم)</p><div className="grid grid-cols-2 gap-3">{MFIELDS.map(f=><Input key={f.key} label={f.label} type="number" step="0.5" placeholder="—" value={form[f.key]||''} onChange={e=>uf(f.key,parseFloat(e.target.value)||null)} suffix="سم"/>)}</div></div>
          <div><button onClick={()=>setShowDes(!showDes)} className="w-full flex items-center justify-between py-2 text-sm font-bold text-brand-600"><span className="flex items-center gap-1"><Scissors className="w-3.5 h-3.5"/>تفاصيل التصميم</span>{showDes?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}</button>
            {showDes&&<div className="space-y-3 animate-fade-in">{desFields.map(f=><Select key={f.k} label={f.l} placeholder={`اختر`} value={form[f.k]||''} onChange={e=>uf(f.k,e.target.value)} options={f.o.map(o=>({value:o,label:o}))}/>)}
              <Input label="عدد الجيوب" type="number" min="0" max="6" value={form.pocket_count??2} onChange={e=>uf('pocket_count',parseInt(e.target.value)||0)}/>
              <div className="space-y-1.5"><label className="block text-sm font-medium text-srf-700">الإغلاق</label><div className="flex gap-2"><button onClick={()=>uf('closure_visible',true)} className={cn('flex-1 py-2 rounded-xl text-sm font-medium border',form.closure_visible===true?'bg-brand-50 border-brand-300 text-brand-700':'bg-white border-srf-200 text-srf-500')}>ظاهرة</button><button onClick={()=>uf('closure_visible',false)} className={cn('flex-1 py-2 rounded-xl text-sm font-medium border',form.closure_visible===false?'bg-brand-50 border-brand-300 text-brand-700':'bg-white border-srf-200 text-srf-500')}>مخفية</button></div></div>
              <Input label="لون التطريز" value={form.embroidery_color||''} onChange={e=>uf('embroidery_color',e.target.value)}/>
            </div>}
          </div>
          <Button size="sm" loading={saving} onClick={saveMsr} icon={<Save className="w-4 h-4"/>} className="w-full">حفظ</Button>
        </div></Card>}

        {msrs.length===0&&!showForm?<Card className="text-center py-8"><Ruler className="w-8 h-8 text-srf-300 mx-auto mb-2"/><p className="text-sm text-srf-500">لا مقاسات</p></Card>
        :msrs.map(m=>{const isE=exp===m.id;const hasDes=m.collar_type||m.pocket_style||m.closure_type||m.cuff_style||m.slit_style||m.embroidery_style||m.lining_type;
          return<Card key={m.id} className="!p-3 mb-2"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2 cursor-pointer" onClick={()=>setExp(isE?null:m.id)}><Ruler className="w-4 h-4 text-brand-500"/><span className="text-sm font-bold">{m.label}</span>{hasDes&&(isE?<ChevronUp className="w-3.5 h-3.5 text-srf-400"/>:<ChevronDown className="w-3.5 h-3.5 text-srf-400"/>)}</div><div className="flex gap-1"><button onClick={()=>{setEditing(m);setForm({...m});setShowDes(true);setShowForm(true);}} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 text-srf-500"/></button><button onClick={async()=>{await supabase.from('measurements').delete().eq('id',m.id);setMsrs(p=>p.filter((x:any)=>x.id!==m.id));}} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button></div></div>
            <div className="grid grid-cols-3 gap-2">{MFIELDS.map(f=>{const v=m[f.key];if(!v)return null;return<div key={f.key} className="bg-srf-50 rounded-lg px-2 py-1.5 text-center"><p className="text-[10px] text-srf-500">{f.label}</p><p className="text-sm font-semibold">{v} <span className="text-xs text-srf-400">سم</span></p></div>;})}</div>
            {isE&&hasDes&&<div className="mt-3 pt-3 border-t border-srf-100 animate-fade-in"><p className="text-xs font-bold text-brand-600 mb-2">التصميم</p><div className="grid grid-cols-2 gap-2">{m.collar_type&&<div className="bg-brand-50/50 rounded-lg px-2 py-1.5"><p className="text-[10px] text-srf-500">الياقة</p><p className="text-xs font-semibold">{m.collar_type}</p></div>}{m.pocket_style&&<div className="bg-brand-50/50 rounded-lg px-2 py-1.5"><p className="text-[10px] text-srf-500">الجيب</p><p className="text-xs font-semibold">{m.pocket_style} ({m.pocket_count})</p></div>}{m.closure_type&&<div className="bg-brand-50/50 rounded-lg px-2 py-1.5"><p className="text-[10px] text-srf-500">الإغلاق</p><p className="text-xs font-semibold">{m.closure_type} ({m.closure_visible?'ظاهرة':'مخفية'})</p></div>}{m.cuff_style&&<div className="bg-brand-50/50 rounded-lg px-2 py-1.5"><p className="text-[10px] text-srf-500">الكبك</p><p className="text-xs font-semibold">{m.cuff_style}</p></div>}{m.embroidery_style&&<div className="bg-brand-50/50 rounded-lg px-2 py-1.5"><p className="text-[10px] text-srf-500">التطريز</p><p className="text-xs font-semibold">{m.embroidery_style}</p></div>}{m.lining_type&&<div className="bg-brand-50/50 rounded-lg px-2 py-1.5"><p className="text-[10px] text-srf-500">البطانة</p><p className="text-xs font-semibold">{m.lining_type}</p></div>}</div></div>}
            {!isE&&hasDes&&<button onClick={()=>setExp(m.id)} className="mt-2 text-xs text-brand-500 font-medium">تفاصيل التصميم ←</button>}
          </Card>;})}
      </div>

      <div><h3 className="text-base font-bold text-srf-800 mb-3">الطلبات</h3>{ords.length===0?<Card className="text-center py-8"><Scissors className="w-8 h-8 text-srf-300 mx-auto mb-2"/><p className="text-sm text-srf-500">لا طلبات</p></Card>:<div className="space-y-2">{ords.map((o:any)=><Card key={o.id} hoverable onClick={()=>r.push(`/orders/${o.id}`)} className="!p-3"><div className="flex justify-between mb-1"><span className="text-sm font-semibold">#{o.order_number}</span><Badge status={o.status} size="sm"/></div><div className="flex justify-between text-xs text-srf-500"><span>{timeAgo(o.created_at)}</span><span className="font-semibold text-srf-700">{fmtCurrency(o.total_price)}</span></div></Card>)}</div>}</div>
    </div>
  </div>;
}
