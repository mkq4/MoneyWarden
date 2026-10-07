"use client";

import { createContext, useContext } from "react";
import type { CategoryType } from "@/entities/category";
import type { Transaction } from "@/entities/transaction";

export interface OpenOptions {
  onSaved?: () => void;
}

export interface TransactionEditorApi {
  openAdd: (type: CategoryType, options?: OpenOptions) => void;
  /** Открывает подходящую форму по типу операции */
  openEdit: (tx: Transaction) => void;
  openSaving: (options?: OpenOptions) => void;
  openBalance: (options?: OpenOptions) => void;
}

export const TransactionEditorContext = createContext<TransactionEditorApi | null>(null);

export function useTransactionEditor(): TransactionEditorApi {
  const ctx = useContext(TransactionEditorContext);
  if (!ctx) throw new Error("useTransactionEditor outside TransactionEditorProvider");
  return ctx;
}
