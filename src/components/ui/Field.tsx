import { cn } from "@/lib/client/cn";

export function Field({ label, error, children, className, hint }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-center justify-between">
        <span className="label">{label}</span>
        {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-coral">{error}</span>}
    </label>
  );
}

export function Input({ className, icon, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  if (!icon) return <input className={cn("input-neu", className)} {...rest} />;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>
      <input className={cn("input-neu pl-11", className)} {...rest} />
    </div>
  );
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn("input-neu cursor-pointer appearance-none pr-10", className)} {...rest}>
        {children}
      </select>
      <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" /></svg>
    </div>
  );
}
