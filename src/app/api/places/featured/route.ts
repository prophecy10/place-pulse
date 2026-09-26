import { NextResponse } from 'next/server';
import { ChartDataApi } from '@/lib/chart-data-api';

export async function GET() {
  try {
    const api = new ChartDataApi();
    const featured = await api.getFeaturedPlaces();

    return NextResponse.json({
      success: true,
      places: featured,
    });
  } catch (err) {
    console.error('Error fetching featured places:', err);
    return NextResponse.json(
      { error: 'Failed to fetch featured places.' },
      { status: 500 }
    );
  }
}
