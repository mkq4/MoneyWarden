"use client";

import { useState } from "react";
import { hardNavigate } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { authService } from "../api/auth.service";
import { FormField } from "../components";
import { AUTH_MODE_LABELS, AUTH_MODES } from "../model/auth.const";
import type { AuthMode } from "../model/types";

/** Вход и регистрация по логину и паролю. */
export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
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
      if (mode === "register") {
        await authService.register({ username, password, name: name.trim() || undefined });
      } else {
        await authService.login({ username, password });
      }
      // Полная перезагрузка: proxy увидит куку сессии и пустит в приложение.
      hardNavigate(ROUTES.start);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
      setPending(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6">
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm">
        {AUTH_MODES.map((m) => (
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
            {AUTH_MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label="Логин" htmlFor="username">
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
        </FormField>
        <FormField label="Пароль" htmlFor="password" hint={mode === "register" ? "Минимум 8 символов" : undefined}>
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
        </FormField>
        {mode === "register" && (
          <FormField label="Как к вам обращаться" htmlFor="name" hint="Необязательно">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
              maxLength={100}
              className="h-11"
            />
          </FormField>
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
  );
}
