import { ChartNoAxesColumn, History, House, Settings, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/shared/config";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** пути, на которых пункт подсвечен */
  match: string[];
  /** переносить ли выбранный месяц (?m=) при переходе */
  keepMonth: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { href: ROUTES.home, label: "Главная", icon: House, match: [ROUTES.start, ROUTES.home], keepMonth: true },
  { href: ROUTES.history, label: "История", icon: History, match: [ROUTES.history], keepMonth: true },
  { href: ROUTES.stats, label: "Статистика", icon: ChartNoAxesColumn, match: [ROUTES.stats], keepMonth: true },
];

export const SETTINGS_NAV: NavItem = {
  href: ROUTES.settings,
  label: "Настройки",
  icon: Settings,
  match: [ROUTES.settings],
  keepMonth: false,
};
