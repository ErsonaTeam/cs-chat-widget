import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';

/**
 * GET /api/healthz
 * Health check endpoint for Kubernetes probes
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: StatusCodes.OK }
  );
}

