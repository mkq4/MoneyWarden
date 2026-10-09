import type { EditorMode } from "../model/mode";
import { AdjustmentView } from "./AdjustmentView";
import { BalanceForm } from "./BalanceForm";
import { SavingForm } from "./SavingForm";
import { TransactionForm } from "./TransactionForm";

/** Подходящая форма по режиму редактора. */
export function EditorBody({ mode, onDone, onClose }: { mode: EditorMode; onDone: () => void; onClose: () => void }) {
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
