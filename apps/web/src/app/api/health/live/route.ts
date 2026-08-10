import { NextResponse } from 'next/server';

/** Liveness probe for Docker / Caddy — no upstream dependency checks. */
export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok' });
}
