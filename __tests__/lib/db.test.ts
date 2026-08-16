import { types } from 'pg';

// Importing the module registers its custom type parsers as a side effect.
import '../../lib/db';

const TIMESTAMPTZ_OID = 1184;

function parseTimestamptz(value: string): Date {
  const parser = types.getTypeParser(TIMESTAMPTZ_OID, 'text') as (
    raw: string
  ) => Date | string;

  return new Date(parser(value));
}

describe('timestamptz type parser', () => {
  it('honours the offset Postgres sends for a non-UTC session', () => {
    // What a server whose session time zone is Europe/Berlin returns.
    expect(parseTimestamptz('2026-08-16 22:43:52.465+02').toISOString()).toBe(
      '2026-08-16T20:43:52.465Z'
    );
  });

  it('handles a UTC session', () => {
    expect(parseTimestamptz('2026-08-16 20:43:52.465+00').toISOString()).toBe(
      '2026-08-16T20:43:52.465Z'
    );
  });
});
