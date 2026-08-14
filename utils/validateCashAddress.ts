/**
 * CashAddr validation for Bitcoin Cash addresses.
 *
 * Upstream validates addresses with bitcoinjs-lib, which only knows Bitcoin
 * formats and therefore rejects CashAddr (bitcoincash:q...).
 *
 * Spec:
 * https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
 *
 * Implementation note: the checksum is a 40 bit value. JavaScript bitwise
 * operators truncate to 32 bits, so BigInt is required here.
 */

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

const GENERATOR: bigint[] = [
  0x98f2bc8e61n,
  0x79b76d99e2n,
  0xf33e5fb3c4n,
  0xae2eabe2a8n,
  0x1e4f43e470n,
];

const VALID_PREFIXES = ['bitcoincash', 'bchtest', 'bchreg'];

function polymod(values: number[]): bigint {
  let c = 1n;
  for (const d of values) {
    const c0 = c >> 35n;
    c = ((c & 0x07ffffffffn) << 5n) ^ BigInt(d);
    for (let i = 0; i < 5; i++) {
      if ((c0 >> BigInt(i)) & 1n) {
        c ^= GENERATOR[i];
      }
    }
  }
  return c ^ 1n;
}

function expandPrefix(prefix: string): number[] {
  const out = prefix.split('').map((ch) => ch.charCodeAt(0) & 0x1f);
  out.push(0);
  return out;
}

/**
 * Tests if the address is a valid CashAddr.
 * Accepts the address with or without prefix; without one, "bitcoincash"
 * is assumed.
 *
 * @param {string} address - The address to validate.
 * @returns {boolean} True if a valid CashAddr.
 */
export function validateCashAddress(address: string): boolean {
  if (typeof address !== 'string' || address.length === 0) return false;

  // Mixed case is invalid per the spec.
  const hasLower = /[a-z]/.test(address);
  const hasUpper = /[A-Z]/.test(address);
  if (hasLower && hasUpper) return false;

  const lower = address.toLowerCase();

  let prefix: string;
  let payload: string;
  const idx = lower.indexOf(':');
  if (idx >= 0) {
    prefix = lower.slice(0, idx);
    payload = lower.slice(idx + 1);
  } else {
    prefix = 'bitcoincash';
    payload = lower;
  }

  if (!VALID_PREFIXES.includes(prefix)) return false;
  // 8 checksum characters plus at least one payload character.
  if (payload.length < 9) return false;

  const values: number[] = [];
  for (const ch of payload) {
    const v = CHARSET.indexOf(ch);
    if (v === -1) return false;
    values.push(v);
  }

  return polymod(expandPrefix(prefix).concat(values)) === 0n;
}
