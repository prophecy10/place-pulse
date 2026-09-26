import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ChartDataApi } from '@/lib/chart-data-api';

export async function GET(req: NextRequest) {
  try {
    // Optional cron secret authorization
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const urlSecret = req.nextUrl.searchParams.get('secret');
      if (urlSecret !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Find up to 25 places that haven't been updated in at least 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const placesToUpdate = await prisma.place.findMany({
      where: {
        snapshots: {
          some: {
            capturedAt: { lt: sevenDaysAgo },
          },
        },
      },
      take: 25, // Hard budget limit per execution
      orderBy: { updatedAt: 'asc' },
    });

    const api = new ChartDataApi();
    const results: Array<{ id: string; name: string; status: string }> = [];

    for (const place of placesToUpdate) {
      try {
        await api.triggerSnapshot(place.id);
        results.push({ id: place.id, name: place.name, status: 'SNAPSHOT_RECORDED' });
      } catch (err: unknown) {
        results.push({
          id: place.id,
          name: place.name,
          status: `FAILED: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      refreshedCount: results.filter((r) => r.status === 'SNAPSHOT_RECORDED').length,
      details: results,
      notice: 'Throttled to maximum 25 places per run to guarantee $0 billing.',
    });
  } catch (err) {
    console.error('Error executing cron tracker:', err);
    return NextResponse.json(
      { error: 'Internal cron execution failure' },
      { status: 500 }
    );
  }
}
