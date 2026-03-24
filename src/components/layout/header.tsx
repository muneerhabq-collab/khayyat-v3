'use client';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
export function Header({ title, showBack, action }: { title:string; showBack?:boolean; action?:React.ReactNode }) {
  const r = useRouter();
  return <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-srf-200/60"><div className="flex items-center justify-between h-14 px-4"><div className="flex items-center gap-2">{showBack&&<button onClick={()=>r.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-srf-100 press"><ChevronRight className="w-5 h-5 text-srf-600"/></button>}<h1 className="text-lg font-bold text-srf-900">{title}</h1></div>{action&&<div>{action}</div>}</div></header>;
}
