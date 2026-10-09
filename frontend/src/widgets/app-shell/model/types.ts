import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** пути, на которых пункт подсвечен */
  match: string[];
  /** переносить ли выбранный месяц (?m=) при переходе */
  keepMonth: boolean;
}
