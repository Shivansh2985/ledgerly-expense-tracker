"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { ExpenseDTO, PublicUser } from "@/lib/types";
import { useApi } from "@/lib/client/api";
import { ToastProvider } from "@/components/ui/Toast";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";

type Ctx = {
  user: PublicUser | null;
  openAdd: (defaults?: Partial<ExpenseDTO>) => void;
  openEdit: (e: ExpenseDTO) => void;
};
const AppCtx = createContext<Ctx>({ user: null, openAdd: () => {}, openEdit: () => {} });
export const useApp = () => useContext(AppCtx);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { data } = useApi<{ user: PublicUser }>("/api/auth/me");
  const [modal, setModal] = useState<{ open: boolean; expense?: ExpenseDTO; defaults?: Partial<ExpenseDTO> }>({ open: false });
  const openAdd = useCallback((defaults?: Partial<ExpenseDTO>) => setModal({ open: true, defaults }), []);
  const openEdit = useCallback((expense: ExpenseDTO) => setModal({ open: true, expense }), []);
  const close = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  return (
    <ToastProvider>
      <AppCtx.Provider value={{ user: data?.user ?? null, openAdd, openEdit }}>
        {children}
        <ExpenseModal open={modal.open} onClose={close} expense={modal.expense} defaults={modal.defaults} />
      </AppCtx.Provider>
    </ToastProvider>
  );
}
