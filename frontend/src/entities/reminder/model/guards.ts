import { isNumber, isString, shape, type Guard } from "@/shared/lib/guards";
import type { Reminder } from "./types";

export const isReminder: Guard<Reminder> = shape<Reminder>({
  id: isNumber,
  title: isString,
  remindOn: isString,
  createdAt: isString,
});
