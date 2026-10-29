"use client";
import dynamic from "next/dynamic";

const FinanceScene = dynamic(() => import("./FinanceScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export function LazyScene({ variant }: { variant?: "hero" | "auth" }) {
  return <FinanceScene variant={variant} />;
}
