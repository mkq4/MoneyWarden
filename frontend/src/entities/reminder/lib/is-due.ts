import type { Reminder } from "../model/types";

/** Напоминание наступило: today — локальная дата YYYY-MM-DD. */
export const isDue = (reminder: Reminder, today: string): boolean => reminder.remindOn <= today;
