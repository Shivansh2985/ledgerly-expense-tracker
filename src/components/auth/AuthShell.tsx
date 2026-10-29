"use client";
import { motion } from "framer-motion";
import { Background } from "@/components/layout/Background";
import { Logo } from "@/components/layout/Logo";
import { LazyScene } from "@/components/three/LazyScene";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <Background />
      <section className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="glass-strong w-full max-w-md rounded-4xl p-8 sm:p-10">
            <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{title}</h1>
            <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 text-center text-sm text-ink-muted">{footer}</div>
          </motion.div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden p-6 lg:block">
        <div className="neu relative h-full overflow-hidden rounded-[2.5rem]">
          <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_30%_20%,#E4E0FD_0%,transparent_70%),radial-gradient(500px_400px_at_80%_80%,#FFE3DD_0%,transparent_70%)]" />
          <div className="absolute inset-0">
            <LazyScene variant="auth" />
          </div>
          <div className="glass absolute bottom-8 left-8 right-8 rounded-3xl p-6">
            <p className="font-serif text-2xl italic leading-snug text-ink">“Small daily spends tell the biggest story.”</p>
            <p className="mt-3 text-sm text-ink-muted">Track them effortlessly, and let Ledgerly surface the patterns.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
