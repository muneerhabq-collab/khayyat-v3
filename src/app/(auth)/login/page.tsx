'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Scissors } from 'lucide-react';
export default function Login() {
  const r=useRouter(); const [email,setEmail]=useState(''); const [pw,setPw]=useState(''); const [loading,setLoading]=useState(false); const [err,setErr]=useState('');
  async function go(e:React.FormEvent) { e.preventDefault(); setErr(''); setLoading(true); const {error}=await signIn(email,pw); if(error){setErr('بيانات غير صحيحة');setLoading(false);return;} r.replace('/dashboard'); }
  return <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-srf-50"><div className="w-full max-w-sm animate-slide-up"><div className="text-center mb-10"><div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25"><Scissors className="w-10 h-10 text-white"/></div><h1 className="text-3xl font-bold text-srf-900">خيّاط</h1><p className="text-srf-500 mt-1">تسجيل الدخول</p></div><form onSubmit={go} className="space-y-4"><Input label="البريد الإلكتروني" type="email" value={email} onChange={e=>setEmail(e.target.value)} icon={<Mail className="w-4 h-4"/>} required dir="ltr"/><Input label="كلمة المرور" type="password" value={pw} onChange={e=>setPw(e.target.value)} icon={<Lock className="w-4 h-4"/>} required dir="ltr"/>{err&&<div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{err}</div>}<Button type="submit" loading={loading} className="w-full" size="lg">تسجيل الدخول</Button></form><p className="text-center text-sm text-srf-500 mt-6">ما عندك حساب؟ <Link href="/register" className="text-brand-600 font-semibold">سجّل الآن</Link></p></div></div>;
}
