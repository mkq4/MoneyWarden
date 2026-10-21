"use client";

import { ScanFace } from "lucide-react";
import { useState } from "react";
import { hardNavigate } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { useLoginWithPasskey } from "../api/queries";
import { isCancelled, passkeyErrorMessage } from "../lib/errors";
import { useBiometry } from "../model/use-biometry";

/** «Войти по Face ID» на экране входа; скрыта, если браузер не умеет passkeys. */
export function PasskeyLoginButton() {
  const biometry = useBiometry();
  const login = useLoginWithPasskey();
  const [error, setError] = useState<string | null>(null);
  if (!biometry) return null;

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={login.isPending}
        className="h-12 w-full rounded-2xl text-[15px] font-semibold"
        onClick={() => {
          setError(null);
          login.mutate(undefined, {
            // Полная перезагрузка: proxy увидит куку сессии и пустит в приложение.
            onSuccess: () => hardNavigate(ROUTES.start),
            onError: (err) => {
              if (!isCancelled(err)) setError(passkeyErrorMessage(err));
            },
          });
        }}
      >
        <ScanFace className="size-5" />
        {login.isPending ? "Подождите…" : `Войти по ${biometry}`}
      </Button>
      {error && (
        <p className="rounded-xl bg-expense-soft px-3 py-2 text-sm text-expense" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
