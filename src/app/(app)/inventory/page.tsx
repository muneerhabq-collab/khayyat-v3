'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { fmtCurrency, cn, FABRICS } from '@/lib/utils';
import { Plus, Search, Package, AlertTriangle, X, Save, Edit3, Trash2, Layers, ArrowUp, ArrowDown } from 'lucide-react';

export default function Inventory() {
  const {store}=useStore();
  const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState('');
  const [showAdd,setShowAdd]=useState(false); const [editItem,setEditItem]=useState<any>(null);
  const [form,setForm]=useState({name:'',fabric_type:'',color:'',price:0,meters:0,min_alert:10});
  const [saving,setSaving]=useState(false);
  const [adjId,setAdjId]=useState<string|null>(null); const [adjType,setAdjType]=useState<'add'|'deduct'>('add'); const [adjM,setAdjM]=useState(0);

  useEffect(()=>{if(store)load();},[store]);
  async function load(){const{data}=await supabase.from('fabrics').select('*').eq('store_id',store!.id).order('name');if(data)setItems(data);setLoading(false);}

  async function save(){if(!form.name||!form.fabric_type||!store)return;setSaving(true);
    if(editItem){await supabase.from('fabrics').update({name:form.name,fabric_type:form.fabric_type,color:form.color||null,price_per_meter:form.price,min_stock_alert:form.min_alert}).eq('id',editItem.id);}
    else{const{data}=await supabase.from('fabrics').insert({store_id:store.id,name:form.name,fabric_type:form.fabric_type,color:form.color||null,price_per_meter:form.price,meters_in_stock:form.meters,min_stock_alert:form.min_alert}).select().single();
      if(data&&form.meters>0)await supabase.from('fabric_transactions').insert({fabric_id:data.id,store_id:store.id,transaction_type:'add',meters:form.meters,note:'مخزون أولي'});}
    setShowAdd(false);setSaving(false);setEditItem(null);load();}

  async function adjust(){if(!adjId||adjM<=0||!store)return;setSaving(true);const f=items.find(x=>x.id===adjId);if(!f)return;
    const ns=adjType==='add'?f.meters_in_stock+adjM:Math.max(0,f.meters_in_stock-adjM);
    await supabase.from('fabrics').update({meters_in_stock:ns}).eq('id',adjId);
    await supabase.from('fabric_transactions').insert({fabric_id:adjId,store_id:store.id,transaction_type:adjType,meters:adjM});
    setAdjId(null);setAdjM(0);setSaving(false);load();}

  const fc=items.filter(f=>!search||f.name.includes(search)||f.color?.includes(search));
  const totalVal=items.reduce((s,f)=>s+(f.meters_in_stock*f.price_per_meter),0);
  const lowCount=items.filter(f=>f.meters_in_stock<=f.min_stock_alert&&f.is_active).length;

  return <div>
    <Header title="المخزون" action={<Button size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>{setEditItem(null);setForm({name:'',fabric_type:'',color:'',price:0,meters:0,min_alert:10});setShowAdd(true);}}>إضافة</Button>}/>
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-srf-200/60 rounded-xl p-3 text-center shadow-sm"><p className="text-lg font-bold">{items.length}</p><p className="text-[10px] text-srf-500">نوع</p></div>
        <div className="bg-white border border-srf-200/60 rounded-xl p-3 text-center shadow-sm"><p className="text-lg font-bold">{fmtCurrency(totalVal)}</p><p className="text-[10px] text-srf-500">القيمة</p></div>
        <div className={cn('border rounded-xl p-3 text-center shadow-sm',lowCount>0?'bg-red-50 border-red-200':'bg-white border-srf-200/60')}><p className={cn('text-lg font-bold',lowCount>0?'text-red-600':'')}>{lowCount}</p><p className="text-[10px] text-srf-500">منخفض</p></div>
      </div>
      <Input placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search className="w-4 h-4"/>}/>
      {showAdd&&<Card className="animate-scale-in !border-brand-200"><div className="flex justify-between mb-3"><h4 className="text-sm font-bold">{editItem?'تعديل':'قماش جديد'}</h4><button onClick={()=>setShowAdd(false)} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><X className="w-4 h-4"/></button></div><div className="space-y-3"><Input label="الاسم" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/><div className="grid grid-cols-2 gap-3"><Select label="النوع" value={form.fabric_type} onChange={e=>setForm(p=>({...p,fabric_type:e.target.value}))} options={FABRICS.map(t=>({value:t,label:t}))} placeholder="اختر"/><Input label="اللون" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))}/></div><div className="grid grid-cols-2 gap-3"><Input label="سعر/متر" type="number" value={form.price||''} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)||0}))} suffix="ر.س"/>{!editItem&&<Input label="الكمية" type="number" value={form.meters||''} onChange={e=>setForm(p=>({...p,meters:parseFloat(e.target.value)||0}))} suffix="متر"/>}</div><Button size="sm" loading={saving} onClick={save} icon={<Save className="w-4 h-4"/>} className="w-full">حفظ</Button></div></Card>}
      {adjId&&<Card className="animate-scale-in !border-blue-200 !bg-blue-50/30"><div className="flex justify-between mb-3"><h4 className="text-sm font-bold">تعديل المخزون</h4><button onClick={()=>setAdjId(null)} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><X className="w-4 h-4"/></button></div><div className="space-y-3"><div className="flex gap-2"><button onClick={()=>setAdjType('add')} className={cn('flex-1 py-2 rounded-xl text-sm font-medium border flex items-center justify-center gap-1',adjType==='add'?'bg-green-50 border-green-300 text-green-700':'bg-white border-srf-200 text-srf-500')}><ArrowUp className="w-3.5 h-3.5"/>إضافة</button><button onClick={()=>setAdjType('deduct')} className={cn('flex-1 py-2 rounded-xl text-sm font-medium border flex items-center justify-center gap-1',adjType==='deduct'?'bg-red-50 border-red-300 text-red-700':'bg-white border-srf-200 text-srf-500')}><ArrowDown className="w-3.5 h-3.5"/>خصم</button></div><Input label="الكمية" type="number" min="0.5" step="0.5" value={adjM||''} onChange={e=>setAdjM(parseFloat(e.target.value)||0)} suffix="متر"/><Button size="sm" loading={saving} onClick={adjust} className="w-full">تأكيد</Button></div></Card>}
      {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skel h-24 w-full"/>)}</div>
      :fc.length===0?<Empty icon={<Package className="w-8 h-8"/>} title="لا أقمشة" action={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>setShowAdd(true)}>إضافة</Button>}/>
      :<div className="space-y-2">{fc.map(f=>{const low=f.meters_in_stock<=f.min_stock_alert;return<Card key={f.id} className={cn('!p-3',low&&'!border-red-200')}><div className="flex items-start justify-between mb-2"><div><div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-bold truncate">{f.name}</span>{low&&<AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0"/>}</div><p className="text-xs text-srf-500">{f.fabric_type}{f.color&&` · ${f.color}`}</p></div><div className="flex gap-1 shrink-0"><button onClick={()=>{setAdjId(f.id);setAdjType('add');setAdjM(0);}} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-blue-500"/></button><button onClick={()=>{setEditItem(f);setForm({name:f.name,fabric_type:f.fabric_type,color:f.color||'',price:f.price_per_meter,meters:0,min_alert:f.min_stock_alert});setShowAdd(true);}} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 text-srf-500"/></button><button onClick={async()=>{await supabase.from('fabrics').delete().eq('id',f.id);load();}} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button></div></div><div className="flex justify-between"><div className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold',low?'bg-red-50 text-red-600':'bg-green-50 text-green-700')}>{f.meters_in_stock} متر</div><span className="text-xs text-srf-500">{fmtCurrency(f.price_per_meter)}/م</span></div></Card>;})}</div>}
    </div>
  </div>;
}
