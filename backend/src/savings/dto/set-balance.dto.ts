import { IsInt, Max, Min } from 'class-validator';
import { MAX_AMOUNT } from '../../transactions/dto/transaction.dto.js';

export class SetBalanceDto {
  /** Сколько сейчас отложено, в копейках */
  @IsInt()
  @Min(0)
  @Max(MAX_AMOUNT)
  targetAmount: number;
}
