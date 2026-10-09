import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function PanelTitle({
  children,
  href,
  action,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const title = <h2 className="text-[17px] font-semibold tracking-tight">{children}</h2>;
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      {href ? (
        <Link href={href} className="group flex flex-1 items-center justify-between gap-2">
          {title}
          <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
        </Link>
      ) : (
        title
      )}
      {action}
    </div>
  );
}
