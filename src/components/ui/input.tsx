'use client';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & {label?:string;error?:string;icon?:React.ReactNode;suffix?:string}>(
  ({ label, error, icon, suffix, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-srf-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-srf-400">{icon}</div>}
        <input ref={ref} className={cn('w-full h-11 px-3 bg-white border border-srf-200 rounded-xl text-srf-900 placeholder:text-srf-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors',icon&&'pr-10',suffix&&'pl-12',error&&'border-red-400',className)} {...props}/>
        {suffix && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-srf-400">{suffix}</div>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName='Input';
