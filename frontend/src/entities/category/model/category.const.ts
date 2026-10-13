import {
  Baby, Banknote, Book, Briefcase, Bus, Car, CircleDollarSign, Coffee, Dog, Dumbbell,
  Ellipsis, Fuel, Gamepad2, Gift, GraduationCap, HeartPulse, House, Laptop, PiggyBank,
  Percent, Pill, Plane, Scissors, Shirt, ShoppingBag, ShoppingCart, Smartphone, Sparkles,
  TrendingUp, Utensils, Wifi, Wrench, type LucideIcon,
} from "lucide-react";

/** Палитра категорий: иконка цвета категории на подложке того же цвета с прозрачностью — читается в обеих темах. */
export const CATEGORY_COLORS = [
  "#22c55e", "#16a34a", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#f43f5e", "#ef4444", "#f97316", "#eab308",
  "#84cc16", "#64748b",
];

/** Цвет категории, у которой свой цвет не задан. */
export const FALLBACK_CATEGORY_COLOR = "#64748b";

/**
 * Иконки категорий по имени (как хранится в БД). Фиксированный набор,
 * чтобы не тянуть в бандл весь lucide. Имена совпадают с именами lucide.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  coffee: Coffee,
  bus: Bus,
  car: Car,
  fuel: Fuel,
  plane: Plane,
  house: House,
  wifi: Wifi,
  smartphone: Smartphone,
  "heart-pulse": HeartPulse,
  pill: Pill,
  shirt: Shirt,
  "shopping-bag": ShoppingBag,
  scissors: Scissors,
  "gamepad-2": Gamepad2,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  book: Book,
  "graduation-cap": GraduationCap,
  baby: Baby,
  dog: Dog,
  wrench: Wrench,
  gift: Gift,
  briefcase: Briefcase,
  laptop: Laptop,
  banknote: Banknote,
  percent: Percent,
  "trending-up": TrendingUp,
  "piggy-bank": PiggyBank,
  "circle-dollar-sign": CircleDollarSign,
  ellipsis: Ellipsis,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export const DEFAULT_CATEGORY_ICON = "ellipsis";
