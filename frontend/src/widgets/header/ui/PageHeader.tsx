/**
 * Десктоп: крупный заголовок + подзаголовок + действие справа.
 * Телефон: то же компактнее; навигация — во вкладках снизу (BottomNav).
 */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight md:text-[32px] md:leading-tight">{title}</h1>
        {subtitle && <div className="mt-0.5 text-sm text-muted-foreground md:mt-1.5 md:text-[15px]">{subtitle}</div>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}
