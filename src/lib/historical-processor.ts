import { CalculationEngine } from './calculation-engine';
import {
  GoogleInsightsProvider,
  HistoricalDataProvider,
  PlacePulseSnapshotProvider,
  HistoricalSnapshotRecord,
} from './historical-data-provider';
import { ChartPointDTO, HistoryResponseDTO, PlaceDTO, TimeRange } from './types';

export class HistoricalProcessor {
  private googleProvider: HistoricalDataProvider;
  private pulseProvider: HistoricalDataProvider;
  private calculationEngine: CalculationEngine;

  constructor() {
    this.googleProvider = new GoogleInsightsProvider();
    this.pulseProvider = new PlacePulseSnapshotProvider();
    this.calculationEngine = new CalculationEngine();
  }

  /**
   * Processes historical data for a place under a given time range.
   */
  async getHistoricalData(place: PlaceDTO, range: TimeRange): Promise<HistoryResponseDTO> {
    // 1. Fetch from Google Insights provider if available
    const googleResult = await this.googleProvider.fetchHistoricalSnapshots(place.id, place.googlePlaceId);

    // 2. Fetch from Place Pulse snapshots
    const pulseResult = await this.pulseProvider.fetchHistoricalSnapshots(place.id, place.googlePlaceId);

    // Merge without duplication, prioritizing official Google Insights if both exist for same timestamp
    const allSnapshots: HistoricalSnapshotRecord[] = [...googleResult.snapshots, ...pulseResult.snapshots].sort(
      (a, b) => a.capturedAt.getTime() - b.capturedAt.getTime()
    );

    // 3. Filter by range
    const { filtered, availableStartDate, availableEndDate, isTruncatedByAvailability } =
      this.calculationEngine.filterByRange(allSnapshots, range);

    // 4. Format points for charts
    const points: ChartPointDTO[] = filtered.map((s) => {
      const d = s.capturedAt;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
      return {
        date: s.capturedAt.toISOString(),
        label: dateLabel,
        rating: s.rating,
        reviewCount: s.reviewCount,
        source: s.source,
      };
    });

    const googleCount = allSnapshots.filter((s) => s.source === 'GOOGLE_INSIGHTS').length;
    const pulseCount = allSnapshots.filter((s) => s.source === 'PLACE_PULSE').length;

    let displaySource = 'Source: Place Pulse';
    if (googleCount > 0 && pulseCount === 0) {
      displaySource = 'Source: Google Places Insights';
    } else if (googleCount > 0 && pulseCount > 0) {
      displaySource = 'Source: Google Places Insights & Place Pulse';
    }

    let notice: string | undefined;
    if (allSnapshots.length === 1) {
      notice = 'Tracking started recently. More data will appear as Place Pulse collects snapshots.';
    } else if (allSnapshots.length === 0) {
      notice = 'No historical snapshots collected yet.';
    } else if (isTruncatedByAvailability && availableStartDate) {
      const d = new Date(availableStartDate);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      notice = `Historical data available from ${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}.`;
    }

    return {
      place,
      range,
      availableStartDate,
      availableEndDate,
      points,
      hasData: points.length > 0,
      isSingleSnapshot: allSnapshots.length === 1,
      notice,
      sourceInfo: {
        googleInsightsCount: googleCount,
        placePulseCount: pulseCount,
        displaySource,
      },
    };
  }
}
