"use client";

import { toast } from "sonner";
import { useDeleteTransaction } from "@/entities/transaction";

/** Удаление операции с подтверждением: возвращает (id) => void. */
export function useConfirmDelete(message: string, onDone: () => void) {
  const remove = useDeleteTransaction();
  return (id: number) => {
    if (!confirm(message)) return;
    remove.mutate(id, {
      onSuccess: () => {
        toast.success("Операция удалена");
        onDone();
      },
      onError: (err) => toast.error(err.message),
    });
  };
}
