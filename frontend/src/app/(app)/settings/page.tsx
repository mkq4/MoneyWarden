"use client";

import { Archive, ArchiveRestore, LogOut, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryEditor, type EditorTarget } from "@/components/category-editor";
import { CategoryIcon } from "@/components/category-icon";
import { PageHeader } from "@/components/page-header";
import { Panel, PanelTitle } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useDeleteCategory, useLogout, useMe, useSaveCategory } from "@/lib/queries";
import type { Category, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: me } = useMe();
  const logout = useLogout();
  const [editor, setEditor] = useState<EditorTarget>(null);

  return (
    <>
      <PageHeader title="Настройки" />
      <div className="flex flex-col gap-4 md:gap-6">
        <Panel className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {me ? (
              <>
                <div className="truncate font-semibold">{me.name || me.username}</div>
                <div className="truncate text-sm text-muted-foreground">@{me.username}</div>
              </>
            ) : (
              <Skeleton className="h-10 w-40" />
            )}
          </div>
          <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
            <LogOut /> Выйти
          </Button>
        </Panel>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <CategoryList type="EXPENSE" onEdit={setEditor} />
          <CategoryList type="INCOME" onEdit={setEditor} />
        </div>
      </div>
      <CategoryEditor target={editor} onClose={() => setEditor(null)} />
    </>
  );
}

function CategoryList({ type, onEdit }: { type: TransactionType; onEdit: (t: EditorTarget) => void }) {
  const { data } = useCategories({ type, includeArchived: true });
  const active = data?.filter((c) => !c.archivedAt) ?? [];
  const archived = data?.filter((c) => c.archivedAt) ?? [];

  return (
    <Panel>
      <PanelTitle
        action={
          <Button size="sm" variant="secondary" onClick={() => onEdit({ type })}>
            <Plus /> Добавить
          </Button>
        }
      >
        {type === "EXPENSE" ? "Категории расходов" : "Категории доходов"}
      </PanelTitle>
      {!data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <div className="flex flex-col">
            {active.map((c) => (
              <CategoryItem key={c.id} category={c} onEdit={() => onEdit({ category: c })} />
            ))}
          </div>
          {archived.length > 0 && (
            <>
              <div className="mt-5 mb-1 text-xs font-medium text-muted-foreground">В архиве</div>
              <div className="flex flex-col">
                {archived.map((c) => (
                  <CategoryItem key={c.id} category={c} onEdit={() => onEdit({ category: c })} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Panel>
  );
}

function CategoryItem({ category, onEdit }: { category: Category; onEdit: () => void }) {
  const remove = useDeleteCategory();
  const save = useSaveCategory();
  const archived = !!category.archivedAt;

  const archive = () => {
    if (!confirm(`Убрать категорию «${category.name}»? Операции в ней сохранятся.`)) return;
    remove.mutate(category.id, {
      onSuccess: (r) => toast.success(r.archived ? "Категория перенесена в архив" : "Категория удалена"),
      onError: (e) => toast.error(e.message),
    });
  };
  const restore = () =>
    save.mutate(
      { id: category.id, archived: false },
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
