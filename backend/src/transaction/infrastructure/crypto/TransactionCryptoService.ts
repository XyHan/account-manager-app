import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { ITransactionCryptoService } from '../../domain/services/ITransactionCryptoService';

@Injectable()
export class TransactionCryptoService implements ITransactionCryptoService {
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('ENCRYPTION_KEY', '');
    this.key = Buffer.from(raw, 'base64');
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be a 32-byte base64-encoded string');
    }
  }

  encrypt(plaintext: string): { encrypted: string; iv: string } {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      encrypted: Buffer.concat([encrypted, tag]).toString('base64'),
      iv: iv.toString('base64'),
    };
  }

  decrypt(encryptedWithTag: string, ivBase64: string): string {
    const iv = Buffer.from(ivBase64, 'base64');
    const data = Buffer.from(encryptedWithTag, 'base64');
    const tag = data.subarray(data.length - 16);
    const encrypted = data.subarray(0, data.length - 16);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
