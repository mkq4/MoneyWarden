"use client";

import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { CategoryEditorForm } from "../components";
import type { EditorTarget } from "../model/types";

export function CategoryEditor({ target, onClose }: { target: EditorTarget; onClose: () => void }) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-5 sm:max-w-md">
        {target && (
          <CategoryEditorForm key={"category" in target ? target.category.id : target.type} target={target} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
