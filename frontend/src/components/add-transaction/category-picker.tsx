"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { IconPicker } from "@/components/icon-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_COLORS } from "@/lib/category-icons";
import { useSaveCategory } from "@/lib/queries";
import type { Category, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryPicker({
  type,
  categories,
  selectedId,
  onSelect,
}: {
  type: TransactionType;
  categories: Category[];
  selectedId: number | null;
  onSelect: (category: Category) => void;
}) {
  const defaultIcon = type === "INCOME" ? "banknote" : "shopping-bag";
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(defaultIcon);
  const save = useSaveCategory();
  // Цвет новой категории подбирается автоматически; поменять можно в настройках.
  const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];

  const reset = () => {
    setName("");
    setIcon(defaultIcon);
    setCreating(false);
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    save.mutate(
      { name: name.trim(), type, color, icon },
      {
        onSuccess: (category) => {
          reset();
          onSelect(category);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="-mx-2 flex flex-col">
      {categories.map((c) => {
        const selected = c.id === selectedId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] transition hover:bg-muted",
              selected && "bg-muted/70",
            )}
          >
            <CategoryIcon icon={c.icon} color={c.color} size="sm" />
            <span className="flex-1">{c.name}</span>
            {selected && <Check className="size-4 text-foreground" />}
          </button>
        );
      })}

      {creating ? (
        <form onSubmit={create} className="mt-2 flex flex-col gap-3 rounded-2xl bg-muted/50 p-3 mx-2">
          <div className="flex items-center gap-2">
            <CategoryIcon icon={icon} color={color} size="sm" />
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название категории"
              maxLength={50}
              className="h-10 bg-surface"
            />
          </div>
          <IconPicker value={icon} color={color} onChange={setIcon} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" className="h-9" onClick={reset}>
              Отмена
            </Button>
            <Button type="submit" className="h-9" disabled={!name.trim() || save.isPending}>
              Создать
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-1 flex items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] text-muted-foreground transition hover:bg-muted"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/40">
            <Plus className="size-4" />
          </span>
          Новая категория
        </button>
      )}
    </div>
  );
}
