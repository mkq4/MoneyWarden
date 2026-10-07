"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { TransactionEditorContext, type TransactionEditorApi } from "../model/context";
import { modeForTransaction, type EditorMode } from "../model/mode";
import { AdjustmentView } from "./adjustment-view";
import { BalanceForm } from "./balance-form";
import { SavingForm } from "./saving-form";
import { TransactionForm } from "./transaction-form";

/** Диалог операций: один на приложение, открывается через useTransactionEditor(). */
export function TransactionEditorProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<EditorMode | null>(null);
  const [open, setOpen] = useState(false);
  // key пересоздаёт форму при каждом открытии — состояние не протекает между операциями
  const [formKey, setFormKey] = useState(0);
  // Фокус — на само окно, а не на кнопку «назад» (иначе на ней висит обводка).
  const popupRef = useRef<HTMLDivElement>(null);

  const api = useMemo<TransactionEditorApi>(() => {
    const show = (next: EditorMode) => {
      setMode(next);
      setFormKey((k) => k + 1);
      setOpen(true);
    };
    return {
      openAdd: (type, options) => show({ kind: "add", type, onSaved: options?.onSaved }),
      openEdit: (tx) => show(modeForTransaction(tx)),
      openSaving: (options) => show({ kind: "saving", onSaved: options?.onSaved }),
      openBalance: (options) => show({ kind: "balance", onSaved: options?.onSaved }),
    };
  }, []);

  return (
    <TransactionEditorContext.Provider value={api}>
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
              <EditorBody
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
    </TransactionEditorContext.Provider>
  );
}

function EditorBody({ mode, onDone, onClose }: { mode: EditorMode; onDone: () => void; onClose: () => void }) {
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
