import { IsOptional, Matches } from 'class-validator';
import { DATE_RE, MONTH_RE, type PeriodInput } from './period.js';

/** ?month=YYYY-MM или ?from=YYYY-MM-DD&to=YYYY-MM-DD */
export class PeriodQueryDto implements PeriodInput {
  @IsOptional()
  @Matches(MONTH_RE, { message: 'month должен быть в формате YYYY-MM' })
  month?: string;

  @IsOptional()
  @Matches(DATE_RE, { message: 'from должен быть в формате YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(DATE_RE, { message: 'to должен быть в формате YYYY-MM-DD' })
  to?: string;
}
