import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountTypeEnum } from '../../domain/value-objects/AccountType';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bank?: string;

  @IsOptional()
  @IsEnum(AccountTypeEnum)
  type?: AccountTypeEnum;
}
