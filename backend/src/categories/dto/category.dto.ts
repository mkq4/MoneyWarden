import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ToBoolean, Trim } from '../../common/transforms.js';
import {
  CATEGORY_TYPE_MESSAGE,
  CATEGORY_TYPES,
  type CategoryType,
} from '../../common/transaction-kinds.js';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export class CreateCategoryDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsIn(CATEGORY_TYPES, { message: CATEGORY_TYPE_MESSAGE })
  type: CategoryType;

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
  @Trim()
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
  @IsIn(CATEGORY_TYPES, { message: CATEGORY_TYPE_MESSAGE })
  type?: CategoryType;

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  includeArchived?: boolean;
}
