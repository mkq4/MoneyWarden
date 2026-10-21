"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { deviceName } from "../lib/device";
import { passkeyService } from "./passkey.service";

export const usePasskeys = () => useQuery({ queryKey: QUERY_KEYS.passkeys, queryFn: passkeyService.list });

/** Челлендж с сервера → Face ID на устройстве → публичный ключ на сервер. */
export function useAddPasskey() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const optionsJSON = await passkeyService.getRegistrationOptions();
      const response = await startRegistration({ optionsJSON });
      return passkeyService.register({ response, name: deviceName(navigator.userAgent) });
    },
    onSuccess: () => client.invalidateQueries({ queryKey: QUERY_KEYS.passkeys }),
  });
}

export function useRemovePasskey() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: passkeyService.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: QUERY_KEYS.passkeys }),
  });
}

/** Вход: челлендж → устройство само предлагает ключ и спрашивает Face ID → куки сессии. */
export function useLoginWithPasskey() {
  return useMutation({
    mutationFn: async () => {
      const optionsJSON = await passkeyService.getLoginOptions();
      const response = await startAuthentication({ optionsJSON });
      return passkeyService.login({ response });
    },
  });
}
