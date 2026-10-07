"use client";

import { useMutation } from "@tanstack/react-query";
import { hardNavigate } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { authService } from "../api/auth.service";

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
    // Полная перезагрузка: proxy перечитает куку сессии, кэш запросов сбросится.
    onSettled: () => hardNavigate(ROUTES.login),
  });
}
