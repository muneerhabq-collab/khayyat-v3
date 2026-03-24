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
import { LogOut, Store, MapPin, Scissors, Users, Plus, Building2, X, Trash2 } from 'lucide-react';

const ROLES: Record<string,string> = {owner:'مالك',manager:'مدير',receptionist:'استقبال',tailor:'خيّاط'};
const BTYPES = [{value:'branch',label:'فرع'},{value:'warehouse',label:'مستودع'},{value:'workshop',label:'معمل'}];

export default function Settings() {
  const r=useRouter(); const {store,member,members,branches,refresh}=useStore();
  const [showAddMember,setShowAddMember]=useState(false);
  const [showAddBranch,setShowAddBranch]=useState(false);
  const [mName,setMName]=useState(''); const [mEmail,setMEmail]=useState(''); const [mRole,setMRole]=useState('receptionist');
  const [bName,setBName]=useState(''); const [bType,setBType]=useState('branch');
  const [saving,setSaving]=useState(false);

  async function addBranch() {
    if(!bName||!store) return; setSaving(true);
    await supabase.from('branches').insert({store_id:store.id,name:bName,branch_type:bType});
    setBName('');setShowAddBranch(false);setSaving(false);refresh();
  }

  return <div><Header title="الإعدادات"/>
    <div className="p-4 space-y-4">
      {/* Store Info */}
      <Card><div className="flex items-center gap-4 mb-2"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl">{store?.name?.charAt(0)||'?'}</div><div><h2 className="text-lg font-bold">{store?.name}</h2><p className="text-sm text-srf-500">{member?.display_name} · {ROLES[member?.role||'']}</p></div></div></Card>

      {/* Branches */}
      <div>
        <div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-srf-800 flex items-center gap-2"><Building2 className="w-5 h-5"/>الفروع والمعامل</h3><Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4"/>} onClick={()=>setShowAddBranch(true)}>إضافة</Button></div>
        {showAddBranch&&<Card className="mb-3 animate-scale-in !border-brand-200"><div className="flex justify-between mb-3"><h4 className="text-sm font-bold">فرع/مستودع/معمل جديد</h4><button onClick={()=>setShowAddBranch(false)} className="w-7 h-7 rounded-lg hover:bg-srf-100 flex items-center justify-center"><X className="w-4 h-4"/></button></div><div className="space-y-3"><Input label="الاسم" placeholder="فرع الشمال" value={bName} onChange={e=>setBName(e.target.value)}/><Select label="النوع" value={bType} onChange={e=>setBType(e.target.value)} options={BTYPES}/><Button size="sm" loading={saving} onClick={addBranch} className="w-full">حفظ</Button></div></Card>}
        <div className="space-y-2">{branches.map(b=><Card key={b.id} className="!p-3"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-srf-800">{b.name}</p><p className="text-xs text-srf-500">{b.branch_type==='branch'?'فرع':b.branch_type==='warehouse'?'مستودع':'معمل'}{b.is_main?' · رئيسي':''}</p></div>{!b.is_main&&<button onClick={async()=>{await supabase.from('branches').delete().eq('id',b.id);refresh();}} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>}</div></Card>)}</div>
      </div>

      {/* Team */}
      <div>
        <div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-srf-800 flex items-center gap-2"><Users className="w-5 h-5"/>فريق العمل</h3></div>
        <div className="space-y-2">{members.map(m=><Card key={m.id} className="!p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">{m.display_name.charAt(0)}</div><div><p className="text-sm font-bold text-srf-800">{m.display_name}</p><p className="text-xs text-srf-500">{ROLES[m.role]}</p></div></div></div></Card>)}</div>
      </div>

      {/* App Info */}
      <Card><div className="text-center py-4"><div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-50 flex items-center justify-center"><Scissors className="w-6 h-6 text-brand-600"/></div><h3 className="text-base font-bold">خيّاط</h3><p className="text-xs text-srf-500 mt-1">v3.0 — نظام إدارة محلات الخياطة</p></div></Card>

      <Button variant="danger" size="lg" icon={<LogOut className="w-5 h-5"/>} onClick={async()=>{await signOut();r.replace('/login');}} className="w-full">تسجيل الخروج</Button>
    </div>
  </div>;
}
