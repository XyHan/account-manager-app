/**
 * UUID v7 (RFC 9562): time-ordered, millisecond precision.
 * Uses Web Crypto API (available in all modern browsers and Node.js 19+).
 */
export function uuidV7(): string {
  const ts = Date.now();
  const rand = new Uint8Array(10);
  crypto.getRandomValues(rand);

  const buf = new Uint8Array(16);

  buf[0] = (ts / 0x10000000000) & 0xff;
  buf[1] = (ts / 0x100000000) & 0xff;
  buf[2] = (ts / 0x1000000) & 0xff;
  buf[3] = (ts / 0x10000) & 0xff;
  buf[4] = (ts / 0x100) & 0xff;
  buf[5] = ts & 0xff;

  buf[6] = 0x70 | (rand[0] & 0x0f);
  buf[7] = rand[1];

  buf[8] = 0x80 | (rand[2] & 0x3f);
  buf[9] = rand[3];
  buf[10] = rand[4];
  buf[11] = rand[5];
  buf[12] = rand[6];
  buf[13] = rand[7];
  buf[14] = rand[8];
  buf[15] = rand[9];

  const h = Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
