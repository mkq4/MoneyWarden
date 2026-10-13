import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { DATE_RE } from '../../common/period.js';
import { Trim } from '../../common/transforms.js';

export class CreateReminderDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @Matches(DATE_RE, { message: 'remindOn должен быть в формате YYYY-MM-DD' })
  remindOn: string;
}
