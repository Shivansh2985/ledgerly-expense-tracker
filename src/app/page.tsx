"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CalendarDays, FileText, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { Background } from "@/components/layout/Background";
import { Logo } from "@/components/layout/Logo";
import { LazyScene } from "@/components/three/LazyScene";

const features = [
  { icon: BarChart3, title: "Living analytics", text: "Daily, monthly & yearly views with averages, trends and comparisons that animate as you explore.", color: "#6C5CE7" },
  { icon: Smartphone, title: "Every payment mode", text: "Cash, UPI, cards, net banking and wallets — see exactly how you pay, not just what you pay for.", color: "#FF7A6B" },
  { icon: CalendarDays, title: "Calendar native", text: "Log by date, browse any day, and spot patterns on a year-long spending heatmap.", color: "#2EC4A0" },
  { icon: FileText, title: "One-click statements", text: "Generate polished PDF or CSV statements for any date range in seconds.", color: "#FFB547" },
];

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-ink">Log in</Link>
          <Link href="/signup" className="neu-sm px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:shadow-neu">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-6 px-6 pb-10 pt-6 lg:grid-cols-[1.05fr_1fr] lg:pt-14">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12 }}>
          <motion.span variants={fade} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-brand-600">
            <Sparkles size={14} /> Expense intelligence, beautifully crafted
          </motion.span>
          <motion.h1 variants={fade} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mt-6 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[72px]">
            Know where every
            <br />
            <span className="font-serif text-[1.12em] font-normal italic tracking-[-0.02em] text-gradient">rupee</span> goes.
          </motion.h1>
          <motion.p variants={fade} className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-soft">
            Ledgerly turns your daily spends into clear, animated insights — averages, top habits, payment modes and trends across days, months and years.
          </motion.p>
          <motion.div variants={fade} className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7B6CF0,#6C5CE7_45%,#5847D1)] px-7 py-4 text-[15px] font-semibold text-white shadow-glow transition hover:brightness-110">
              Start tracking free <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="neu-sm inline-flex items-center gap-2 px-7 py-4 text-[15px] font-semibold text-ink transition hover:text-brand-600">
              I have an account
            </Link>
          </motion.div>
          <motion.div variants={fade} className="mt-10 flex items-center gap-6 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-mint" /> Private & secure</span>
            <span className="h-4 w-px bg-ink-faint/50" />
            <span>₹ INR first</span>
            <span className="h-4 w-px bg-ink-faint/50" />
            <span>PDF & CSV statements</span>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} className="relative h-[440px] sm:h-[540px]">
          <div className="absolute inset-6 rounded-[3rem] bg-white/30 blur-2xl" />
          <LazyScene variant="hero" />
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.7 }} className="glass absolute right-2 top-10 w-48 rounded-2xl p-4 sm:right-4">
            <p className="label">This month</p>
            <p className="num mt-1 font-display text-2xl font-semibold text-ink">₹42,380</p>
            <p className="mt-1 text-xs font-semibold text-mint">↓ 12.4% vs last month</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1, duration: 0.7 }} className="glass absolute bottom-12 left-0 w-56 rounded-2xl p-4 sm:left-4">
            <p className="label">Top habit</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9736222] text-lg">☕</span>
              <div>
                <p className="text-sm font-semibold text-ink">Morning chai</p>
                <p className="text-xs text-ink-muted">46 times · ₹920</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="neu p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: f.color + "1a", color: f.color }}>
                <f.icon size={22} />
              </span>
              <h3 className="mt-5 font-display text-[17px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
