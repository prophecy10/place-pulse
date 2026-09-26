import { DeltaMetric, PlaceMetricsDTO, SnapshotSource, TimeRange } from './types';
import { HistoricalSnapshotRecord } from './historical-data-provider';

export class CalculationEngine {
  /**
   * Filters snapshots according to the specified TimeRange without interpolating or smoothing.
   */
  filterByRange(
    snapshots: HistoricalSnapshotRecord[],
    range: TimeRange
  ): {
    filtered: HistoricalSnapshotRecord[];
    availableStartDate: string | null;
    availableEndDate: string | null;
    requestedStartDate: string;
    isTruncatedByAvailability: boolean;
  } {
    if (snapshots.length === 0) {
      return {
        filtered: [],
        availableStartDate: null,
        availableEndDate: null,
        requestedStartDate: new Date().toISOString(),
        isTruncatedByAvailability: false,
      };
    }

    const latest = snapshots[snapshots.length - 1];
    const earliest = snapshots[0];
    const latestTime = latest.capturedAt.getTime();

    let daysToSubtract = 0;
    switch (range) {
      case '1M':
        daysToSubtract = 30;
        break;
      case '3M':
        daysToSubtract = 90;
        break;
      case '6M':
        daysToSubtract = 180;
        break;
      case '1Y':
        daysToSubtract = 365;
        break;
      case '2Y':
        daysToSubtract = 730;
        break;
      case 'MAX':
        daysToSubtract = Infinity;
        break;
    }

    const cutoffTime = daysToSubtract === Infinity ? 0 : latestTime - daysToSubtract * 24 * 60 * 60 * 1000;
    const requestedStartDate = new Date(cutoffTime).toISOString();

    const filtered = snapshots.filter((s) => s.capturedAt.getTime() >= cutoffTime);
    const isTruncatedByAvailability =
      daysToSubtract !== Infinity && cutoffTime < earliest.capturedAt.getTime() && snapshots.length > 0;

    return {
      filtered,
      availableStartDate: earliest.capturedAt.toISOString(),
      availableEndDate: latest.capturedAt.toISOString(),
      requestedStartDate,
      isTruncatedByAvailability,
    };
  }

  /**
   * Calculates metrics for all ranges and overall review velocity.
   */
  calculateMetrics(snapshots: HistoricalSnapshotRecord[]): PlaceMetricsDTO {
    if (snapshots.length === 0) {
      return {
        currentRating: 0,
        currentReviewCount: 0,
        trackingSince: null,
        availablePeriod: null,
        dataPointsCount: 0,
        isNewTracking: true,
        frequency: 'none' as any,
        primarySource: 'PLACE_PULSE',
        sourceLabel: 'Source: Place Pulse',
        starDistributionNotice:
          'Google does not currently provide historical star-distribution data through the available API.',
        metricsByRange: {
          '1M': { startRating: null, endRating: null, deltaRating: null, startReviews: null, endReviews: null, deltaReviews: null, available: false, message: 'No data available' },
          '3M': { startRating: null, endRating: null, deltaRating: null, startReviews: null, endReviews: null, deltaReviews: null, available: false, message: 'No data available' },
          '6M': { startRating: null, endRating: null, deltaRating: null, startReviews: null, endReviews: null, deltaReviews: null, available: false, message: 'No data available' },
          '1Y': { startRating: null, endRating: null, deltaRating: null, startReviews: null, endReviews: null, deltaReviews: null, available: false, message: 'No data available' },
          '2Y': { startRating: null, endRating: null, deltaRating: null, startReviews: null, endReviews: null, deltaReviews: null, available: false, message: 'No data available' },
          'MAX': { startRating: null, endRating: null, deltaRating: null, startReviews: null, endReviews: null, deltaReviews: null, available: false, message: 'No data available' },
        },
        reviewVelocity: {
          averagePerMonth: null,
          growth1Y: null,
          growth6M: null,
        },
      };
    }

    const latest = snapshots[snapshots.length - 1];
    const earliest = snapshots[0];
    const isSingle = snapshots.length === 1;

    // Detect primary source
    const googleCount = snapshots.filter((s) => s.source === 'GOOGLE_INSIGHTS').length;
    const pulseCount = snapshots.filter((s) => s.source === 'PLACE_PULSE').length;
    let primarySource: SnapshotSource | 'MIXED' = 'PLACE_PULSE';
    let sourceLabel = 'Source: Place Pulse';

    if (googleCount > 0 && pulseCount === 0) {
      primarySource = 'GOOGLE_INSIGHTS';
      sourceLabel = 'Source: Google Places Insights';
    } else if (googleCount > 0 && pulseCount > 0) {
      primarySource = 'MIXED';
      sourceLabel = 'Source: Google Places Insights & Place Pulse';
    }

    // Determine frequency
    let frequency: 'weekly' | 'monthly' | 'irregular' | 'single' = 'single';
    if (snapshots.length > 1) {
      const avgIntervalDays =
        (latest.capturedAt.getTime() - earliest.capturedAt.getTime()) /
        (snapshots.length - 1) /
        (1000 * 60 * 60 * 24);
      if (avgIntervalDays <= 9) {
        frequency = 'weekly';
      } else if (avgIntervalDays >= 25 && avgIntervalDays <= 35) {
        frequency = 'monthly';
      } else {
        frequency = 'irregular';
      }
    }

    // Calculate deltas for each range
    const ranges: TimeRange[] = ['1M', '3M', '6M', '1Y', '2Y', 'MAX'];
    const metricsByRange: Record<TimeRange, DeltaMetric> = {} as any;

    for (const range of ranges) {
      metricsByRange[range] = this.calculateDeltaForRange(snapshots, range);
    }

    // Review velocity: Average reviews per month across the available tracking period
    let averagePerMonth: number | null = null;
    const totalDays = (latest.capturedAt.getTime() - earliest.capturedAt.getTime()) / (1000 * 60 * 60 * 24);
    const totalReviewsGrowth = latest.reviewCount - earliest.reviewCount;

    if (totalDays >= 14 && snapshots.length >= 2) {
      const months = Math.max(1, totalDays / 30.4375);
      averagePerMonth = Math.round(totalReviewsGrowth / months);
    }

    return {
      currentRating: latest.rating,
      currentReviewCount: latest.reviewCount,
      trackingSince: earliest.capturedAt.toISOString(),
      availablePeriod: {
        start: earliest.capturedAt.toISOString(),
        end: latest.capturedAt.toISOString(),
      },
      dataPointsCount: snapshots.length,
      isNewTracking: isSingle,
      frequency,
      primarySource,
      sourceLabel,
      starDistributionNotice:
        'Google does not currently provide historical star-distribution data through the available API.',
      metricsByRange,
      reviewVelocity: {
        averagePerMonth,
        growth1Y: metricsByRange['1Y'].available ? metricsByRange['1Y'].deltaReviews : null,
        growth6M: metricsByRange['6M'].available ? metricsByRange['6M'].deltaReviews : null,
      },
    };
  }

