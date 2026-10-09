import { cn } from "@/shared/lib/cn";

/** Белая карточка-секция в стиле макетов. */
export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-2xl border border-border/80 bg-surface p-5 md:p-6", className)}
      {...props}
    />
  );
}
