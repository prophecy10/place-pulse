import { prisma } from './prisma';
import { SnapshotSource } from './types';

export interface HistoricalSnapshotRecord {
  id: string;
  placeId: string;
  capturedAt: Date;
  rating: number;
  reviewCount: number;
  source: SnapshotSource;
}

export interface HistoricalDataResult {
  snapshots: HistoricalSnapshotRecord[];
  providerName: string;
  sourceType: SnapshotSource;
  isAvailable: boolean;
  frequency: 'weekly' | 'monthly' | 'irregular' | 'single' | 'none';
  notice?: string;
  starDistributionNotice: string;
}

export interface HistoricalDataProvider {
  getProviderName(): string;
  getSourceType(): SnapshotSource;
  isAvailable(): Promise<boolean>;
  fetchHistoricalSnapshots(placeId: string, googlePlaceId: string): Promise<HistoricalDataResult>;
}

/**
 * GoogleInsightsProvider
 * Inspects official Google Places Insights API capabilities.
 * As verified in Google's official developer documentation:
 * The public Google Places API (New) & Places Aggregate API do not provide
 * historical time-series logs of rating and review count over time for public businesses.
 */
export class GoogleInsightsProvider implements HistoricalDataProvider {
  getProviderName(): string {
    return 'Google Places Insights';
  }

  getSourceType(): SnapshotSource {
    return 'GOOGLE_INSIGHTS';
  }

  async isAvailable(): Promise<boolean> {
    // Official public Google Places API does not provide time-series rating logs.
    // If an enterprise Google Places Insights API endpoint becomes available with historical rating logs,
    // this can be activated via GOOGLE_PLACES_INSIGHTS_ENABLED.
    return process.env.GOOGLE_PLACES_INSIGHTS_ENABLED === 'true';
  }

  async fetchHistoricalSnapshots(placeId: string, _googlePlaceId: string): Promise<HistoricalDataResult> {
    const isEnabled = await this.isAvailable();

    if (!isEnabled) {
      return {
        snapshots: [],
        providerName: this.getProviderName(),
        sourceType: this.getSourceType(),
        isAvailable: false,
        frequency: 'none',
        notice:
          'Official Google Places API does not provide historical rating or review count logs for public places.',
        starDistributionNotice:
          'Google does not currently provide historical star-distribution data through the available API.',
      };
    }

    // If enterprise credentials exist, query Google Places Insights API
    return {
      snapshots: [],
      providerName: this.getProviderName(),
      sourceType: this.getSourceType(),
      isAvailable: false,
      frequency: 'none',
      starDistributionNotice:
        'Google does not currently provide historical star-distribution data through the available API.',
    };
  }
}

/**
 * PlacePulseSnapshotProvider
 * Fetches real snapshots stored by Place Pulse over time.
 * Adheres strictly to the requirement:
 * "Never invent historical ratings. Never interpolate missing ratings.
 * Show actual available observations."
 */
export class PlacePulseSnapshotProvider implements HistoricalDataProvider {
  getProviderName(): string {
    return 'Place Pulse';
  }

  getSourceType(): SnapshotSource {
    return 'PLACE_PULSE';
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async fetchHistoricalSnapshots(placeId: string, _googlePlaceId: string): Promise<HistoricalDataResult> {
    const snapshots = await prisma.placeSnapshot.findMany({
      where: { placeId },
      orderBy: { capturedAt: 'asc' },
    });

    const mapped: HistoricalSnapshotRecord[] = snapshots.map((s) => ({
      id: s.id,
      placeId: s.placeId,
      capturedAt: s.capturedAt,
      rating: s.rating,
      reviewCount: s.reviewCount,
      source: s.source as SnapshotSource,
    }));

    let frequency: 'weekly' | 'monthly' | 'irregular' | 'single' | 'none' = 'none';
    if (mapped.length === 1) {
      frequency = 'single';
    } else if (mapped.length > 1) {
      // Determine frequency based on interval
      const first = mapped[0].capturedAt.getTime();
      const second = mapped[1].capturedAt.getTime();
      const diffDays = Math.abs(second - first) / (1000 * 60 * 60 * 24);
      if (diffDays >= 6 && diffDays <= 8) {
        frequency = 'weekly';
      } else if (diffDays >= 25 && diffDays <= 35) {
        frequency = 'monthly';
      } else {
        frequency = 'irregular';
      }
    }

    return {
      snapshots: mapped,
      providerName: this.getProviderName(),
      sourceType: this.getSourceType(),
      isAvailable: true,
      frequency,
      starDistributionNotice:
        'Google does not currently provide historical star-distribution data through the available API.',
    };
  }
}
