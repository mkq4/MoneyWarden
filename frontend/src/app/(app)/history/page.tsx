"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { TransactionRow } from "@/components/transaction-row";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDay, formatMoney, pluralize } from "@/lib/format";
import { useCategories, useTransactions } from "@/lib/queries";
import type { Transaction, TransactionType } from "@/lib/types";
import { useMonth } from "@/lib/use-month";
import { cn } from "@/lib/utils";

type TypeFilter = TransactionType | "ALL";

export default function HistoryPage() {
  const params = useSearchParams();
  const initialType = params.get("type");
  const [month] = useMonth();
  const [type, setType] = useState<TypeFilter>(
    initialType === "INCOME" || initialType === "EXPENSE" ? initialType : "ALL",
  );
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
      <PageHeader title="История" subtitle="Все операции за месяц" action={<div className="hidden md:block"><MonthPicker /></div>} />
      <div className="-mt-3 mb-4 md:hidden">
        <MonthPicker variant="inline" />
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Segmented
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

/** Операции сгруппированы по дням с итогом расходов за день. */
function GroupedList({ items }: { items: Transaction[] }) {
  const groups: { date: string; items: Transaction[] }[] = [];
  for (const tx of items) {
    const last = groups.at(-1);
    if (last?.date === tx.date) last.items.push(tx);
    else groups.push({ date: tx.date, items: [tx] });
  }
  return (
    <div className="flex flex-col">
      {groups.map((g) => {
        const spent = g.items.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);
        return (
          <section key={g.date} className="pt-4 first:pt-2">
            <div className="flex items-baseline justify-between pb-1 text-xs font-medium text-muted-foreground">
              <span>{formatDay(g.date)}</span>
              {spent > 0 && <span className="tabular-nums">− {formatMoney(spent)}</span>}
            </div>
            <div className="divide-y divide-border/60">
              {g.items.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} showTime={false} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Segmented({ value, onChange }: { value: TypeFilter; onChange: (v: TypeFilter) => void }) {
  const options: { value: TypeFilter; label: string }[] = [
    { value: "ALL", label: "Все" },
    { value: "EXPENSE", label: "Расходы" },
    { value: "INCOME", label: "Доходы" },
  ];
  return (
    <div className="grid h-10 shrink-0 grid-cols-3 rounded-xl bg-muted p-1 text-sm md:w-72">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg font-medium transition",
            value === o.value ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CategoryFilter({
  type,
  value,
  onChange,
}: {
  type: TypeFilter;
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const { data = [] } = useCategories({ includeArchived: true });
  const categories = data.filter((c) => type === "ALL" || c.type === type);
  const label =
    value.length === 0
      ? "Все категории"
      : value.length === 1
        ? (data.find((c) => c.id === value[0])?.name ?? "1 категория")
        : `${value.length} ${pluralize(value.length, ["категория", "категории", "категорий"])}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-10 shrink-0 items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-sm transition hover:bg-muted/60 md:w-52",
          value.length > 0 && "border-foreground/20 font-medium",
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 min-w-60">
        {value.length > 0 && (
          <>
            <DropdownMenuItem onClick={() => onChange([])}>Сбросить</DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {categories.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.id}
            closeOnClick={false}
            checked={value.includes(c.id)}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, c.id] : value.filter((id) => id !== c.id))
            }
          >
            <CategoryIcon icon={c.icon} color={c.color} size="sm" className="size-6 [&_svg]:size-3.5" />
            <span className={cn(c.archivedAt && "text-muted-foreground")}>
              {c.name}
              {type === "ALL" && <span className="text-muted-foreground"> · {c.type === "INCOME" ? "доход" : "расход"}</span>}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
