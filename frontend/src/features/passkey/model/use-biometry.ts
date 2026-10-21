"use client";

import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useSyncExternalStore } from "react";
import { biometryLabel } from "../lib/device";

const subscribe = () => () => {};

/**
 * «Face ID» / «Touch ID» / «отпечатку», или null — браузер не умеет passkeys
 * (и на сервере, где браузера нет: кнопки появятся после гидрации).
 */
export function useBiometry(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => (browserSupportsWebAuthn() ? biometryLabel(navigator.userAgent) : null),
    () => null,
  );
}
