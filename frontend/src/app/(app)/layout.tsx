import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: LayoutProps<"/">) {
  // Suspense нужен для useSearchParams (выбранный месяц в ?m=)
  return (
    <Suspense>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
