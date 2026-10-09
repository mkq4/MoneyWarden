"use client";

import { Plus } from "lucide-react";
import { useCategories, type CategoryType } from "@/entities/category";
import type { EditorTarget } from "@/features/category-editor";
import { Button } from "@/shared/ui/button";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { CategoryItem } from "./CategoryItem";

export function CategoryList({ type, onEdit }: { type: CategoryType; onEdit: (target: EditorTarget) => void }) {
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
