'use client';
import { cn } from '@/lib/utils';
export function Card({ children, className, onClick, hoverable }: { children:React.ReactNode; className?:string; onClick?:()=>void; hoverable?:boolean }) {
  return <div onClick={onClick} className={cn('bg-white border border-srf-200/60 rounded-2xl p-4 shadow-sm',hoverable&&'cursor-pointer hover:shadow-md hover:border-srf-300 transition-all press',onClick&&'cursor-pointer',className)}>{children}</div>;
}
