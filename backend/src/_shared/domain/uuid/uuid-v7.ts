import { randomBytes } from 'crypto';

/**
 * Generates a UUID v7 (RFC 9562): time-ordered, millisecond precision.
 * Layout: 48-bit unix_ts_ms | 4-bit ver(7) | 12-bit rand_a | 2-bit var(10) | 62-bit rand_b
 */
export function uuidV7(): string {
  const ts = Date.now();
  const rand = randomBytes(10);

  const buf = Buffer.alloc(16);

  // 48-bit timestamp
  buf[0] = (ts / 0x10000000000) & 0xff;
  buf[1] = (ts / 0x100000000) & 0xff;
  buf[2] = (ts / 0x1000000) & 0xff;
  buf[3] = (ts / 0x10000) & 0xff;
  buf[4] = (ts / 0x100) & 0xff;
  buf[5] = ts & 0xff;

  // version 7 (upper nibble) + rand_a (lower nibble + next byte)
  buf[6] = 0x70 | (rand[0] & 0x0f);
  buf[7] = rand[1];

  // variant 10xxxxxx + rand_b
  buf[8] = 0x80 | (rand[2] & 0x3f);
  buf[9] = rand[3];
  buf[10] = rand[4];
  buf[11] = rand[5];
  buf[12] = rand[6];
  buf[13] = rand[7];
  buf[14] = rand[8];
  buf[15] = rand[9];

  const h = buf.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
