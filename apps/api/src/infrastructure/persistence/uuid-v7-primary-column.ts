import { PrimaryColumn } from 'typeorm';

/** PostgreSQL 18+ — DB-generated UUID v7 (time-ordered, RFC 9562). */
export function UuidV7PrimaryColumn(): PropertyDecorator {
  return PrimaryColumn('uuid', { default: () => 'uuidv7()' });
}
