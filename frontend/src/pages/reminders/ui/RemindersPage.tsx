"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { isDue, useReminders } from "@/entities/reminder";
import { ReminderCreator } from "@/features/reminder-create";
import { PageHeader } from "@/widgets/header";
import { toISODate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ReminderList, RemindersEmpty } from "../components";

export function RemindersPage() {
  const { data } = useReminders();
  const [creating, setCreating] = useState(false);
  const today = toISODate(new Date());
  const due = data?.filter((r) => isDue(r, today)) ?? [];
  const waiting = data?.filter((r) => !isDue(r, today)) ?? [];

  return (
    <>
      <PageHeader
        title="Подумать"
        subtitle="Покупки, к которым стоит вернуться на холодную голову"
        action={
          data?.length ? (
            <Button onClick={() => setCreating(true)}>
              <Plus /> Добавить
            </Button>
          ) : null
        }
      />
      <div className="flex flex-col gap-4 md:gap-6">
        {!data ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : data.length === 0 ? (
          <RemindersEmpty onAdd={() => setCreating(true)} />
        ) : (
          <>
            <ReminderList title="Пора решить" reminders={due} due />
            <ReminderList title="Ждут" reminders={waiting} due={false} />
          </>
        )}
      </div>
      <ReminderCreator open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
