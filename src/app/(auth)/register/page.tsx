'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Store, Scissors } from 'lucide-react';
export default function Register() {
  const r=useRouter(); const [f,sF]=useState({name:'',shop:'',email:'',pw:''}); const [loading,sL]=useState(false); const [err,sE]=useState('');
  const u=(k:string,v:string)=>sF(p=>({...p,[k]:v}));
  async function go(e:React.FormEvent) { e.preventDefault(); sE(''); if(f.pw.length<6){sE('كلمة المرور ٦ أحرف على الأقل');return;} if(!f.shop){sE('اسم المحل مطلوب');return;} sL(true); const {error}=await signUp(f.email,f.pw,f.name,f.shop); if(error){sE(error.message.includes('already')?'البريد مسجل':'حدث خطأ');sL(false);return;} r.replace('/dashboard'); }
  return <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-srf-50"><div className="w-full max-w-sm animate-slide-up"><div className="text-center mb-8"><div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25"><Scissors className="w-8 h-8 text-white"/></div><h1 className="text-2xl font-bold">حساب جديد</h1></div><form onSubmit={go} className="space-y-4"><Input label="الاسم" placeholder="محمد أحمد" value={f.name} onChange={e=>u('name',e.target.value)} icon={<User className="w-4 h-4"/>} required/><Input label="اسم المحل" placeholder="مشغل الأناقة" value={f.shop} onChange={e=>u('shop',e.target.value)} icon={<Store className="w-4 h-4"/>} required/><Input label="البريد" type="email" value={f.email} onChange={e=>u('email',e.target.value)} icon={<Mail className="w-4 h-4"/>} required dir="ltr"/><Input label="كلمة المرور" type="password" placeholder="٦ أحرف على الأقل" value={f.pw} onChange={e=>u('pw',e.target.value)} icon={<Lock className="w-4 h-4"/>} required dir="ltr"/>{err&&<div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{err}</div>}<Button type="submit" loading={loading} className="w-full" size="lg">إنشاء حساب مجاني</Button></form><p className="text-center text-sm text-srf-500 mt-6">عندك حساب؟ <Link href="/login" className="text-brand-600 font-semibold">دخول</Link></p></div></div>;
}
