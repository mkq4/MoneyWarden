import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { PeriodQueryDto } from '../../common/period-query.dto.js';
import { MONTH_RE } from '../../common/period.js';
import {
  CATEGORY_TYPE_MESSAGE,
  CATEGORY_TYPES,
  type CategoryType,
} from '../../common/transaction-kinds.js';

export class CategoryStatsQueryDto extends PeriodQueryDto {
  @IsOptional()
  @IsIn(CATEGORY_TYPES, { message: CATEGORY_TYPE_MESSAGE })
  type: CategoryType = 'EXPENSE';
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
  @IsIn(CATEGORY_TYPES, { message: CATEGORY_TYPE_MESSAGE })
  type: CategoryType = 'EXPENSE';
}
