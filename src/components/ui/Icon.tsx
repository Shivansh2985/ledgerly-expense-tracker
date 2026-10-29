import {
  UtensilsCrossed, ShoppingBasket, Car, ShoppingBag, Receipt, Home, Clapperboard, HeartPulse, GraduationCap, Plane,
  Sparkles, Gift, TrendingUp, CircleDot, Banknote, Smartphone, CreditCard, Landmark, Wallet, type LucideIcon,
} from "lucide-react";
import { categoryMeta, modeMeta } from "@/lib/constants";
import { cn } from "@/lib/client/cn";

const MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, ShoppingBasket, Car, ShoppingBag, Receipt, Home, Clapperboard, HeartPulse, GraduationCap, Plane,
  Sparkles, Gift, TrendingUp, CircleDot, Banknote, Smartphone, CreditCard, Landmark, Wallet,
};

export function CategoryIcon({ category, size = 40, className }: { category: string; size?: number; className?: string }) {
  const meta = categoryMeta(category);
  const I = MAP[meta.icon] ?? CircleDot;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-2xl", className)}
      style={{
        width: size,
        height: size,
        color: meta.color,
        background: `linear-gradient(145deg, ${meta.color}22, ${meta.color}0d)`,
        boxShadow: `inset 0 0 0 1px ${meta.color}26, 0 6px 14px -6px ${meta.color}66`,
      }}
    >
      <I size={size * 0.46} strokeWidth={2.1} />
    </span>
  );
}

export function ModeBadge({ mode, className }: { mode: string; className?: string }) {
  const meta = modeMeta(mode);
  const I = MAP[meta.icon] ?? Wallet;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", className)}
      style={{ color: meta.color, background: `${meta.color}14`, boxShadow: `inset 0 0 0 1px ${meta.color}2a` }}
    >
      <I size={12} strokeWidth={2.4} />
      {meta.label}
    </span>
  );
}

export function iconFor(name: string): LucideIcon {
  return MAP[name] ?? CircleDot;
}

export function ModeIcon({ mode, size = 40 }: { mode: string; size?: number }) {
  const meta = modeMeta(mode);
  const I = MAP[meta.icon] ?? CircleDot;
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-2xl" style={{ width: size, height: size, color: meta.color, background: `linear-gradient(145deg, ${meta.color}22, ${meta.color}0d)`, boxShadow: `inset 0 0 0 1px ${meta.color}26, 0 6px 14px -6px ${meta.color}66` }}>
      <I size={size * 0.46} strokeWidth={2.1} />
    </span>
  );
}
