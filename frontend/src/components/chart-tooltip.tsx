import { formatMoney } from "@/lib/format";

interface Item {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
}

/** Тултип графиков: заголовок + строки «● Название — сумма». */
export function MoneyTooltip({
  active,
  payload,
  title,
}: {
  active?: boolean;
  payload?: readonly Item[];
  title?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {title && <div className="mb-1.5 font-medium">{title}</div>}
      <div className="flex flex-col gap-1">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="flex-1 text-muted-foreground">{p.name}</span>
            <span className="font-medium tabular-nums">{formatMoney(Number(p.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const num = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

/** Короткие подписи оси: копейки → «850», «12к», «1,2 млн». */
export function axisMoney(kopecks: number): string {
  const rub = kopecks / 100;
  if (Math.abs(rub) >= 1_000_000) return `${num.format(rub / 1_000_000)} млн`;
  if (Math.abs(rub) >= 1_000) return `${num.format(rub / 1_000)}к`;
  return num.format(rub);
}
