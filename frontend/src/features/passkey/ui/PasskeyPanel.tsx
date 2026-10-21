"use client";

import { ScanFace } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { useAddPasskey, usePasskeys, useRemovePasskey } from "../api/queries";
import { PasskeyItem } from "../components";
import { isCancelled, passkeyErrorMessage } from "../lib/errors";
import { useBiometry } from "../model/use-biometry";

/** Настройки: включить вход по Face ID и управлять ключами. */
export function PasskeyPanel() {
  const biometry = useBiometry();
  const { data: passkeys } = usePasskeys();
  const add = useAddPasskey();
  const remove = useRemovePasskey();

  const onAdd = () =>
    add.mutate(undefined, {
      onSuccess: () => toast.success(`Вход по ${biometry ?? "ключу"} включён`),
      onError: (err) => {
        if (!isCancelled(err)) toast.error(passkeyErrorMessage(err));
      },
    });

  const onRemove = (id: string) => {
    if (!confirm("Удалить ключ? Войти с этого устройства по биометрии больше не получится.")) return;
    remove.mutate(id, { onError: (err) => toast.error(err.message) });
  };

  return (
    <Panel>
      <PanelTitle>Вход по {biometry ?? "биометрии"}</PanelTitle>
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">
        Входите без логина и пароля. Лицо и отпечаток не покидают устройство — на сервере хранится только
        публичный ключ.
      </p>

      {!passkeys ? (
        <Skeleton className="h-14 w-full" />
      ) : (
        passkeys.length > 0 && (
          <ul className="mb-4 divide-y divide-border/70 border-y border-border/70">
            {passkeys.map((p) => (
              <PasskeyItem
                key={p.id}
                passkey={p}
                onRemove={() => onRemove(p.id)}
                removing={remove.isPending && remove.variables === p.id}
              />
            ))}
          </ul>
        )
      )}

      {biometry ? (
        <Button onClick={onAdd} disabled={add.isPending} className="h-11 rounded-xl">
          <ScanFace />
          {add.isPending ? "Подождите…" : passkeys?.length ? "Добавить это устройство" : `Включить вход по ${biometry}`}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Этот браузер не поддерживает вход по биометрии.</p>
      )}
    </Panel>
  );
}
