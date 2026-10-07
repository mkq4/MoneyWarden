"use client";

import { ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CategoryIcon, useCategories, type CategoryRef, type CategoryType } from "@/entities/category";
import { useCreateTransaction, useUpdateTransaction } from "@/entities/transaction";
import { toISODate } from "@/shared/lib/format";
import { fromKopecks, pressKey, toKopecks } from "../lib/amount";
import { readLastCategory, writeLastCategory } from "../lib/last-category";
import type { FormProps } from "../model/form-props";
import type { AddMode, EditMode } from "../model/mode";
import { useAmountKeyboard } from "../model/use-amount-keyboard";
import { useConfirmDelete } from "../model/use-confirm-delete";
import { AmountHero } from "./amount-hero";
import { CategoryPicker } from "./category-picker";
import { DateChip } from "./date-chip";
import { FormShell } from "./form-shell";
import { Keypad } from "./keypad";
import { SaveButton } from "./save-button";

type Step = "amount" | "category";

/** Доход или расход: сумма, категория, дата, комментарий. */
export function TransactionForm({ mode, onDone, onClose }: FormProps & { mode: AddMode | EditMode }) {
  const editing = mode.kind === "edit" ? mode.tx : null;
  const [type, setType] = useState<CategoryType>(mode.type);
  const [amount, setAmount] = useState(editing ? fromKopecks(editing.amount) : "");
  // null — пользователь ещё не выбирал: берём категорию по умолчанию
  const [pickedId, setCategoryId] = useState<number | null>(editing?.categoryId ?? null);
  const [date, setDate] = useState(editing?.date ?? toISODate(new Date()));
  const [comment, setComment] = useState(editing?.comment ?? "");
  const [step, setStep] = useState<Step>("amount");

  // При редактировании категорию можно поменять на категорию другого типа —
  // поэтому грузим все активные и фильтруем по текущему типу.
  const { data: allCategories = [] } = useCategories();
  const categories = allCategories.filter((c) => c.type === type);
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const confirmDelete = useConfirmDelete("Удалить операцию?", onDone);
  const pending = create.isPending || update.isPending;

  // Категория по умолчанию: последняя использованная, иначе первая в списке.
  const [lastUsed] = useState<Record<CategoryType, number | null>>(() => ({
    EXPENSE: readLastCategory("EXPENSE"),
    INCOME: readLastCategory("INCOME"),
  }));
  const categoryId =
    pickedId ?? categories.find((c) => c.id === lastUsed[type])?.id ?? categories[0]?.id ?? null;

  const category: CategoryRef | undefined =
    categories.find((c) => c.id === categoryId) ??
    (editing && editing.categoryId === categoryId ? (editing.category ?? undefined) : undefined);

  const kopecks = toKopecks(amount);
  const canSave = kopecks > 0 && categoryId !== null && !pending;

  const submit = useCallback(() => {
    if (!canSave || categoryId === null) return;
    const body = { categoryId, amount: kopecks, date, comment: comment.trim() || null };
    const callbacks = {
      onSuccess: () => {
        writeLastCategory(type, categoryId);
        toast.success(editing ? "Сохранено" : type === "INCOME" ? "Доход добавлен" : "Расход добавлен");
        onDone();
      },
      onError: (err: Error) => toast.error(err.message),
    };
    if (editing) update.mutate({ id: editing.id, body }, callbacks);
    else create.mutate(body, callbacks);
  }, [canSave, categoryId, comment, create, date, editing, kopecks, onDone, type, update]);

  useAmountKeyboard(setAmount, submit, step === "amount");

  const title =
    step === "category"
      ? type === "INCOME" ? "Категория дохода" : "Категория расхода"
      : editing ? "Изменить операцию" : type === "INCOME" ? "Добавить доход" : "Добавить расход";

  return (
    <FormShell
      title={title}
      onBack={() => (step === "category" ? setStep("amount") : onClose())}
      onDelete={editing && step === "amount" ? () => confirmDelete(editing.id) : undefined}
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
              className="flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 text-left text-[15px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-border transition hover:bg-muted/50"
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

          <SaveButton type={type} onClick={submit} disabled={!canSave} pending={pending} />
        </>
      )}
    </FormShell>
  );
}
