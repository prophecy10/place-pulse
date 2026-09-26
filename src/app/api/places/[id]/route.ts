import { NextRequest, NextResponse } from 'next/server';
import { ChartDataApi } from '@/lib/chart-data-api';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const api = new ChartDataApi();
    const place = await api.getPlaceById(id);

    if (!place) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, place });
  } catch (err) {
    console.error('Error fetching place details:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve place information.' },
      { status: 500 }
    );
  }
}
