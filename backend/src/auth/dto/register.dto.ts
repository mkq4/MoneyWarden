import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CredentialsDto } from './credentials.js';

export class RegisterDto extends CredentialsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
