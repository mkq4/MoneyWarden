import type { User } from "./types";

/** Как обращаться к пользователю: имя, иначе логин. */
export const getDisplayName = (user: User | undefined): string | null =>
  user?.name || user?.username || null;
