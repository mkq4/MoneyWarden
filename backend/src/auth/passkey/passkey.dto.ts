import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/transforms.js';

export class PasskeyLoginDto {
  /** Результат navigator.credentials.get() в JSON-виде (startAuthentication) */
  @IsObject()
  response: Record<string, unknown>;
}

export class PasskeyRegisterDto {
  /** Результат navigator.credentials.create() в JSON-виде (startRegistration) */
  @IsObject()
  response: Record<string, unknown>;

  /** Название для списка в настройках, например «iPhone» */
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name?: string;
}
