'use client';
import { cn, STATUS } from '@/lib/utils';
export function Badge({ status, size='md' }: { status:string; size?:string }) {
  const c = STATUS[status] || STATUS.pending;
  return <span className={cn('inline-flex items-center gap-1 font-medium rounded-full border',c.bg,c.color,size==='sm'?'px-2 py-0.5 text-xs':'px-3 py-1 text-sm')}><span className="w-1.5 h-1.5 rounded-full bg-current"/>{c.label}</span>;
}