  private calculateDeltaForRange(snapshots: HistoricalSnapshotRecord[], range: TimeRange): DeltaMetric {
    if (snapshots.length < 2) {
      return {
        startRating: null,
        endRating: null,
        deltaRating: null,
        startReviews: null,
        endReviews: null,
        deltaReviews: null,
        available: false,
        message: 'Not enough historical data.',
      };
    }

    const latest = snapshots[snapshots.length - 1];
    const latestTime = latest.capturedAt.getTime();

    let days = 0;
    switch (range) {
      case '1M':
        days = 30;
        break;
      case '3M':
        days = 90;
        break;
      case '6M':
        days = 180;
        break;
      case '1Y':
        days = 365;
        break;
      case '2Y':
        days = 730;
        break;
      case 'MAX':
        days = Infinity;
        break;
    }

    if (days === Infinity) {
      const earliest = snapshots[0];
      const deltaRating = Number((latest.rating - earliest.rating).toFixed(1));
      const deltaReviews = latest.reviewCount - earliest.reviewCount;
      return {
        startRating: earliest.rating,
        endRating: latest.rating,
        deltaRating,
        startReviews: earliest.reviewCount,
        endReviews: latest.reviewCount,
        deltaReviews,
        available: true,
      };
    }

    const targetTime = latestTime - days * 24 * 60 * 60 * 1000;
    const earliestAvailableTime = snapshots[0].capturedAt.getTime();

    // If targetTime is older than our earliest data point by more than 15% tolerance,
    // we cannot claim a full range delta
    if (targetTime < earliestAvailableTime - 15 * 24 * 60 * 60 * 1000) {
      return {
        startRating: null,
        endRating: null,
        deltaRating: null,
        startReviews: null,
        endReviews: null,
        deltaReviews: null,
        available: false,
        message: 'Not enough historical data.',
      };
    }

    // Find the closest snapshot to targetTime
    let closest = snapshots[0];
    let minDiff = Math.abs(snapshots[0].capturedAt.getTime() - targetTime);

    for (const s of snapshots) {
      const diff = Math.abs(s.capturedAt.getTime() - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }

    if (closest.id === latest.id) {
      return {
        startRating: null,
        endRating: null,
        deltaRating: null,
        startReviews: null,
        endReviews: null,
        deltaReviews: null,
        available: false,
        message: 'Not enough historical data.',
      };
    }

    const deltaRating = Number((latest.rating - closest.rating).toFixed(1));
    const deltaReviews = latest.reviewCount - closest.reviewCount;

    return {
      startRating: closest.rating,
      endRating: latest.rating,
      deltaRating,
      startReviews: closest.reviewCount,
      endReviews: latest.reviewCount,
      deltaReviews,
      available: true,
    };
  }
}
