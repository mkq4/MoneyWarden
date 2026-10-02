import { Ellipsis } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

const FALLBACK = "#64748b";

/** Иконка категории в пастельном круге цвета категории. */
export function CategoryIcon({
  icon,
  color,
  className,
  size = "md",
}: {
  icon: string | null | undefined;
  color: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = (icon && CATEGORY_ICONS[icon]) || Ellipsis;
  const c = color ?? FALLBACK;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        size === "sm" && "size-8 [&_svg]:size-4",
        size === "md" && "size-10 [&_svg]:size-[18px]",
        size === "lg" && "size-12 [&_svg]:size-5",
        className,
      )}
      style={{ backgroundColor: `${c}1f`, color: c }}
    >
      <Icon strokeWidth={2} />
    </span>
  );
}
