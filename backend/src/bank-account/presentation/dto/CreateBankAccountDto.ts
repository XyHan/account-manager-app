import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AccountTypeEnum } from '../../domain/value-objects/AccountType';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  bank: string;

  @IsEnum(AccountTypeEnum)
  type: AccountTypeEnum;
}
