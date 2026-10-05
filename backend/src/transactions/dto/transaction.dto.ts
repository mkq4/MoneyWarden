import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { PeriodQueryDto } from '../../common/period-query.dto.js';
import { DATE_RE } from '../../common/period.js';
import { ToIntArray } from '../../common/transforms.js';
import { TransactionType } from '../../generated/prisma/client.js';

/** 10 млн ₽ в копейках — с запасом влезает в INT. */
export const MAX_AMOUNT = 1_000_000_000;

const trimToNull = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || null : value,
  );

/** SAVING_ADJUSTMENT создаётся только через PUT /savings/balance. */
export const CREATABLE_TYPES = ['INCOME', 'EXPENSE', 'SAVING'] as const;
export type CreatableType = (typeof CREATABLE_TYPES)[number];

/** У SAVING категории быть не должно, у INCOME/EXPENSE она обязательна. */
@ValidatorConstraint({ name: 'categoryMatchesType' })
class CategoryMatchesType implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const { type } = args.object as CreateTransactionDto;
    if (type === 'SAVING') return value === undefined || value === null;
    return Number.isInteger(value);
  }

  defaultMessage(args: ValidationArguments) {
    const { type } = args.object as CreateTransactionDto;
    return type === 'SAVING'
      ? 'У накоплений нет категории: categoryId передавать нельзя'
      : 'categoryId обязателен';
  }
}

export class CreateTransactionDto {
  /**
   * Необязателен для доходов и расходов: тип берётся из категории
   * (если передан — должен с ней совпадать).
   */
  @IsOptional()
  @IsIn(CREATABLE_TYPES, {
    message:
      'type должен быть INCOME, EXPENSE или SAVING; корректировки накоплений — через PUT /savings/balance',
  })
  type?: CreatableType;

  @Validate(CategoryMatchesType)
  categoryId?: number | null;

  /** Сумма в копейках */
  @IsInt()
  @Min(1)
  @Max(MAX_AMOUNT)
  amount: number;

  @Matches(DATE_RE, { message: 'date должен быть в формате YYYY-MM-DD' })
  date: string;

  @IsOptional()
  @trimToNull()
  @IsString()
  @MaxLength(500)
  comment?: string | null;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_AMOUNT)
  amount?: number;

  @IsOptional()
  @Matches(DATE_RE, { message: 'date должен быть в формате YYYY-MM-DD' })
  date?: string;

  /** null или пустая строка — удалить комментарий */
  @IsOptional()
  @trimToNull()
  @IsString()
  @MaxLength(500)
  comment?: string | null;
}

/** Период необязателен: без него — вся история. */
export class ListTransactionsQueryDto extends PeriodQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @ToIntArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAmount?: number;

  /** Поиск по комментарию */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
