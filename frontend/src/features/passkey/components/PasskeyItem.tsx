import { KeyRound, Trash2 } from "lucide-react";
import { formatDay } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import type { Passkey } from "../model/types";

export function PasskeyItem({
  passkey,
  onRemove,
  removing,
}: {
  passkey: Passkey;
  onRemove: () => void;
  removing: boolean;
}) {
  const added = formatDay(passkey.createdAt.slice(0, 10)).toLowerCase();
  const used = passkey.lastUsedAt ? formatDay(passkey.lastUsedAt.slice(0, 10)).toLowerCase() : null;
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/80">
        <KeyRound className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{passkey.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          добавлен {added}
          {used ? ` · вход ${used}` : ""}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} disabled={removing} aria-label="Удалить ключ">
        <Trash2 className="text-muted-foreground" />
      </Button>
    </li>
  );
}
