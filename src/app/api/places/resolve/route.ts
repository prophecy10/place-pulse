import { NextRequest, NextResponse } from 'next/server';
import { ChartDataApi } from '@/lib/chart-data-api';
import { PlaceResolverError } from '@/lib/place-resolver';
import { GoogleApiClientError } from '@/lib/google-api-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = body.url || body.input || body.query;

    if (!input || typeof input !== 'string' || !input.trim()) {
      return NextResponse.json(
        { error: 'Please enter a valid Google Maps URL or place search term.' },
        { status: 400 }
      );
    }

    const api = new ChartDataApi();
    const place = await api.resolveAndStorePlace(input);

    return NextResponse.json({
      success: true,
      place,
    });
  } catch (err: unknown) {
    console.error('Error resolving place:', err);

    if (err instanceof PlaceResolverError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 400 }
      );
    }

    if (err instanceof GoogleApiClientError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 502 }
      );
    }

    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('relation "places" does not exist') || errMsg.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database tables not found in Supabase. Please paste the SQL script into your Supabase SQL Editor and click Run.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while resolving the place. Please try again.' },
      { status: 500 }
    );
  }
}
