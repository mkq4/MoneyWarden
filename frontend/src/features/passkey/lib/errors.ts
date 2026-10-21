import { WebAuthnError } from "@simplewebauthn/browser";

/** Пользователь закрыл окно Face ID или вышло время — это не ошибка, молчим. */
export function isCancelled(err: unknown): boolean {
  return err instanceof Error && (err.name === "NotAllowedError" || err.name === "AbortError");
}

export function passkeyErrorMessage(err: unknown): string {
  if (err instanceof WebAuthnError && err.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
    return "Это устройство уже добавлено";
  }
  return err instanceof Error ? err.message : "Не получилось, попробуйте ещё раз";
}
