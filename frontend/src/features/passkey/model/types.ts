/** Ключ входа по Face ID / Touch ID (passkey) */
export interface Passkey {
  id: string;
  /** например, «iPhone» */
  name: string;
  /** ISO */
  createdAt: string;
  /** ISO; null — ещё ни разу не входили */
  lastUsedAt: string | null;
}
