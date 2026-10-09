import { Ellipsis, type LucideIcon } from "lucide-react";
import { CATEGORY_ICONS } from "../model/category.const";

export const getCategoryIcon = (name: string | null | undefined): LucideIcon =>
  (name && CATEGORY_ICONS[name]) || Ellipsis;
