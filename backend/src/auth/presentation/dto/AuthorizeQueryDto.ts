import { IsString, Equals, IsUrl } from 'class-validator';

export class AuthorizeQueryDto {
  @IsString()
  @Equals('code')
  response_type: string;

  @IsString()
  client_id: string;

  @IsString()
  code_challenge: string;

  @IsString()
  @Equals('S256')
  code_challenge_method: string;

  @IsUrl({ require_tld: false })
  redirect_uri: string;

  @IsString()
  state: string;
}
