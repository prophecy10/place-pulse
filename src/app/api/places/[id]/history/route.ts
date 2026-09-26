import { NextRequest, NextResponse } from 'next/server';
import { ChartDataApi } from '@/lib/chart-data-api';
import { TimeRange } from '@/lib/types';

const VALID_RANGES: TimeRange[] = ['1M', '3M', '6M', '1Y', '2Y', 'MAX'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const rangeParam = (searchParams.get('range') || 'MAX').toUpperCase() as TimeRange;
    const range: TimeRange = VALID_RANGES.includes(rangeParam) ? rangeParam : 'MAX';

    const api = new ChartDataApi();
    const history = await api.getPlaceHistory(id, range);

    if (!history) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (err) {
    console.error('Error fetching place history:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve historical rating data.' },
      { status: 500 }
    );
  }
}
