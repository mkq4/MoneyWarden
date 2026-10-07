const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

/** 5248000 → «52 480 ₽» (копейки показываются, только если они есть). */
export function formatMoney(kopecks: number): string {
  return `${rub.format(Math.abs(kopecks) / 100)} ₽`;
}

/** Короткие подписи оси: копейки → «850», «12к», «1,2 млн». */
export function formatMoneyAxis(kopecks: number): string {
  const value = kopecks / 100;
  if (Math.abs(value) >= 1_000_000) return `${compact.format(value / 1_000_000)} млн`;
  if (Math.abs(value) >= 1_000) return `${compact.format(value / 1_000)}к`;
  return compact.format(value);
}
