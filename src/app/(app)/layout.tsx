import { AppProviders } from "@/components/layout/AppProviders";
import { Background } from "@/components/layout/Background";
import { MobileNav, Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <Background />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-[1360px]">{children}</div>
        </main>
      </div>
      <MobileNav />
    </AppProviders>
  );
}
