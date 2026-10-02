"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api(`/auth/${mode}`, {
        method: "POST",
        body: mode === "register" ? { username, password, name: name.trim() || undefined } : { username, password },
      });
      // Полная перезагрузка: proxy увидит куку сессии и пустит в приложение.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-7 text-[26px] leading-tight font-semibold tracking-tight">
            Ваши деньги
            <br />
            под контролем
          </h1>
          <p className="mt-3 max-w-[290px] text-sm text-muted-foreground">
            Просто отслеживайте расходы, доходы и смотрите, на что уходят деньги.
          </p>
        </div>

        <div className="mt-9 rounded-3xl border border-border/80 bg-surface p-5 sm:p-6">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "h-9 rounded-lg font-medium transition",
                  mode === m ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Логин" htmlFor="username">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="например, ivan_petrov"
                required
                minLength={3}
                maxLength={32}
                className="h-11"
              />
            </Field>
            <Field label="Пароль" htmlFor="password" hint={mode === "register" ? "Минимум 8 символов" : undefined}>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={mode === "register" ? 8 : 1}
                maxLength={128}
                className="h-11"
              />
            </Field>
            {mode === "register" && (
              <Field label="Как к вам обращаться" htmlFor="name" hint="Необязательно">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                  maxLength={100}
                  className="h-11"
                />
              </Field>
            )}

            {error && (
              <p className="rounded-xl bg-expense-soft px-3 py-2 text-sm text-expense" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="mt-1 h-12 rounded-2xl text-[15px] font-semibold">
              {pending ? "Подождите…" : mode === "login" ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
