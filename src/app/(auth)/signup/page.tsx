"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { api } from "@/lib/client/api";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/api/auth/signup", { method: "POST", json: form });
      const next = params.get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Full name">
        <Input icon={<User size={17} />} placeholder="Aarav Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input icon={<Mail size={17} />} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
      </Field>
      <Field label="Password" hint="Min. 6 characters">
        <div className="relative">
          <Input icon={<Lock size={17} />} type={show ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} autoComplete="new-password" className="pr-12" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink" aria-label="Toggle password">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </Field>
      {error && <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-[#D9483B]">{error}</p>}
      <Button type="submit" loading={loading} className="w-full py-3.5 text-[15px]">
        Create account
      </Button>
    </form>
  );
}

export default function Page() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start understanding your money in under a minute."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link></>}
    >
      <Suspense>
        <Form />
      </Suspense>
    </AuthShell>
  );
}
