const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const money = (n: number, decimals = false) => (decimals ? inr2 : inr).format(n || 0);
export function moneyCompact(n: number) {
  const v = Math.abs(n || 0);
  const sign = n < 0 ? "-" : "";
  const fmt = (x: number, s: string) => sign + "₹" + (Math.round(x * 10) / 10).toString() + s;
  if (v >= 1e7) return fmt(v / 1e7, "Cr");
  if (v >= 1e5) return fmt(v / 1e5, "L");
  if (v >= 1e3) return fmt(v / 1e3, "K");
  return sign + "₹" + Math.round(v);
}

/** YYYY-MM-DD in the user's local calendar */
export function toDay(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD into a local Date (for display only) */
export function fromDay(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function shiftDay(s: string, days: number) {
  const d = fromDay(s);
  d.setDate(d.getDate() + days);
  return toDay(d);
}

export function shiftMonth(s: string, months: number) {
  const d = fromDay(s);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return toDay(d);
}

export const fmtDate = (s: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  fromDay(s).toLocaleDateString("en-IN", opts);

export function relativeDay(s: string) {
  const today = toDay();
  if (s === today) return "Today";
  if (s === shiftDay(today, -1)) return "Yesterday";
  return fmtDate(s, { weekday: "long", day: "numeric", month: "short" });
}

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};
