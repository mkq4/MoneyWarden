import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { PeriodQueryDto } from '../../common/period-query.dto.js';
import { MONTH_RE } from '../../common/period.js';
import { TransactionType } from '../../generated/prisma/client.js';

export class CategoryStatsQueryDto extends PeriodQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type: TransactionType = 'EXPENSE';
}

export class MonthlyStatsQueryDto {
  /** Сколько месяцев показать, заканчивая until */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(36)
  months: number = 12;

  /** Последний месяц ряда (YYYY-MM), по умолчанию текущий */
  @IsOptional()
  @Matches(MONTH_RE, { message: 'until должен быть в формате YYYY-MM' })
  until?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}

export class DailyStatsQueryDto {
  @IsOptional()
  @Matches(MONTH_RE, { message: 'month должен быть в формате YYYY-MM' })
  month?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type: TransactionType = 'EXPENSE';
}
