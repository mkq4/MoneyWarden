import { ChevronRight } from "lucide-react";
import Link from "next/link";

/** Большая кнопка-карточка: ссылка, если передан href, иначе кнопка. */
export function ActionCard({
  icon,
  title,
  subtitle,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "group flex w-full items-center gap-4 rounded-2xl border border-border/80 bg-surface px-4 py-3.5 text-left transition hover:border-border hover:bg-muted/30 md:px-5 md:py-5";
  const content = (
    <>
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
