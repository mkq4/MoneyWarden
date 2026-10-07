import type { CategoryType } from "@/entities/category";
import type { Transaction } from "@/entities/transaction";

interface ModeBase {
  /** вызывается после успешного сохранения или удаления */
  onSaved?: () => void;
}

export type AddMode = ModeBase & { kind: "add"; type: CategoryType };
/** Редактирование дохода/расхода: type — тип категории операции. */
export type EditMode = ModeBase & { kind: "edit"; tx: Transaction; type: CategoryType };
export type SavingMode = ModeBase & { kind: "saving"; tx?: Transaction };
export type BalanceMode = ModeBase & { kind: "balance" };
export type AdjustmentMode = ModeBase & { kind: "adjustment"; tx: Transaction };

export type EditorMode = AddMode | EditMode | SavingMode | BalanceMode | AdjustmentMode;

/** Подходящая форма по типу операции. */
export function modeForTransaction(tx: Transaction): EditorMode {
  switch (tx.type) {
    case "INCOME":
    case "EXPENSE":
      return { kind: "edit", tx, type: tx.type };
    case "SAVING":
      return { kind: "saving", tx };
    case "SAVING_ADJUSTMENT":
      return { kind: "adjustment", tx };
  }
}
