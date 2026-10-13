import { request } from "@/shared/api";
import { arrayOf, shape, type Guard } from "@/shared/lib/guards";
import { isReminder } from "../model/guards";
import type { DeleteReminderResponse, IReminderService } from "./reminder.service.interface";

const isTrue = (value: unknown): value is true => value === true;

const isDeleteReminderResponse: Guard<DeleteReminderResponse> = shape<DeleteReminderResponse>({ deleted: isTrue });

export const reminderService: IReminderService = {
  list: () => request("GET", "/reminders", arrayOf(isReminder)),
  create: (body) => request("POST", "/reminders", isReminder, { body }),
  remove: (id) => request("DELETE", `/reminders/${id}`, isDeleteReminderResponse),
};
