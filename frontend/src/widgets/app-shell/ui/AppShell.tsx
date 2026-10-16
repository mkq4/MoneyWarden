"use client";

import { BottomNav, Sidebar } from "../components";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 md:pl-[248px]">
        {/* Снизу на телефоне — место под BottomNav (3.5rem) + запас */}
        <div className="mx-auto w-full max-w-[1180px] px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:px-6 md:px-10 md:pt-12 md:pb-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
