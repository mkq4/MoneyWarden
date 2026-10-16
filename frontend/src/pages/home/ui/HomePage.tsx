import { Dashboard } from "@/widgets/dashboard";
import { DueReminders } from "@/widgets/due-reminders";

export function HomePage() {
  return <Dashboard notices={<DueReminders />} />;
}
