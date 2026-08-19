import { NextResponse } from 'next/server';

/** Liveness probe for the deployed Worker or local Next.js server. */
export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok' });
}
