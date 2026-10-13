import { Hourglass, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Panel } from "@/shared/ui/panel";

export function RemindersEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <Panel className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Hourglass className="size-6" />
      </span>
      <div className="max-w-sm">
        <div className="font-semibold">Захотелось что-то купить?</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Не покупай на эмоциях — запиши и вернись к покупке через пару недель. Часто оказывается, что она не нужна.
        </p>
      </div>
      <Button onClick={onAdd}>
        <Plus /> Добавить покупку
      </Button>
    </Panel>
  );
}
