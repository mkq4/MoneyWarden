"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { getDisplayName, useMe } from "@/entities/user";
import { useLogout } from "@/features/auth";
import { CategoryEditor, type EditorTarget } from "@/features/category-editor";
import { PageHeader } from "@/widgets/header";
import { Button } from "@/shared/ui/button";
import { Panel } from "@/shared/ui/panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { CategoryList } from "../components";

export function SettingsPage() {
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
                <div className="truncate font-semibold">{getDisplayName(me)}</div>
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
