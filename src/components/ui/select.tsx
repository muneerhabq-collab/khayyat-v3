'use client';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & {label?:string;options:{value:string;label:string}[];placeholder?:string}>(
  ({ label, options, placeholder, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-srf-700">{label}</label>}
      <div className="relative">
        <select ref={ref} className={cn('w-full h-11 px-3 bg-white border border-srf-200 rounded-xl text-srf-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',className)} {...props}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-srf-400 pointer-events-none"/>
      </div>
    </div>
  )
);
Select.displayName='Select';
