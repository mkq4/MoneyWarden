"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Dashboard } from "@/components/dashboard";
import { Logo } from "@/components/logo";
import { QuickActions } from "@/components/quick-actions";

/**
 * «/»: на телефоне — стартовый экран быстрых действий (после сохранения
 * операции переходим на главную со статистикой), на десктопе — сразу дашборд.
 */
export default function StartPage() {
  const router = useRouter();
  return (
    <>
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center md:hidden">
        <div className="flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-7 text-[26px] leading-tight font-semibold tracking-tight">
            Ваши деньги
            <br />
            под контролем
          </h1>
          <p className="mt-3 max-w-[280px] text-sm text-muted-foreground">
            Просто отслеживайте расходы, доходы и смотрите, на что уходят деньги.
          </p>
        </div>
        <div className="mt-10">
          <QuickActions layout="stack" onSaved={() => router.push("/home")} />
        </div>
        <Link
          href="/home"
          className="mx-auto mt-6 flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          Мой бюджет <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="hidden md:block">
        <Dashboard />
      </div>
    </>
  );
}
