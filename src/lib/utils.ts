export const cn = (...c: any[]) => c.filter(Boolean).join(' ');
export const genOrderNum = () => { const d=new Date(); return `ORD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`; };
export const fmtDate = (s: string) => new Intl.DateTimeFormat('ar-SA',{year:'numeric',month:'short',day:'numeric'}).format(new Date(s));
export const fmtDateTime = (s: string) => new Intl.DateTimeFormat('ar-SA',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(s));
export const timeAgo = (s: string) => { const m=Math.floor((Date.now()-new Date(s).getTime())/60000),h=Math.floor(m/60),d=Math.floor(h/24); if(m<1)return'الآن'; if(m<60)return`منذ ${m} دقيقة`; if(h<24)return`منذ ${h} ساعة`; if(d<7)return`منذ ${d} يوم`; return fmtDate(s); };
export const fmtCurrency = (n: number) => new Intl.NumberFormat('ar-SA',{style:'currency',currency:'SAR',minimumFractionDigits:0,maximumFractionDigits:0}).format(n);
export const fmtPhone = (p: string) => { let c=p.replace(/\D/g,''); if(c.startsWith('0'))c='966'+c.substring(1); if(!c.startsWith('966'))c='966'+c; return c; };
export const nextStatus = (s: string) => { const f=['pending','confirmed','cutting','sewing','finishing','ready','delivered']; const i=f.indexOf(s); return i===-1||i===f.length-1?null:f[i+1]; };
export const STATUS: Record<string,{label:string;color:string;bg:string}> = {
  pending:{label:'جديد',color:'text-amber-700',bg:'bg-amber-50 border-amber-200'},
  confirmed:{label:'مؤكد',color:'text-blue-700',bg:'bg-blue-50 border-blue-200'},
  cutting:{label:'قيد القص',color:'text-purple-700',bg:'bg-purple-50 border-purple-200'},
  sewing:{label:'قيد الخياطة',color:'text-orange-700',bg:'bg-orange-50 border-orange-200'},
  finishing:{label:'تشطيب',color:'text-teal-700',bg:'bg-teal-50 border-teal-200'},
  ready:{label:'جاهز',color:'text-green-700',bg:'bg-green-50 border-green-200'},
  delivered:{label:'مسلّم',color:'text-srf-600',bg:'bg-srf-100 border-srf-200'},
  cancelled:{label:'ملغي',color:'text-red-700',bg:'bg-red-50 border-red-200'},
};
export const FLOW = ['pending','confirmed','cutting','sewing','finishing','ready','delivered'];
export const GARMENTS = ['ثوب سعودي','ثوب إماراتي','ثوب كويتي','سروال','شماغ/غترة','بشت','جاكيت','أخرى'];
export const FABRICS = ['قطن','بوليستر','كتان','صوف','حرير','مخلوط','أخرى'];
export const MFIELDS: {key:string;label:string}[] = [{key:'chest',label:'الصدر'},{key:'shoulder',label:'الكتف'},{key:'sleeve_length',label:'طول الكم'},{key:'sleeve_width',label:'عرض الكم'},{key:'body_length',label:'طول الثوب'},{key:'neck',label:'الرقبة'},{key:'waist',label:'الخصر'},{key:'hip',label:'الأرداف'},{key:'cuff_width',label:'عرض الكبك'},{key:'bottom_width',label:'عرض الذيل'},{key:'arm_hole',label:'حفرة الكم'},{key:'front_length',label:'الطول الأمامي'},{key:'back_length',label:'الطول الخلفي'}];
export const COLLARS = ['ياقة عادية','ياقة ملكية','ياقة ماندارين','ياقة كورية','بدون ياقة'];
export const POCKETS = ['جيب عادي','جيب مخفي','جيب بغطاء','جيب جانبي','بدون جيب'];
export const CLOSURES = ['أزرار','سحّاب','كبسات','أزرار + سحّاب'];
export const CUFFS = ['كبك عادي','كبك فرنسي','كبك مطاط','بدون كبك'];
export const SLITS = ['فتحة جانبية','فتحة خلفية','فتحتين جانبية','بدون فتحة'];
export const EMBROIDERY = ['بدون تطريز','تطريز يدوي','تطريز آلي','تطريز خفيف','تطريز كامل'];
export const LINING = ['بدون بطانة','بطانة كاملة','بطانة نصفية','بطانة أكمام فقط'];
