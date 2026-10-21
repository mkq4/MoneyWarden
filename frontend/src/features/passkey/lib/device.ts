/** Как называется биометрия на этом устройстве — для подписи кнопок. */
export function biometryLabel(userAgent: string): string {
  if (/iPhone|iPad/.test(userAgent)) return "Face ID";
  if (/Macintosh/.test(userAgent)) return "Touch ID";
  return "отпечатку";
}

/** Название ключа для списка в настройках. */
export function deviceName(userAgent: string): string {
  if (/iPhone/.test(userAgent)) return "iPhone";
  if (/iPad/.test(userAgent)) return "iPad";
  if (/Macintosh/.test(userAgent)) return "Mac";
  if (/Android/.test(userAgent)) return "Android";
  if (/Windows/.test(userAgent)) return "Windows";
  return "Ключ доступа";
}
