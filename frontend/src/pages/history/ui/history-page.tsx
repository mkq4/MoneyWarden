"use client";

import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { isCategoryType } from "@/entities/category";
import { useTransactions } from "@/entities/transaction";
import { MonthPicker } from "@/features/month-select";
import { PageHeader } from "@/widgets/header";
import { formatMoney, pluralize } from "@/shared/lib/format";
import { useMonth } from "@/shared/lib/month-param";
import { Button } from "@/shared/ui/button";
import { Panel } from "@/shared/ui/panel";
import type { TypeFilter } from "../model/type-filter";
import { CategoryFilter } from "./category-filter";
import { GroupedList } from "./grouped-list";
import { ListSkeleton } from "./list-skeleton";
import { TypeSegmented } from "./type-segmented";

export function HistoryPage() {
  const params = useSearchParams();
  const initialType = params?.get("type");
  const [month] = useMonth();
  const [type, setType] = useState<TypeFilter>(isCategoryType(initialType) ? initialType : "ALL");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  const query = useTransactions({
    month,
    type: type === "ALL" ? undefined : type,
    categoryIds,
    search: deferredSearch || undefined,
  });
  const pages = query.data?.pages ?? [];
  const items = pages.flatMap((p) => p.items);
  const first = pages[0];

  return (
    <>
      <PageHeader
        title="История"
        subtitle="Все операции за месяц"
        action={
          <div className="hidden md:block">
            <MonthPicker />
          </div>
        }
      />
      <div className="-mt-3 mb-4 md:hidden">
        <MonthPicker variant="inline" />
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <TypeSegmented
          value={type}
          onChange={(t) => {
            setType(t);
            setCategoryIds([]);
          }}
        />
        <CategoryFilter type={type} value={categoryIds} onChange={setCategoryIds} />
        <label className="relative flex-1 md:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по комментарию"
            className="h-10 w-full rounded-xl border border-border bg-surface pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/25"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Очистить поиск"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      <Panel className="p-4 md:p-6">
        {first && (
          <div className="mb-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-border/70 pb-4 text-sm">
            <span className="text-muted-foreground">
              {first.total} {pluralize(first.total, ["операция", "операции", "операций"])}
            </span>
            {type !== "INCOME" && (
              <span>
                Расходы: <span className="font-semibold">{formatMoney(first.sums.expense)}</span>
              </span>
            )}
            {type !== "EXPENSE" && (
              <span>
                Доходы: <span className="font-semibold text-income">{formatMoney(first.sums.income)}</span>
              </span>
            )}
            {type === "ALL" && first.sums.saved > 0 && (
              <span>
                Отложено: <span className="font-semibold text-brand">{formatMoney(first.sums.saved)}</span>
              </span>
            )}
          </div>
        )}

        {query.isPending ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">Ничего не найдено</div>
        ) : (
          <GroupedList items={items} />
        )}

        {query.hasNextPage && (
          <Button
            variant="outline"
            className="mt-4 h-10 w-full rounded-xl"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? "Загружаем…" : "Показать ещё"}
          </Button>
        )}
      </Panel>
    </>
  );
}
