"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/icon-picker";
import { CATEGORY_COLORS } from "@/lib/category-icons";
import { useSaveCategory } from "@/lib/queries";
import type { Category, TransactionType } from "@/lib/types";

export type EditorTarget = { category: Category } | { type: TransactionType } | null;

export function CategoryEditor({ target, onClose }: { target: EditorTarget; onClose: () => void }) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-5 sm:max-w-md">
        {target && <EditorForm key={"category" in target ? target.category.id : target.type} target={target} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditorForm({ target, onClose }: { target: NonNullable<EditorTarget>; onClose: () => void }) {
  const existing = "category" in target ? target.category : null;
  const type = existing?.type ?? ("type" in target ? target.type : "EXPENSE");
  const [name, setName] = useState(existing?.name ?? "");
  const [color, setColor] = useState(existing?.color ?? CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(existing?.icon ?? "ellipsis");
  const save = useSaveCategory();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(
      { id: existing?.id, name: name.trim(), color, icon, type: existing ? undefined : type },
      {
        onSuccess: () => {
          toast.success(existing ? "Категория обновлена" : "Категория создана");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={submit} className="contents">
      <DialogHeader>
        <DialogTitle>
          {existing ? "Категория" : type === "INCOME" ? "Новая категория дохода" : "Новая категория расхода"}
        </DialogTitle>
      </DialogHeader>

      <div className="flex items-center gap-3">
        <CategoryIcon icon={icon} color={color} size="lg" />
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="cat-name">Название</Label>
          <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required autoFocus className="h-10" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Цвет</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="flex size-7 items-center justify-center rounded-full ring-offset-2 transition hover:scale-110"
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px var(--surface), 0 0 0 4px ${c}` : undefined }}
              aria-label={`Цвет ${c}`}
            >
              {color === c && <Check className="size-3.5 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Иконка</Label>
        <IconPicker value={icon} color={color} onChange={setIcon} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={!name.trim() || save.isPending}>
          Сохранить
        </Button>
      </DialogFooter>
    </form>
  );
}
