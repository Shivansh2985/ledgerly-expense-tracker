"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChartPie, FileText, LayoutDashboard, ListOrdered, LogOut, Plus } from "lucide-react";
import { Logo } from "./Logo";
import { useApp } from "./AppProviders";
import { api } from "@/lib/client/api";
import { cn } from "@/lib/client/cn";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: ListOrdered },
  { href: "/analytics", label: "Analytics", icon: ChartPie },
  { href: "/statements", label: "Statements", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAdd } = useApp();

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col p-5 lg:flex">
      <div className="neu flex h-full flex-col rounded-[2rem] p-5">
        <div className="px-2 pt-1">
          <Logo href="/dashboard" />
        </div>
        <button onClick={() => openAdd()} className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7B6CF0,#6C5CE7_45%,#5847D1)] px-4 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
          <Plus size={18} strokeWidth={2.6} /> Add expense
        </button>
        <nav className="mt-8 flex flex-col gap-1.5">
          <p className="label mb-2 px-3">Menu</p>
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={cn("relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors", active ? "text-brand-600" : "text-ink-muted hover:text-ink")}>
                {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-2xl shadow-neu-inset-sm" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <n.icon size={19} className="relative" strokeWidth={active ? 2.4 : 2} />
                <span className="relative">{n.label}</span>
                {active && <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="glass flex items-center gap-3 rounded-2xl p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#FFC9BE,#FF7A6B)] font-display text-sm font-semibold text-white">
              {user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "··"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user?.name ?? "Loading…"}</p>
              <p className="truncate text-xs text-ink-muted">{user?.email ?? ""}</p>
            </div>
            <button onClick={logout} title="Log out" className="rounded-xl p-2 text-ink-muted transition hover:bg-white/70 hover:text-coral">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { openAdd } = useApp();
  return (
    <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-3xl p-2 lg:hidden">
      {NAV.slice(0, 2).map((n) => (
        <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[10px] font-semibold", pathname.startsWith(n.href) ? "text-brand-600" : "text-ink-muted")}>
          <n.icon size={20} />
          {n.label}
        </Link>
      ))}
      <button onClick={() => openAdd()} className="-mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7B6CF0,#5847D1)] text-white shadow-glow" aria-label="Add expense">
        <Plus size={24} />
      </button>
      {NAV.slice(2).map((n) => (
        <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[10px] font-semibold", pathname.startsWith(n.href) ? "text-brand-600" : "text-ink-muted")}>
          <n.icon size={20} />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
