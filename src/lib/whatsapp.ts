import { fmtCurrency, fmtPhone } from './utils';
export function sendWA(phone: string, msg: string) { window.open(`https://wa.me/${fmtPhone(phone)}?text=${encodeURIComponent(msg)}`, '_blank'); }
export function orderWA(phone: string, name: string, num: string, status: string, shop: string) {
  const m: Record<string,string> = {
    pending: `مرحباً ${name} 👋\nتم استلام طلبك #${num}\n— ${shop}`,
    confirmed: `${name}، تم تأكيد طلبك #${num} ✅\n— ${shop}`,
    cutting: `${name}، طلبك #${num} في القص ✂️\n— ${shop}`,
    sewing: `${name}، طلبك #${num} قيد الخياطة 🧵\n— ${shop}`,
    finishing: `${name}، طلبك #${num} في التشطيب ✨\n— ${shop}`,
    ready: `🎉 ${name}، طلبك #${num} جاهز للاستلام!\n— ${shop}`,
    delivered: `شكراً ${name} 🙏\n— ${shop}`,
  };
  sendWA(phone, m[status] || `تحديث طلبك #${num}\n— ${shop}`);
}
