import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CommandDispatcher } from '../../../_shared/infrastructure/cqrs/middleware/CommandDispatcher';
import { QueryDispatcher } from '../../../_shared/infrastructure/cqrs/middleware/QueryDispatcher';
import { RegisterUserCommand } from '../../application/commands/register-user/RegisterUserCommand';
import { FindUserByEmailQuery } from '../../application/queries/find-user-by-email/FindUserByEmailQuery';
import type { UserReadModel } from '../../domain/models/UserReadModel';
import { UserView } from '../view/UserView';
import { RegisterDto } from '../dto/RegisterDto';
import { AuthorizeQueryDto } from '../dto/AuthorizeQueryDto';
import { SubmitAuthorizeDto } from '../dto/SubmitAuthorizeDto';
import { TokenDto } from '../dto/TokenDto';
import { OAuthService } from '../../infrastructure/oauth/OAuthService';
import { OAuthGuard } from '../guards/OAuthGuard';
import { ScopesGuard } from '../guards/ScopesGuard';
import { RolesGuard } from '../guards/RolesGuard';
import { Scopes } from '../decorators/Scopes.decorator';
import { Roles } from '../decorators/Roles.decorator';
import { RoleEnum } from '../../domain/value-objects/Role';
import type { AuthenticatedRequest } from '../guards/OAuthGuard';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandDispatcher: CommandDispatcher,
    private readonly queryDispatcher: QueryDispatcher,
    private readonly oauthService: OAuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<object> {
    await this.commandDispatcher.dispatch(
      new RegisterUserCommand(dto.id, dto.email, dto.password),
    );

    const readModel = await this.queryDispatcher.dispatch<UserReadModel>(
      new FindUserByEmailQuery(dto.email),
    );

    return UserView.fromReadModel(readModel).serialize();
  }

  @Get('authorize')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async authorize(@Query() query: AuthorizeQueryDto, @Res() res: Response): Promise<void> {
    const client = await this.oauthService.getClient(query.client_id);
    if (
      !client ||
      !client.redirectUris.includes(query.redirect_uri) ||
      !client.grants.includes('authorization_code')
    ) {
      throw new BadRequestException('Invalid client_id, redirect_uri or grant type');
    }

    res.status(200).send(this.renderLoginForm(query));
  }

  @Post('authorize')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async submitAuthorize(
    @Body() dto: SubmitAuthorizeDto,
    @Res() res: Response,
  ): Promise<void> {
    const client = await this.oauthService.getClient(dto.client_id);
    if (
      !client ||
      !client.redirectUris.includes(dto.redirect_uri) ||
      !client.grants.includes('authorization_code')
    ) {
      throw new BadRequestException('Invalid client_id, redirect_uri or grant type');
    }

    const user = await this.oauthService.validateCredentials(dto.email, dto.password);
    if (!user) {
      res.status(200).send(
        this.renderLoginForm(dto, 'Email ou mot de passe incorrect'),
      );
      return;
    }

    const code = await this.oauthService.generateAuthorizationCode(
      user.id,
      dto.client_id,
      dto.redirect_uri,
      'app',
      dto.code_challenge,
      dto.code_challenge_method,
    );

    const redirectUrl = new URL(dto.redirect_uri);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', dto.state);
    res.redirect(redirectUrl.toString());
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async token(
    @Body() dto: TokenDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<object> {
    const isProduction = process.env.NODE_ENV === 'production';

    if (dto.grant_type === 'authorization_code') {
      if (!dto.code || !dto.code_verifier || !dto.client_id || !dto.redirect_uri) {
        throw new BadRequestException('Missing required fields for authorization_code grant');
      }

      const tokenResult = await this.oauthService.exchangeCodeForToken(
        dto.code,
        dto.code_verifier,
        dto.client_id,
        dto.redirect_uri,
        ip,
      );

      this.setTokenCookies(res, tokenResult.accessToken, tokenResult.refreshToken, isProduction);
      return { ok: true };
    }

    if (dto.grant_type === 'refresh_token') {
      const refreshToken = (req as Request & { cookies: Record<string, string> }).cookies?.['X-Refresh-Token'];
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token cookie missing');
      }

      const tokenResult = await this.oauthService.refreshAccessToken(refreshToken, ip);
      this.setTokenCookies(res, tokenResult.accessToken, tokenResult.refreshToken, isProduction);
      return { ok: true };
    }

    throw new BadRequestException('Unsupported grant_type');
  }

  private clearTokenCookies(res: Response): void {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('X-Access-Token', '', { httpOnly: true, secure, sameSite: 'strict', maxAge: 0, path: '/' });
    res.cookie('X-Refresh-Token', '', { httpOnly: true, secure, sameSite: 'strict', maxAge: 0, path: '/auth/token' });
  }

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string, secure: boolean): void {
    res.cookie('X-Access-Token', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });
    res.cookie('X-Refresh-Token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/auth/token',
    });
  }

  @Post('logout')
  @UseGuards(OAuthGuard, ScopesGuard, RolesGuard)
  @Scopes('app')
  @Roles(RoleEnum.USER, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookies = (req as AuthenticatedRequest & { cookies: Record<string, string> }).cookies;
    await this.oauthService.revokeToken(cookies['X-Access-Token']);
    this.clearTokenCookies(res);
  }

  @Get('me')
  @UseGuards(OAuthGuard, ScopesGuard, RolesGuard)
  @Scopes('app')
  @Roles(RoleEnum.USER, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  me(@Req() req: AuthenticatedRequest): object {
    return { userId: req.user.userId, role: req.user.userRole, scope: req.user.scope };
  }

  private renderLoginForm(
    params: {
      response_type: string;
      client_id: string;
      code_challenge: string;
      code_challenge_method: string;
      redirect_uri: string;
      state: string;
      email?: string;
    },
    error?: string,
  ): string {
    const escape = (s: string): string =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connexion — Account Manager</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); width: 320px; }
    h1 { margin: 0 0 1.5rem; font-size: 1.25rem; }
    label { display: block; margin-bottom: .25rem; font-size: .875rem; font-weight: 500; }
    input[type="email"], input[type="password"] { width: 100%; padding: .5rem .75rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 1rem; box-sizing: border-box; margin-bottom: 1rem; }
    button { width: 100%; padding: .625rem; background: #6c63ff; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #5a52e0; }
    .error { color: #dc2626; font-size: .875rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <form method="POST" action="/auth/authorize">
    <h1>Se connecter</h1>
    ${error ? `<p class="error">${escape(error)}</p>` : ''}
    <input type="hidden" name="response_type" value="${escape(params.response_type)}" />
    <input type="hidden" name="client_id" value="${escape(params.client_id)}" />
    <input type="hidden" name="code_challenge" value="${escape(params.code_challenge)}" />
    <input type="hidden" name="code_challenge_method" value="${escape(params.code_challenge_method)}" />
    <input type="hidden" name="redirect_uri" value="${escape(params.redirect_uri)}" />
    <input type="hidden" name="state" value="${escape(params.state)}" />
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="${escape(params.email ?? '')}" required />
    <label for="password">Mot de passe</label>
    <input type="password" id="password" name="password" required />
    <button type="submit">Se connecter</button>
  </form>
</body>
</html>`;
  }
}
