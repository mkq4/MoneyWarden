"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { CalendarDays, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import { formatDay, toISODate } from "@/lib/format";
import { useCategories, useDeleteTransaction, useSaveTransaction } from "@/lib/queries";
import type { Category, Transaction, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { displayAmount, fromKopecks, pressKey, toKopecks } from "./amount";
import { CategoryPicker } from "./category-picker";
import { Keypad } from "./keypad";

type Mode =
  | { kind: "add"; type: TransactionType; onSaved?: () => void }
  | { kind: "edit"; tx: Transaction; onSaved?: () => void };

interface TransactionDialogApi {
  openAdd: (type: TransactionType, opts?: { onSaved?: () => void }) => void;
  openEdit: (tx: Transaction) => void;
}

const Ctx = createContext<TransactionDialogApi | null>(null);

export function useTransactionDialog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTransactionDialog outside provider");
  return ctx;
}

export function TransactionDialogProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [open, setOpen] = useState(false);
  // key пересоздаёт форму при каждом открытии — состояние не протекает между операциями
  const [formKey, setFormKey] = useState(0);
  // Фокус — на само окно, а не на кнопку «назад» (иначе на ней висит обводка).
  const popupRef = useRef<HTMLDivElement>(null);

  const api = useMemo<TransactionDialogApi>(
    () => ({
      openAdd: (type, opts) => {
        setMode({ kind: "add", type, onSaved: opts?.onSaved });
        setFormKey((k) => k + 1);
        setOpen(true);
      },
      openEdit: (tx) => {
        setMode({ kind: "edit", tx });
        setFormKey((k) => k + 1);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20 duration-150 supports-backdrop-filter:backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup
            ref={popupRef}
            initialFocus={popupRef}
            className={cn(
              "fixed z-50 flex flex-col bg-surface outline-none",
              // телефон — на весь экран, как в макете
              "inset-0 h-dvh duration-200 data-open:animate-in data-open:slide-in-from-bottom-8 data-closed:animate-out data-closed:fade-out-0",
              // десктоп — карточка по центру
              "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[400px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:shadow-2xl sm:ring-1 sm:ring-black/5 sm:data-open:zoom-in-95 sm:data-open:slide-in-from-bottom-0",
            )}
          >
            {mode && (
              <TransactionForm
                key={formKey}
                mode={mode}
                onDone={() => {
                  setOpen(false);
                  mode.onSaved?.();
                }}
                onClose={() => setOpen(false)}
              />
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </Ctx.Provider>
  );
}

const LAST_CATEGORY_KEY = "mw:last-category:";

function readLastCategory(type: TransactionType): number | null {
  try {
    const v = localStorage.getItem(LAST_CATEGORY_KEY + type);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

function writeLastCategory(type: TransactionType, id: number) {
  try {
    localStorage.setItem(LAST_CATEGORY_KEY + type, String(id));
  } catch {
    /* приватный режим — не страшно */
  }
}

function TransactionForm({
  mode,
  onDone,
  onClose,
}: {
  mode: Mode;
  onDone: () => void;
  onClose: () => void;
}) {
  const editing = mode.kind === "edit" ? mode.tx : null;
  const [type, setType] = useState<TransactionType>(editing?.type ?? (mode.kind === "add" ? mode.type : "EXPENSE"));
  const [amount, setAmount] = useState(editing ? fromKopecks(editing.amount) : "");
  // null — пользователь ещё не выбирал: берём категорию по умолчанию
  const [pickedId, setCategoryId] = useState<number | null>(editing?.categoryId ?? null);
  const [date, setDate] = useState(editing?.date ?? toISODate(new Date()));
  const [comment, setComment] = useState(editing?.comment ?? "");
  const [step, setStep] = useState<"amount" | "category">("amount");
  const dateRef = useRef<HTMLInputElement>(null);

  // При редактировании категорию можно поменять на категорию другого типа —
  // поэтому грузим все активные и фильтруем по текущему типу.
  const { data: allCategories = [] } = useCategories();
  const categories = allCategories.filter((c) => c.type === type);
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();

  // Категория по умолчанию: последняя использованная, иначе первая в списке.
  const [lastUsed] = useState(() => ({
    EXPENSE: readLastCategory("EXPENSE"),
    INCOME: readLastCategory("INCOME"),
  }));
  const categoryId =
    pickedId ?? categories.find((c) => c.id === lastUsed[type])?.id ?? categories[0]?.id ?? null;

  const category: Pick<Category, "id" | "name" | "icon" | "color"> | undefined =
    categories.find((c) => c.id === categoryId) ??
    (editing && editing.categoryId === categoryId ? editing.category : undefined);

  const kopecks = toKopecks(amount);
  const canSave = kopecks > 0 && !!categoryId && !save.isPending;

  const submit = useCallback(() => {
    if (!canSave || !categoryId) return;
    save.mutate(
      { id: editing?.id, categoryId, amount: kopecks, date, comment: comment.trim() || null },
      {
        onSuccess: () => {
          writeLastCategory(type, categoryId);
          toast.success(editing ? "Сохранено" : type === "INCOME" ? "Доход добавлен" : "Расход добавлен");
          onDone();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }, [canSave, categoryId, comment, date, editing, kopecks, onDone, save, type]);

  // Ввод суммы с физической клавиатуры (кроме случаев, когда фокус в поле ввода).
  useEffect(() => {
    if (step !== "amount") return;
    const onKey = (e: KeyboardEvent) => {
      const inField = e.target instanceof HTMLInputElement;
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key === "Backspace" ? "backspace" : e.key === "." ? "," : e.key;
      if (/^[\d,]$/.test(key) || key === "backspace") {
        e.preventDefault();
        setAmount((v) => pressKey(v, key));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, submit]);

  const title =
    step === "category"
      ? type === "INCOME" ? "Категория дохода" : "Категория расхода"
      : editing ? "Изменить операцию" : type === "INCOME" ? "Добавить доход" : "Добавить расход";

  const deleteTx = () => {
    if (!editing || !confirm("Удалить операцию?")) return;
    remove.mutate(editing.id, {
      onSuccess: () => {
        toast.success("Операция удалена");
        onDone();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),1.25rem)] sm:pt-4">
      {/* Шапка: ‹  Заголовок  [🗑] */}
      <div className="relative flex h-11 items-center justify-center">
        <button
          type="button"
          onClick={() => (step === "category" ? setStep("amount") : onClose())}
          className="absolute left-0 flex size-9 items-center justify-center rounded-full transition hover:bg-muted"
          aria-label="Назад"
        >
          <ChevronLeft className="size-5" />
        </button>
        <DialogPrimitive.Title className="text-[15px] font-semibold">{title}</DialogPrimitive.Title>
        {editing && step === "amount" && (
          <button
            type="button"
            onClick={deleteTx}
            className="absolute right-0 flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-expense-soft hover:text-expense"
            aria-label="Удалить операцию"
          >
            <Trash2 className="size-[18px]" />
          </button>
        )}
      </div>

      {step === "category" ? (
        <div className="-mx-5 mt-3 min-h-0 flex-1 overflow-y-auto px-5 sm:max-h-[520px]">
          <CategoryPicker
            type={type}
            categories={categories}
            selectedId={categoryId}
            onSelect={(c) => {
              setCategoryId(c.id);
              setType(c.type);
              setStep("amount");
            }}
          />
          {editing && (
            <button
              type="button"
              className="mt-3 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setType(type === "INCOME" ? "EXPENSE" : "INCOME");
                setCategoryId(null);
              }}
            >
              {type === "INCOME" ? "Сделать расходом" : "Сделать доходом"}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 sm:flex-none sm:py-7">
            <TypeBadge type={type} size="xl" />
            <div
              className={cn(
                "text-center text-5xl font-normal tracking-tight tabular-nums transition-colors",
                !kopecks && "text-foreground/80",
              )}
              aria-live="polite"
            >
              {displayAmount(amount)} ₽
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[13px] text-muted-foreground">Категория</div>
            <button
              type="button"
              onClick={() => setStep("category")}
              className="flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 text-left text-[15px] font-medium ring-1 ring-border shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:bg-muted/50"
            >
              {category ? (
                <>
                  <CategoryIcon icon={category.icon} color={category.color} size="sm" />
                  <span className="flex-1">{category.name}</span>
                </>
              ) : (
                <span className="flex-1 py-1.5 text-muted-foreground">Выберите категорию</span>
              )}
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => dateRef.current?.showPicker?.()}
                className="relative flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-muted px-3 text-sm transition hover:bg-accent"
              >
                <CalendarDays className="size-4 text-muted-foreground" />
                {formatDay(date)}
                <input
                  ref={dateRef}
                  type="date"
                  value={date}
                  max={toISODate(new Date())}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  className="pointer-events-none absolute inset-0 opacity-0"
                  tabIndex={-1}
                  aria-label="Дата операции"
                />
              </button>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий"
                maxLength={500}
                className="h-10 min-w-0 flex-1 rounded-xl bg-muted px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <div className="mt-4">
            <Keypad onKey={(key) => setAmount((v) => pressKey(v, key))} />
          </div>

          <Button
            onClick={submit}
            disabled={!canSave}
            className={cn(
              "mt-4 h-12 w-full rounded-2xl text-[15px] font-semibold text-white",
              type === "INCOME" ? "bg-income hover:bg-income/90" : "bg-expense hover:bg-expense/90",
            )}
          >
            {save.isPending ? "Сохраняем…" : "Сохранить"}
          </Button>
        </>
      )}
    </div>
  );
}
