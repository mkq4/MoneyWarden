import { Plus } from "lucide-react";

/** Телефон: «+ Добавить» справа снизу над вкладками (BottomNav — 3.5rem) — под большим пальцем. */
export function AddReminderFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-30 flex h-14 items-center gap-2 rounded-full bg-primary pr-6 pl-5 text-base font-medium text-primary-foreground shadow-lg transition active:scale-95 md:hidden"
    >
      <Plus className="size-6" />
      Добавить
    </button>
  );
}
