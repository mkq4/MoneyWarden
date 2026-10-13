import type { Reminder } from "../model/types";

/** GET /reminders — по возрастанию remindOn */
export type ListRemindersResponse = Reminder[];

/** POST /reminders */
export interface CreateReminderRequest {
  title: string;
  /** YYYY-MM-DD, через 3–30 дней от сегодня */
  remindOn: string;
}
export type CreateReminderResponse = Reminder;

/** DELETE /reminders/:id */
export interface DeleteReminderResponse {
  deleted: true;
}

export interface IReminderService {
  list(): Promise<ListRemindersResponse>;
  create(body: CreateReminderRequest): Promise<CreateReminderResponse>;
  remove(id: number): Promise<DeleteReminderResponse>;
}
