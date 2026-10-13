"use client";

import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { ReminderForm } from "../components";

export function ReminderCreator({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-5 sm:max-w-md">{open && <ReminderForm onClose={onClose} />}</DialogContent>
    </Dialog>
  );
}
