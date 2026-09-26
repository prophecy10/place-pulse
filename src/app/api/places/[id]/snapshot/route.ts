import { NextRequest, NextResponse } from 'next/server';
import { ChartDataApi } from '@/lib/chart-data-api';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const api = new ChartDataApi();
    const result = await api.triggerSnapshot(id);

    return NextResponse.json({
      success: true,
      message: 'Snapshot successfully captured.',
      snapshot: result.snapshot,
    });
  } catch (err: unknown) {
    console.error('Error creating snapshot:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to record snapshot.' },
      { status: 500 }
    );
  }
}
