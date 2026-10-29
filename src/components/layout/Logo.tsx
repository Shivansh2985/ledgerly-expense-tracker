import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#8B7BF0,#6C5CE7_55%,#4636AE)] shadow-glow transition-transform group-hover:rotate-[-6deg]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l5-5 4 4 7-8" />
          <path d="M15 8h5v5" />
        </svg>
        <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30" />
      </span>
      <span className="font-display text-[19px] font-semibold tracking-tight text-ink">
        Khaa<span className="text-brand-500">ta</span>
      </span>
    </Link>
  );
}
