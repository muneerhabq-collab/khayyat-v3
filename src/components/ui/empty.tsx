'use client';
export function Empty({ icon, title, desc, action }: { icon:React.ReactNode; title:string; desc?:string; action?:React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in"><div className="w-16 h-16 rounded-2xl bg-srf-100 flex items-center justify-center text-srf-400 mb-4">{icon}</div><h3 className="text-base font-semibold text-srf-700 mb-1">{title}</h3>{desc&&<p className="text-sm text-srf-500 max-w-xs mb-6">{desc}</p>}{action}</div>;
}
