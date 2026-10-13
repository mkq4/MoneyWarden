import type { Reminder } from "@/entities/reminder";
import { Panel, PanelTitle } from "@/shared/ui/panel";
import { ReminderItem } from "./ReminderItem";

export function ReminderList({ title, reminders, due }: { title: string; reminders: Reminder[]; due: boolean }) {
  if (reminders.length === 0) return null;
  return (
    <Panel>
      <PanelTitle>{title}</PanelTitle>
      <div className="flex flex-col">
        {reminders.map((r) => (
          <ReminderItem key={r.id} reminder={r} due={due} />
        ))}
      </div>
    </Panel>
  );
}
