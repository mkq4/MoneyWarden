"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronRight } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { toISODate } from "@/lib/format";
import { useCategories, useDeleteTransaction, useSaveTransaction } from "@/lib/queries";
import type { Category, CategoryType, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fromKopecks, pressKey, toKopecks } from "./amount";
import { CategoryPicker } from "./category-picker";
import { AmountHero, DateChip, FormShell, SaveButton, useAmountKeyboard } from "./form-parts";
import { Keypad } from "./keypad";
import { AdjustmentView, BalanceForm, SavingForm } from "./savings-forms";

type Mode =
  | { kind: "add"; type: CategoryType; onSaved?: () => void }
  | { kind: "edit"; tx: Transaction; onSaved?: () => void }
  | { kind: "saving"; tx?: Transaction; onSaved?: () => void }
  | { kind: "balance"; onSaved?: () => void }
  | { kind: "adjustment"; tx: Transaction; onSaved?: () => void };

type Opts = { onSaved?: () => void };

interface TransactionDialogApi {
  openAdd: (type: CategoryType, opts?: Opts) => void;
  /** Открывает подходящую форму по типу операции */
  openEdit: (tx: Transaction) => void;
  openSaving: (opts?: Opts) => void;
  openBalance: (opts?: Opts) => void;
}

function modeForTransaction(tx: Transaction): Mode {
  switch (tx.type) {
    case "SAVING":
      return { kind: "saving", tx };
    case "SAVING_ADJUSTMENT":
      return { kind: "adjustment", tx };
    default:
      return { kind: "edit", tx };
  }
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

  const api = useMemo<TransactionDialogApi>(() => {
    const show = (next: Mode) => {
      setMode(next);
      setFormKey((k) => k + 1);
      setOpen(true);
    };
    return {
      openAdd: (type, opts) => show({ kind: "add", type, onSaved: opts?.onSaved }),
      openEdit: (tx) => show(modeForTransaction(tx)),
      openSaving: (opts) => show({ kind: "saving", onSaved: opts?.onSaved }),
      openBalance: (opts) => show({ kind: "balance", onSaved: opts?.onSaved }),
    };
  }, []);

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
              <DialogBody
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

function DialogBody({ mode, onDone, onClose }: { mode: Mode; onDone: () => void; onClose: () => void }) {
  switch (mode.kind) {
    case "add":
    case "edit":
      return <TransactionForm mode={mode} onDone={onDone} onClose={onClose} />;
    case "saving":
      return <SavingForm tx={mode.tx} onDone={onDone} onClose={onClose} />;
    case "balance":
      return <BalanceForm onDone={onDone} onClose={onClose} />;
    case "adjustment":
      return <AdjustmentView tx={mode.tx} onDone={onDone} onClose={onClose} />;
  }
}

const LAST_CATEGORY_KEY = "mw:last-category:";

function readLastCategory(type: CategoryType): number | null {
  try {
    const v = localStorage.getItem(LAST_CATEGORY_KEY + type);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

function writeLastCategory(type: CategoryType, id: number) {
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
  mode: Extract<Mode, { kind: "add" | "edit" }>;
  onDone: () => void;
  onClose: () => void;
}) {
  const editing = mode.kind === "edit" ? mode.tx : null;
  // Сюда попадают только доходы и расходы — у них тип совпадает с типом категории.
  const [type, setType] = useState<CategoryType>(
    mode.kind === "add" ? mode.type : (mode.tx.type as CategoryType),
  );
  const [amount, setAmount] = useState(editing ? fromKopecks(editing.amount) : "");
  // null — пользователь ещё не выбирал: берём категорию по умолчанию
  const [pickedId, setCategoryId] = useState<number | null>(editing?.categoryId ?? null);
  const [date, setDate] = useState(editing?.date ?? toISODate(new Date()));
  const [comment, setComment] = useState(editing?.comment ?? "");
  const [step, setStep] = useState<"amount" | "category">("amount");

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
    (editing && editing.categoryId === categoryId ? (editing.category ?? undefined) : undefined);

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

  useAmountKeyboard(setAmount, submit, step === "amount");

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
    <FormShell
      title={title}
      onBack={() => (step === "category" ? setStep("amount") : onClose())}
      onDelete={editing && step === "amount" ? deleteTx : undefined}
    >
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
          <AmountHero type={type} amount={amount} />

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
              <DateChip value={date} onChange={setDate} />
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

          <SaveButton type={type} onClick={submit} disabled={!canSave} pending={save.isPending} />
        </>
      )}
    </FormShell>
  );
}
