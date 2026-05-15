import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
  @IsUUID('all')
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
