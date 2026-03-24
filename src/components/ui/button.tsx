'use client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
const V:Record<string,string> = { primary:'bg-brand-500 text-white hover:bg-brand-600 shadow-sm', secondary:'bg-srf-100 text-srf-700 hover:bg-srf-200 border border-srf-200', ghost:'text-srf-600 hover:bg-srf-100', danger:'bg-red-500 text-white hover:bg-red-600', wa:'bg-[#25D366] text-white hover:bg-[#20bd5a]' };
const S:Record<string,string> = { sm:'h-8 px-3 text-sm', md:'h-10 px-4 text-sm', lg:'h-12 px-6 text-base' };
export function Button({ children, variant='primary', size='md', loading=false, icon, className, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?:string; size?:string; loading?:boolean; icon?:React.ReactNode }) {
  return <button className={cn('inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all press disabled:opacity-50 disabled:pointer-events-none', V[variant], S[size], className)} disabled={disabled||loading} {...props}>{loading?<Loader2 className="w-4 h-4 animate-spin"/>:icon}{children}</button>;
}
