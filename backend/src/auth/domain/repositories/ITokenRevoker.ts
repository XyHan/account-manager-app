export const TOKEN_REVOKER = 'ITokenRevoker';

export interface ITokenRevoker {
  revokeAllUserTokens(userId: string): Promise<void>;
}
