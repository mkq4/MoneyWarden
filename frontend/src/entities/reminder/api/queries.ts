"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { reminderService } from "./reminder.service";

export const useReminders = () => useQuery({ queryKey: QUERY_KEYS.reminders, queryFn: reminderService.list });

function useInvalidateReminders() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: QUERY_KEYS.reminders });
}

export function useCreateReminder() {
  const invalidate = useInvalidateReminders();
  return useMutation({ mutationFn: reminderService.create, onSuccess: invalidate });
}

export function useDeleteReminder() {
  const invalidate = useInvalidateReminders();
  return useMutation({ mutationFn: reminderService.remove, onSuccess: invalidate });
}
