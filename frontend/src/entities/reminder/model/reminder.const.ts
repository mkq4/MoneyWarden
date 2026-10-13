/** Через сколько дней можно напомнить; те же границы проверяет бэкенд. */
export const REMINDER_MIN_DAYS = 3;
export const REMINDER_MAX_DAYS = 30;
export const REMINDER_DEFAULT_DAYS = 14;

export const REMINDER_PRESETS = [
  { days: 3, label: "3 дня" },
  { days: 7, label: "Неделя" },
  { days: 14, label: "2 недели" },
  { days: 30, label: "Месяц" },
] as const;
