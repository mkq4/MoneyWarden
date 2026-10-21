import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { arrayOf, isRecord, isString, nullable, shape, type Guard } from "@/shared/lib/guards";
import type { Passkey } from "./types";

export const isPasskey: Guard<Passkey> = shape<Passkey>({
  id: isString,
  name: isString,
  createdAt: isString,
  lastUsedAt: nullable(isString),
});

export const isPasskeyList = arrayOf(isPasskey);

/**
 * Опции WebAuthn: проверяем обязательные поля; остальное (десятки
 * необязательных) браузер провалидирует сам при вызове credentials.*.
 */
export function isCreationOptions(value: unknown): value is PublicKeyCredentialCreationOptionsJSON {
  return (
    isRecord(value) &&
    isString(value.challenge) &&
    isRecord(value.rp) &&
    isString(value.rp.name) &&
    isRecord(value.user) &&
    isString(value.user.id) &&
    isString(value.user.name) &&
    Array.isArray(value.pubKeyCredParams)
  );
}

export function isRequestOptions(value: unknown): value is PublicKeyCredentialRequestOptionsJSON {
  return isRecord(value) && isString(value.challenge);
}
