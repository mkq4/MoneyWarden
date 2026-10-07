/** Ввод суммы строкой: "1234", "1234,5". Максимум 10 млн ₽ (лимит бэкенда). */
const MAX_INT_DIGITS = 8;

export function pressKey(value: string, key: string): string {
  if (key === "backspace") return value.slice(0, -1);
  if (key === ",") {
    if (value.includes(",")) return value;
    return (value || "0") + ",";
  }
  if (!/^\d$/.test(key)) return value;
  const [int, frac] = value.split(",");
  if (frac !== undefined) return frac.length >= 2 ? value : value + key;
  if (int === "0" || int === "") return key === "0" && int === "" ? "0" : key;
  return int.length >= MAX_INT_DIGITS ? value : value + key;
}

export function toKopecks(value: string): number {
  if (!value) return 0;
  const [int, frac = ""] = value.split(",");
  return Number(int || 0) * 100 + Number((frac + "00").slice(0, 2));
}

export function fromKopecks(kopecks: number): string {
  const int = Math.floor(kopecks / 100);
  const frac = kopecks % 100;
  if (!frac) return String(int);
  return `${int},${String(frac).padStart(2, "0").replace(/0$/, "")}`;
}

const group = new Intl.NumberFormat("ru-RU");

/** "1234,5" → "1 234,5" */
export function displayAmount(value: string): string {
  if (!value) return "0";
  const [int, frac] = value.split(",");
  const grouped = group.format(Number(int || 0));
  return frac !== undefined ? `${grouped},${frac}` : grouped;
}
