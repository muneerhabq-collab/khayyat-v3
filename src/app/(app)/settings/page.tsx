'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/use-store';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogOut, Store, Scissors, Users, Plus, Building2, X, Trash2, Truck, ChevronLeft, UserPlus } from 'lucide-react';

const ROLES: Record<string,string> = {owner:'مالك',manager:'مدير',receptionist:'استقبال',tailor:'خيّاط'};
const BTYPES = [{value:'branch',label:'فرع'},{value:'warehouse',label:'مستودع'},{value:'workshop',label:'معمل'}];
const ROLE_OPTS = [{value:'manager',label:'مدير'},{value:'receptionist',label:'استقبال'},{value:'tailor',label:'خيّاط'}];

export default function Settings() {
  const r=useRouter(); const {store,member,members,branches,refresh}=useStore();
  const [showAddBranch,setShowAddBranch]=useState(false);
  const [showAddMember,setShowAddMember]=useState(false);
  const [bName,setBName]=useState(''); const [bType,setBType]=useState('branch');
  const [mName,setMName]=useState(''); const [mRole,setMRole]=useState('receptionist'); const [mBranch,setMBranch]=useState('');
  const [mEmail,setMEmail]=useState(''); const [mPw,setMPw]=useState('');
  const [saving,setSaving]=useState(false); const [error,setError]=useState('');

  async function addBranch(){
    if(!bName||!store)return; setSaving(true);
    await supabase.from('branches').insert({store_id:store.id,name:bName,branch_type:bType});
    setBName('');setShowAddBranch(false);setSaving(false);refresh();
  }

  async function addMember(){
    if(!mName||!mEmail||!mPw||!store)return;
    if(mPw.length<6){setError('كلمة المرور ٦ أحرف على الأقل');return;}
    setSaving(true); setError('');
    // Create auth user
    const{data:authData,error:authErr}=await supabase.auth.signUp({email:mEmail,password:mPw,options:{data:{full_name:mName,shop_name:store.name}}});
    if(authErr){setError(authErr.message.includes('already')?'الإيميل مسجل':'خطأ في إنشاء الحساب');setSaving(false);return;}
    // The trigger will create a new store for them — we need to move them to our store instead
    if(authData.user){
      // Delete their auto-created store
      setTimeout(async()=>{
        await supabase.from('store_members').delete().eq('user_id',authData.user!.id);
        await supabase.from('stores').delete().eq('owner_id',authData.user!.id);
        // Add to our store
        await supabase.from('store_members').insert({store_id:store.id,user_id:authData.user!.id,role:mRole,display_name:mName,branch_id:mBranch||null});
        refresh();
      }, 1000);
    }
    setShowAddMember(false);setMName('');setMEmail('');setMPw('');setSaving(false);
  }

  return <div><Header title="الإعدادات"/>
    <div className="p-4 space-y-4">
      {/* Store Info */}
      <Card><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl">{store?.name?.charAt(0)||'?'}</div><div><h2 className="text-lg font-bold">{store?.name}</h2><p className="text-sm text-srf-500">{member?.display_name} · {ROLES[member?.role||'']}</p></div></div></Card>

      {/* Quick Links */}
      <Card hoverable onClick={()=>r.push('/suppliers')} className="!p-3">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center"><Truck className="w-5 h-5 text-orange-600"/></div><span className="text-sm font-medium text-srf-700">الموردين</span></div><ChevronLeft className="w-4 h-4 text-srf-400"/></div>
      </Card>

      {/* Branches */}
      <div>
        <div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-srf-800 flex items-center gap-2"><Building2 className="w-5 h-5"/>الفروع والمعامل</h3><Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>setShowAddBranch(true)}>إضافة</Button></div>
        {showAddBranch&&<Card className="mb-3 animate-scale-in !border-brand-200"><div className="flex justify-between mb-3"><h4 className="text-sm font-bold">إضافة موقع</h4><button onClick={()=>setShowAddBranch(false)}><X className="w-4 h-4"/></button></div><div className="space-y-3"><Input label="الاسم" placeholder="فرع الشمال" value={bName} onChange={e=>setBName(e.target.value)}/><Select label="النوع" value={bType} onChange={e=>setBType(e.target.value)} options={BTYPES}/><Button size="sm" loading={saving} onClick={addBranch} className="w-full">حفظ</Button></div></Card>}
        <div className="space-y-2">{branches.map(b=><Card key={b.id} className="!p-3"><div className="flex items-center justify-between"><div><p className="text-sm font-bold">{b.name}</p><p className="text-xs text-srf-500">{b.branch_type==='branch'?'فرع':b.branch_type==='warehouse'?'مستودع':'معمل'}{b.is_main?' · رئيسي':''}</p></div>{!b.is_main&&<button onClick={async()=>{await supabase.from('branches').delete().eq('id',b.id);refresh();}} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>}</div></Card>)}</div>
      </div>

      {/* Team */}
      <div>
        <div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-srf-800 flex items-center gap-2"><Users className="w-5 h-5"/>فريق العمل</h3><Button variant="ghost" size="sm" icon={<UserPlus className="w-4 h-4"/>} onClick={()=>setShowAddMember(true)}>إضافة موظف</Button></div>
        {showAddMember&&<Card className="mb-3 animate-scale-in !border-brand-200"><div className="flex justify-between mb-3"><h4 className="text-sm font-bold">إضافة موظف</h4><button onClick={()=>{setShowAddMember(false);setError('');}}><X className="w-4 h-4"/></button></div><div className="space-y-3">
          <Input label="اسم الموظف" value={mName} onChange={e=>setMName(e.target.value)}/>
          <Input label="إيميل الموظف" type="email" value={mEmail} onChange={e=>setMEmail(e.target.value)} dir="ltr" placeholder="staff@email.com"/>
          <Input label="كلمة مرور مؤقتة" type="password" value={mPw} onChange={e=>setMPw(e.target.value)} dir="ltr" placeholder="٦ أحرف على الأقل"/>
          <Select label="الدور" value={mRole} onChange={e=>setMRole(e.target.value)} options={ROLE_OPTS}/>
          {branches.length>1&&<Select label="الفرع" value={mBranch} onChange={e=>setMBranch(e.target.value)} options={[{value:'',label:'كل الفروع'},...branches.map(b=>({value:b.id,label:b.name}))]}/>}
          {error&&<div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{error}</div>}
          <Button size="sm" loading={saving} onClick={addMember} className="w-full" icon={<UserPlus className="w-4 h-4"/>}>إنشاء حساب الموظف</Button>
          <p className="text-xs text-srf-500 text-center">بيتم إنشاء حساب جديد للموظف بالإيميل وكلمة المرور المحددة</p>
        </div></Card>}
        <div className="space-y-2">{members.map(m=>{const br=branches.find(b=>b.id===m.branch_id); return<Card key={m.id} className="!p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">{m.display_name.charAt(0)}</div><div><p className="text-sm font-bold">{m.display_name}</p><p className="text-xs text-srf-500">{ROLES[m.role]}{br?` · ${br.name}`:''}</p></div></div>{m.role!=='owner'&&<button onClick={async()=>{await supabase.from('store_members').delete().eq('id',m.id);refresh();}} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>}</div></Card>;})}</div>
      </div>

      <Card><div className="text-center py-4"><div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-50 flex items-center justify-center"><Scissors className="w-6 h-6 text-brand-600"/></div><h3 className="text-base font-bold">خيّاط</h3><p className="text-xs text-srf-500 mt-1">v3.0</p></div></Card>
      <Button variant="danger" size="lg" icon={<LogOut className="w-5 h-5"/>} onClick={async()=>{await signOut();r.replace('/login');}} className="w-full">تسجيل الخروج</Button>
    </div>
  </div>;
}
