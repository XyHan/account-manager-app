import { SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'oauth_scopes';
export const Scopes = (...scopes: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(SCOPES_KEY, scopes);
