'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Scissors, Users, Package, Truck, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
const ITEMS = [
  { href:'/dashboard', label:'الرئيسية', icon:LayoutDashboard },
  { href:'/orders', label:'الطلبات', icon:Scissors },
  { href:'/customers', label:'العملاء', icon:Users },
  { href:'/inventory', label:'المخزون', icon:Package },
  { href:'/settings', label:'المزيد', icon:Settings },
];
export function Nav() {
  const path = usePathname();
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-srf-200/60" style={{paddingBottom:'env(safe-area-inset-bottom,0px)'}}><div className="flex items-center justify-around h-16 max-w-lg mx-auto">{ITEMS.map(i=>{const a=path.startsWith(i.href);const I=i.icon;return<Link key={i.href} href={i.href} className={cn('flex flex-col items-center justify-center gap-0.5 w-16 h-full press',a?'text-brand-600':'text-srf-400')}><div className={cn('w-10 h-7 flex items-center justify-center rounded-lg',a&&'bg-brand-50')}><I className="w-5 h-5" strokeWidth={a?2.2:1.8}/></div><span className={cn('text-[10px]',a?'font-semibold':'font-medium')}>{i.label}</span></Link>;})}</div></nav>;
}
