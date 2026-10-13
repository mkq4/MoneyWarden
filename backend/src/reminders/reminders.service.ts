import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PurchaseReminder } from '../generated/prisma/client.js';
import { addDays, formatDate, parseDate, today } from '../common/period.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateReminderDto } from './dto/reminder.dto.js';

export const MIN_DAYS = 3;
export const MAX_DAYS = 30;

/** remindOn отдаём строкой YYYY-MM-DD, а не ISO с полночью UTC. */
const toResponse = (r: PurchaseReminder) => ({
  id: r.id,
  title: r.title,
  remindOn: formatDate(r.remindOn),
  createdAt: r.createdAt,
});

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Все напоминания; какие уже наступили, решает клиент по своей дате. */
  async list(userId: number) {
    const reminders = await this.prisma.purchaseReminder.findMany({
      where: { userId },
      orderBy: [{ remindOn: 'asc' }, { id: 'asc' }],
    });
    return reminders.map(toResponse);
  }

  /**
   * Сервер считает «сегодня» в UTC, а клиент — в своём поясе,
   * поэтому границы диапазона расширены на день в обе стороны.
   */
  async create(userId: number, dto: CreateReminderDto) {
    const remindOn = parseDate(dto.remindOn);
    const now = today();
    if (
      remindOn < addDays(now, MIN_DAYS - 1) ||
      remindOn > addDays(now, MAX_DAYS + 1)
    ) {
      throw new BadRequestException(
        `Напомнить можно через ${MIN_DAYS}–${MAX_DAYS} дней`,
      );
    }
    const reminder = await this.prisma.purchaseReminder.create({
      data: { userId, title: dto.title, remindOn },
    });
    return toResponse(reminder);
  }

  async remove(userId: number, id: number) {
    const reminder = await this.prisma.purchaseReminder.findFirst({
      where: { id, userId },
    });
    if (!reminder) throw new NotFoundException('Напоминание не найдено');
    await this.prisma.purchaseReminder.delete({ where: { id } });
    return { deleted: true };
  }
}
