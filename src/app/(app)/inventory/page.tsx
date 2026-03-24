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
import { Plus, Search, Package, AlertTriangle, X, Save, Edit3, Trash2, Layers, ArrowUp, ArrowDown, ArrowLeftRight, Truck } from 'lucide-react';

export default function Inventory() {
  const {store,branches}=useStore();
  const [fabrics,setFabrics]=useState<any[]>([]); const [suppliers,setSuppliers]=useState<any[]>([]);
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState('');
  const [tab,setTab]=useState<'fabrics'|'transfer'>('fabrics');
  const [showAdd,setShowAdd]=useState(false); const [editItem,setEditItem]=useState<any>(null);
  const [form,setForm]=useState({name:'',fabric_type:'',color:'',sku:'',price:0,meters:0,min_alert:10,supplier_id:'',branch_id:'',default_meters:3});
  const [saving,setSaving]=useState(false);
  const [adjId,setAdjId]=useState<string|null>(null); const [adjType,setAdjType]=useState<'add'|'deduct'>('add'); const [adjM,setAdjM]=useState(0); const [adjBranch,setAdjBranch]=useState('');
  // Transfer
  const [showTransfer,setShowTransfer]=useState(false); const [txFabric,setTxFabric]=useState(''); const [txFrom,setTxFrom]=useState(''); const [txTo,setTxTo]=useState(''); const [txMeters,setTxMeters]=useState(0);

  useEffect(()=>{if(store)load();},[store]);

  async function load(){
    const [fabRes,supRes]=await Promise.all([
      supabase.from('fabrics').select('*, supplier:suppliers(*), stock:fabric_stock(*)').eq('store_id',store!.id).order('name'),
      supabase.from('suppliers').select('*').eq('store_id',store!.id).eq('is_active',true).order('name'),
    ]);
    if(fabRes.data) setFabrics(fabRes.data);
    if(supRes.data) setSuppliers(supRes.data);
    setLoading(false);
  }

  function getStock(f:any, branchId?:string):number {
    if(!f.stock) return 0;
    if(branchId) return f.stock.find((s:any)=>s.branch_id===branchId)?.meters_in_stock||0;
    return f.stock.reduce((sum:number,s:any)=>sum+(s.meters_in_stock||0),0);
  }

  async function saveFabric(){
    if(!form.name||!form.fabric_type||!store) return; setSaving(true);
    const d:any = {store_id:store.id, name:form.name, fabric_type:form.fabric_type, color:form.color||null, sku:form.sku||null, price_per_meter:form.price, min_stock_alert:form.min_alert, supplier_id:form.supplier_id||null, default_meters_per_thobe:form.default_meters};
    if(editItem){
      await supabase.from('fabrics').update(d).eq('id',editItem.id);
    } else {
      const{data:newF}=await supabase.from('fabrics').insert(d).select().single();
      if(newF && form.meters > 0){
        const branchId = form.branch_id || null;
        await supabase.from('fabric_stock').insert({fabric_id:newF.id, store_id:store.id, branch_id:branchId, meters_in_stock:form.meters});
        await supabase.from('fabric_transactions').insert({fabric_id:newF.id, store_id:store.id, to_branch_id:branchId, transaction_type:'add', meters:form.meters, note:'مخزون أولي'});
      }
    }
    setShowAdd(false); setSaving(false); setEditItem(null); load();
  }

  async function adjustStock(){
    if(!adjId||adjM<=0||!store) return; setSaving(true);
    const branchId = adjBranch || null;
    const{data:existing}=await supabase.from('fabric_stock').select('*').eq('fabric_id',adjId).is('branch_id',branchId).limit(1).maybeSingle();
    const oldStock = existing?.meters_in_stock || 0;
    const newStock = adjType==='add' ? oldStock+adjM : Math.max(0,oldStock-adjM);
    if(existing){
      await supabase.from('fabric_stock').update({meters_in_stock:newStock}).eq('id',existing.id);
    } else {
      await supabase.from('fabric_stock').insert({fabric_id:adjId, store_id:store.id, branch_id:branchId, meters_in_stock:newStock});
    }
    await supabase.from('fabric_transactions').insert({fabric_id:adjId, store_id:store.id, to_branch_id:branchId, transaction_type:adjType, meters:adjM});
    setAdjId(null); setAdjM(0); setSaving(false); load();
  }

  async function transferStock(){
    if(!txFabric||!txFrom||!txTo||txMeters<=0||!store||txFrom===txTo) return; setSaving(true);
    const fromBranch = txFrom==='main'?null:txFrom;
    const toBranch = txTo==='main'?null:txTo;
    // Deduct from source
    const{data:src}=await supabase.from('fabric_stock').select('*').eq('fabric_id',txFabric).is('branch_id',fromBranch).limit(1).maybeSingle();
    if(src){
      await supabase.from('fabric_stock').update({meters_in_stock:Math.max(0,src.meters_in_stock-txMeters)}).eq('id',src.id);
    }
    // Add to destination
    const{data:dst}=await supabase.from('fabric_stock').select('*').eq('fabric_id',txFabric).is('branch_id',toBranch).limit(1).maybeSingle();
    if(dst){
      await supabase.from('fabric_stock').update({meters_in_stock:dst.meters_in_stock+txMeters}).eq('id',dst.id);
    } else {
      await supabase.from('fabric_stock').insert({fabric_id:txFabric, store_id:store.id, branch_id:toBranch, meters_in_stock:txMeters});
    }
    await supabase.from('fabric_transactions').insert({fabric_id:txFabric, store_id:store.id, from_branch_id:fromBranch, to_branch_id:toBranch, transaction_type:'transfer', meters:txMeters, note:`نقل مخزون`});
    setShowTransfer(false); setTxMeters(0); setSaving(false); load();
  }

  const fc=fabrics.filter(f=>!search||f.name.includes(search)||f.color?.includes(search)||f.supplier?.name?.includes(search));
  const totalVal=fabrics.reduce((s,f)=>s+(getStock(f)*f.price_per_meter),0);
  const lowCount=fabrics.filter(f=>getStock(f)<=f.min_stock_alert&&f.is_active).length;
  const branchOpts=[{value:'',label:'المستودع الرئيسي'},...branches.map(b=>({value:b.id,label:b.name}))];
  const txBranchOpts=[{value:'main',label:'المستودع الرئيسي'},...branches.map(b=>({value:b.id,label:b.name}))];

  return <div>
    <Header title="المخزون" action={<div className="flex gap-2"><Button variant="secondary" size="sm" icon={<ArrowLeftRight className="w-4 h-4"/>} onClick={()=>setShowTransfer(true)}>نقل</Button><Button size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>{setEditItem(null);setForm({name:'',fabric_type:'',color:'',sku:'',price:0,meters:0,min_alert:10,supplier_id:'',branch_id:'',default_meters:3});setShowAdd(true);}}>إضافة</Button></div>}/>
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-srf-200/60 rounded-xl p-3 text-center shadow-sm"><p className="text-lg font-bold">{fabrics.length}</p><p className="text-[10px] text-srf-500">نوع</p></div>
        <div className="bg-white border border-srf-200/60 rounded-xl p-3 text-center shadow-sm"><p className="text-lg font-bold">{fmtCurrency(totalVal)}</p><p className="text-[10px] text-srf-500">القيمة</p></div>
        <div className={cn('border rounded-xl p-3 text-center shadow-sm',lowCount>0?'bg-red-50 border-red-200':'bg-white border-srf-200/60')}><p className={cn('text-lg font-bold',lowCount>0?'text-red-600':'')}>{lowCount}</p><p className="text-[10px] text-srf-500">منخفض</p></div>
      </div>
      <Input placeholder="ابحث بالاسم أو المورد..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search className="w-4 h-4"/>}/>

      {/* Transfer Form */}
      {showTransfer&&<Card className="animate-scale-in !border-purple-200 !bg-purple-50/30">
        <div className="flex justify-between mb-3"><h4 className="text-sm font-bold flex items-center gap-2"><ArrowLeftRight className="w-4 h-4 text-purple-600"/>نقل مخزون بين المواقع</h4><button onClick={()=>setShowTransfer(false)}><X className="w-4 h-4"/></button></div>
        <div className="space-y-3">
          <Select label="القماش" value={txFabric} onChange={e=>setTxFabric(e.target.value)} options={fabrics.map(f=>({value:f.id,label:`${f.name} (${getStock(f)} متر)`}))} placeholder="اختر"/>
          <div className="grid grid-cols-2 gap-3">
            <Select label="من" value={txFrom} onChange={e=>setTxFrom(e.target.value)} options={txBranchOpts} placeholder="اختر"/>
            <Select label="إلى" value={txTo} onChange={e=>setTxTo(e.target.value)} options={txBranchOpts} placeholder="اختر"/>
          </div>
          <Input label="الكمية" type="number" min="0.5" step="0.5" value={txMeters||''} onChange={e=>setTxMeters(parseFloat(e.target.value)||0)} suffix="متر"/>
          <Button size="sm" loading={saving} onClick={transferStock} className="w-full" icon={<ArrowLeftRight className="w-4 h-4"/>}>تنفيذ النقل</Button>
        </div>
      </Card>}

      {/* Add/Edit Fabric */}
      {showAdd&&<Card className="animate-scale-in !border-brand-200">
        <div className="flex justify-between mb-3"><h4 className="text-sm font-bold">{editItem?'تعديل':'قماش جديد'}</h4><button onClick={()=>setShowAdd(false)}><X className="w-4 h-4"/></button></div>
        <div className="space-y-3">
          <Input label="اسم القماش" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
          <div className="grid grid-cols-2 gap-3">
            <Select label="النوع" value={form.fabric_type} onChange={e=>setForm(p=>({...p,fabric_type:e.target.value}))} options={FABRICS.map(t=>({value:t,label:t}))} placeholder="اختر"/>
            <Input label="اللون" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))}/>
          </div>
          <Select label="المورد" value={form.supplier_id} onChange={e=>setForm(p=>({...p,supplier_id:e.target.value}))} options={[{value:'',label:'بدون مورد'},...suppliers.map(s=>({value:s.id,label:s.name}))]}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="سعر/متر" type="number" value={form.price||''} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)||0}))} suffix="ر.س"/>
            <Input label="متر/ثوب" type="number" value={form.default_meters} onChange={e=>setForm(p=>({...p,default_meters:parseFloat(e.target.value)||3}))} suffix="متر"/>
          </div>
          {!editItem&&<><Select label="الموقع" value={form.branch_id} onChange={e=>setForm(p=>({...p,branch_id:e.target.value}))} options={branchOpts}/>
          <Input label="الكمية الأولية" type="number" value={form.meters||''} onChange={e=>setForm(p=>({...p,meters:parseFloat(e.target.value)||0}))} suffix="متر"/></>}
          <Input label="تنبيه عند" type="number" value={form.min_alert} onChange={e=>setForm(p=>({...p,min_alert:parseFloat(e.target.value)||10}))} suffix="متر"/>
          <Button size="sm" loading={saving} onClick={saveFabric} icon={<Save className="w-4 h-4"/>} className="w-full">حفظ</Button>
        </div>
      </Card>}

      {/* Adjust Stock */}
      {adjId&&<Card className="animate-scale-in !border-blue-200 !bg-blue-50/30">
        <div className="flex justify-between mb-3"><h4 className="text-sm font-bold">تعديل المخزون</h4><button onClick={()=>setAdjId(null)}><X className="w-4 h-4"/></button></div>
        <div className="space-y-3">
          <Select label="الموقع" value={adjBranch} onChange={e=>setAdjBranch(e.target.value)} options={branchOpts}/>
          <div className="flex gap-2">
            <button onClick={()=>setAdjType('add')} className={cn('flex-1 py-2 rounded-xl text-sm font-medium border flex items-center justify-center gap-1',adjType==='add'?'bg-green-50 border-green-300 text-green-700':'bg-white border-srf-200')}><ArrowUp className="w-3.5 h-3.5"/>إضافة</button>
            <button onClick={()=>setAdjType('deduct')} className={cn('flex-1 py-2 rounded-xl text-sm font-medium border flex items-center justify-center gap-1',adjType==='deduct'?'bg-red-50 border-red-300 text-red-700':'bg-white border-srf-200')}><ArrowDown className="w-3.5 h-3.5"/>خصم</button>
          </div>
          <Input label="الكمية" type="number" min="0.5" step="0.5" value={adjM||''} onChange={e=>setAdjM(parseFloat(e.target.value)||0)} suffix="متر"/>
          <Button size="sm" loading={saving} onClick={adjustStock} className="w-full">تأكيد</Button>
        </div>
      </Card>}

      {/* Fabric List */}
      {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skel h-24 w-full"/>)}</div>
      :fc.length===0?<Empty icon={<Package className="w-8 h-8"/>} title="لا أقمشة" action={<Button icon={<Plus className="w-4 h-4"/>} onClick={()=>setShowAdd(true)}>إضافة</Button>}/>
      :<div className="space-y-2">{fc.map(f=>{const stock=getStock(f);const low=stock<=f.min_stock_alert;
        return<Card key={f.id} className={cn('!p-3',low&&'!border-red-200')}>
          <div className="flex items-start justify-between mb-2">
            <div><div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-bold truncate">{f.name}</span>{low&&<AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0"/>}</div>
              <p className="text-xs text-srf-500">{f.fabric_type}{f.color&&` · ${f.color}`}{f.supplier&&` · ${f.supplier.name}`}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={()=>{setAdjId(f.id);setAdjType('add');setAdjM(0);setAdjBranch('');}} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-blue-500"/></button>
              <button onClick={()=>{setEditItem(f);setForm({name:f.name,fabric_type:f.fabric_type,color:f.color||'',sku:f.sku||'',price:f.price_per_meter,meters:0,min_alert:f.min_stock_alert,supplier_id:f.supplier_id||'',branch_id:'',default_meters:f.default_meters_per_thobe||3});setShowAdd(true);}} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 text-srf-500"/></button>
              <button onClick={async()=>{await supabase.from('fabrics').delete().eq('id',f.id);load();}} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold',low?'bg-red-50 text-red-600':'bg-green-50 text-green-700')}>{stock} متر</div>
            <span className="text-xs text-srf-500">{fmtCurrency(f.price_per_meter)}/م · {f.default_meters_per_thobe||3}م/ثوب</span>
          </div>
          {/* Per-branch breakdown */}
          {f.stock&&f.stock.length>1&&<div className="mt-2 pt-2 border-t border-srf-100 flex flex-wrap gap-2">{f.stock.map((s:any)=>{const br=branches.find(b=>b.id===s.branch_id);return<span key={s.id} className="text-[10px] bg-srf-50 px-2 py-0.5 rounded">{br?.name||'الرئيسي'}: {s.meters_in_stock}م</span>;})}</div>}
        </Card>;})}</div>}
    </div>
  </div>;
}
