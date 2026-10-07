import { Dashboard } from "@/widgets/dashboard";
import { MobileMenu } from "@/widgets/header";

export function HomePage() {
  return <Dashboard menu={<MobileMenu />} />;
}
