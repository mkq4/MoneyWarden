"use client";

import { Sidebar } from "../components";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 md:pl-[248px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 pt-4 pb-10 sm:px-6 md:px-10 md:pt-12">
          {children}
        </div>
      </main>
    </div>
  );
}
