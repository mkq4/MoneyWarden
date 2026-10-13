"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { TransactionEditorProvider } from "@/features/transaction-editor";
import { Toaster } from "@/shared/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    // Тема — класс .dark на <html>; выбирается в настройках, по умолчанию светлая.
    <ThemeProvider
      attribute="class"
      themes={["light", "dark"]}
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <TransactionEditorProvider>{children}</TransactionEditorProvider>
        <Toaster position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
