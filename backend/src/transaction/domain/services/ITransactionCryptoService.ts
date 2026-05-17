export const TRANSACTION_CRYPTO_SERVICE = 'ITransactionCryptoService';

export interface ITransactionCryptoService {
  encrypt(plaintext: string): { encrypted: string; iv: string };
  decrypt(encryptedWithTag: string, ivBase64: string): string;
}
