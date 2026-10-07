"use client";

import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon, useDeleteCategory, useUpdateCategory, type Category } from "@/entities/category";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

export function CategoryItem({ category, onEdit }: { category: Category; onEdit: () => void }) {
  const remove = useDeleteCategory();
  const update = useUpdateCategory();
  const archived = category.archivedAt !== null;

  const archive = () => {
    if (!confirm(`Убрать категорию «${category.name}»? Операции в ней сохранятся.`)) return;
    remove.mutate(category.id, {
      onSuccess: (res) => toast.success("archived" in res ? "Категория перенесена в архив" : "Категория удалена"),
      onError: (e) => toast.error(e.message),
    });
  };
  const restore = () =>
    update.mutate(
      { id: category.id, body: { archived: false } },
      { onSuccess: () => toast.success("Категория восстановлена"), onError: (e) => toast.error(e.message) },
    );

  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-muted/50">
      <CategoryIcon icon={category.icon} color={category.color} size="sm" className={cn(archived && "opacity-50")} />
      <span className={cn("flex-1 truncate text-sm", archived && "text-muted-foreground")}>{category.name}</span>
      <div className="flex gap-0.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        {!archived && (
          <Button size="icon-sm" variant="ghost" onClick={onEdit} aria-label="Изменить">
            <Pencil />
          </Button>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={archived ? restore : archive}
          aria-label={archived ? "Восстановить" : "Убрать"}
        >
          {archived ? <ArchiveRestore /> : <Archive />}
        </Button>
      </div>
    </div>
  );
}
