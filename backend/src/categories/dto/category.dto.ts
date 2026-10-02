import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ToBoolean } from '../../common/transforms.js';
import { TransactionType } from '../../generated/prisma/client.js';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export class CreateCategoryDto {
  @trim()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @Matches(HEX_COLOR, { message: 'color должен быть в формате #RRGGBB' })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}

/** Тип менять нельзя: у категории уже могут быть операции этого типа. */
export class UpdateCategoryDto {
  @IsOptional()
  @trim()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @Matches(HEX_COLOR, { message: 'color должен быть в формате #RRGGBB' })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  /** false — восстановить из архива */
  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}

export class ListCategoriesQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  includeArchived?: boolean;
}
