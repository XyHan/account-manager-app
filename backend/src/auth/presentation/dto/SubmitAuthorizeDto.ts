import { IsEmail, IsString, Equals, IsUrl } from 'class-validator';

export class SubmitAuthorizeDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

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
