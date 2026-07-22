import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;

/**
 * Password hashing via Node `scrypt` — framework-agnostic, no native addons.
 * Stored format: `<saltHex>:<derivedHex>`.
 */
export class PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    return `${salt.toString('hex')}:${derived.toString('hex')}`;
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    const [saltHex, hashHex] = passwordHash.split(':');
    if (!saltHex || !hashHex) {
      return false;
    }

    try {
      const salt = Buffer.from(saltHex, 'hex');
      const expected = Buffer.from(hashHex, 'hex');
      const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

      if (expected.length !== derived.length) {
        return false;
      }

      return timingSafeEqual(expected, derived);
    } catch {
      return false;
    }
  }
}
