import type { AuthMode } from "./types";

export const AUTH_MODES: AuthMode[] = ["login", "register"];

export const AUTH_MODE_LABELS: Record<AuthMode, string> = {
  login: "Вход",
  register: "Регистрация",
};
