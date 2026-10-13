/** Отложенная покупка: «подумать ещё раз» в день remindOn */
export interface Reminder {
  id: number;
  title: string;
  /** YYYY-MM-DD */
  remindOn: string;
  createdAt: string;
}
