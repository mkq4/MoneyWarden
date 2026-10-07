import {
  Baby, Banknote, Book, Briefcase, Bus, Car, CircleDollarSign, Coffee, Dog, Dumbbell,
  Ellipsis, Fuel, Gamepad2, Gift, GraduationCap, HeartPulse, House, Laptop, PiggyBank,
  Percent, Pill, Plane, Scissors, Shirt, ShoppingBag, ShoppingCart, Smartphone, Sparkles,
  TrendingUp, Utensils, Wifi, Wrench, type LucideIcon,
} from "lucide-react";

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

export const getCategoryIcon = (name: string | null | undefined): LucideIcon =>
  (name && CATEGORY_ICONS[name]) || Ellipsis;
