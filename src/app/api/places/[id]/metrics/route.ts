import { NextRequest, NextResponse } from 'next/server';
import { ChartDataApi } from '@/lib/chart-data-api';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const api = new ChartDataApi();
    const metrics = await api.getPlaceMetrics(id);

    if (!metrics) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (err) {
    console.error('Error fetching place metrics:', err);
    return NextResponse.json(
      { error: 'Failed to compute place metrics.' },
      { status: 500 }
    );
  }
}
