import { IsOptional, IsString, IsUrl } from 'class-validator';

export class TokenDto {
  @IsString()
  grant_type: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  code_verifier?: string;

  @IsOptional()
  @IsString()
  client_id?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  redirect_uri?: string;
}
