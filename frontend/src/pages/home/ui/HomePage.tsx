import { Dashboard } from "@/widgets/dashboard";
import { DueReminders } from "@/widgets/due-reminders";
import { MobileMenu } from "@/widgets/header";

export function HomePage() {
  return <Dashboard menu={<MobileMenu />} notices={<DueReminders />} />;
}
