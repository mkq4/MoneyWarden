"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { userService } from "./user.service";

export const useMe = () =>
  useQuery({ queryKey: QUERY_KEYS.me, queryFn: userService.getMe, staleTime: Infinity });
