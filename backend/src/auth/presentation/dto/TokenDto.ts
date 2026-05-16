import { IsString, IsUrl } from 'class-validator';

export class TokenDto {
  @IsString()
  grant_type: string;

  @IsString()
  code: string;

  @IsString()
  code_verifier: string;

  @IsString()
  client_id: string;

  @IsUrl({ require_tld: false })
  redirect_uri: string;
}
