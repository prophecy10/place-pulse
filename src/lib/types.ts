export type SnapshotSource = 'GOOGLE_INSIGHTS' | 'PLACE_PULSE';

export interface PlaceDTO {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string;
  currentRating: number;
  currentReviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceSnapshotDTO {
  id: string;
  placeId: string;
  capturedAt: string; // ISO date
  dateFormatted: string; // e.g. "Jan 2026" or "Sep 25, 2026"
  rating: number;
  reviewCount: number;
  source: SnapshotSource;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | 'MAX';

export interface DeltaMetric {
  startRating: number | null;
  endRating: number | null;
  deltaRating: number | null; // e.g. -0.2
  startReviews: number | null;
  endReviews: number | null;
  deltaReviews: number | null; // e.g. +521
  available: boolean;
  message?: string;
}

export interface PlaceMetricsDTO {
  currentRating: number;
  currentReviewCount: number;
  trackingSince: string | null;
  availablePeriod: {
    start: string;
    end: string;
  } | null;
  dataPointsCount: number;
  isNewTracking: boolean;
  frequency: 'weekly' | 'monthly' | 'irregular' | 'single';
  primarySource: SnapshotSource | 'MIXED';
  sourceLabel: string;
  starDistributionNotice: string;
  metricsByRange: {
    '1M': DeltaMetric;
    '3M': DeltaMetric;
    '6M': DeltaMetric;
    '1Y': DeltaMetric;
    '2Y': DeltaMetric;
    'MAX': DeltaMetric;
  };
  reviewVelocity: {
    averagePerMonth: number | null; // e.g. +175 reviews/month
    growth1Y: number | null;
    growth6M: number | null;
  };
}

export interface ChartPointDTO {
  date: string; // raw ISO date
  label: string; // formatted date (e.g. "Sep 25, 2026" or "Jan 2026")
  rating: number;
  reviewCount: number;
  source: SnapshotSource;
}

export interface HistoryResponseDTO {
  place: PlaceDTO;
  range: TimeRange;
  availableStartDate: string | null;
  availableEndDate: string | null;
  points: ChartPointDTO[];
  hasData: boolean;
  isSingleSnapshot: boolean;
  notice?: string;
  sourceInfo: {
    googleInsightsCount: number;
    placePulseCount: number;
    displaySource: string;
  };
}
