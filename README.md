# Place Pulse

> **"Google shows you the current rating. Place Pulse shows you how that rating got there."**

Place Pulse is a production-quality analytics web application that enables users to paste a Google Maps URL (or search a place name + city) and observe factual, mathematical records of how its Google rating and review count have accumulated over time.

---

## 🛡️ Zero-Billing Guarantee & Cost Guardrails

We have implemented an **absolute $0 surprise-bill protection architecture**:

1. **Daily Safety Budget Cap (`GOOGLE_MAPS_MAX_DAILY_CALLS`)**:
   - The application has an automatic in-memory safety guard set to a maximum of 100 API calls per day (~3,000/month).
   - Because Google Cloud provides **$200 in free credits every month** (covering ~11,000 to 28,000 basic requests), this cap guarantees you **never pay a single dollar out of pocket**.
   - If traffic spikes, it blocks outgoing billed calls and serves cached/deterministic data instead of billing your credit card.
2. **Lazy 7-Day Stale Cache Policy**:
   - If a place was inspected within the last 7 days, Place Pulse serves the snapshot from the local database without making an external Google API call.
   - Repeated views and viral traffic cost **$0 in API calls**.
3. **Throttled Weekly Cron (`/api/cron/track`)**:
   - Background refreshes are capped to a maximum of 25 places per run.
   - Only refreshes places whose last snapshot is older than 7 days.
4. **100% User Privacy**:
   - Zero personal user data is ever stored on the server.
   - "Recently Viewed by You" is stored strictly in the user's browser `localStorage`.

---

## 🚫 Non-AI & Anti-Fabrication Philosophy

Place Pulse is strictly **NOT** an AI chatbot. It contains:
- ❌ No generative AI summaries (OpenAI / Claude / Gemini)
- ❌ No synthetic sentiment heuristics
- ❌ No YouTube / Instagram / TikTok scraping
- ❌ No arbitrary "Best place" or "Pulse" scores
- ❌ No spline / polynomial smoothing of missing dates
- ❌ No fabricated rating estimations

Instead, it delivers:
- ✅ Factual Google Maps Platform data (Places API New)
- ✅ Pure mathematical delta calculations (rating changes, review growth)
- ✅ Review velocity progression (+reviews/month)
- ✅ Distinct source attribution: `Google Places Insights` vs `Place Pulse`
- ✅ Audit log table with CSV export
- 🏅 **Pioneer Tracker Milestone**: Celebrates early discovery when a user is the first to track a new location.

---

## 🏗️ System Architecture

1. **Place Resolver (`src/lib/place-resolver.ts`)**:
   - Unshortens links (`maps.app.goo.gl`), extracts coordinates, names, or Google Place IDs; provides text-search fallback.
2. **Google API Client (`src/lib/google-api-client.ts`)**:
   - Official Google Places API (New) integration with cost guard budget throttling.
3. **Historical Data Providers (`src/lib/historical-data-provider.ts`)**:
   - `GoogleInsightsProvider`: Evaluates Google Places Insights capabilities and reports public API boundaries.
   - `PlacePulseSnapshotProvider`: Reads verified historical audit snapshots from the ledger.
4. **Snapshot Collector (`src/lib/snapshot-collector.ts`)**:
   - Stores chronological snapshots with 1-hour deduplication and benchmark seeds.
5. **Calculation Engine (`src/lib/calculation-engine.ts`)**:
   - Computes delta ratings, review count growth, and review velocity across 1M, 3M, 6M, 1Y, 2Y, MAX windows.
6. **Chart Data API (`src/lib/chart-data-api.ts`)**:
   - Coordinates lazy refresh policies, featured directories, and metrics.
7. **Frontend Application (`src/app/page.tsx`, `src/components/*`)**:
   - Financial dark-mode dashboard (Geist typography, slate-950 surfaces).
   - Recharts rating line chart & review accumulation area chart.
   - Combined hover tooltip (Rating + Review Count at that exact point in time).
   - Featured benchmark directory and private local search history.

---

## 🗄️ Database & PostgreSQL Configuration

The schema is managed with **Prisma ORM** (`prisma/schema.prisma`):

- **`places`**: `id`, `google_place_id`, `name`, `address`, `category`, `latitude`, `longitude`, `google_maps_url`, `created_at`, `updated_at`.
- **`place_snapshots`**: `id`, `place_id`, `captured_at`, `rating`, `review_count`, `source` (`GOOGLE_INSIGHTS` | `PLACE_PULSE`), `created_at`.

### Running Locally (Default: SQLite)
Zero-configuration local development works out-of-the-box:
```bash
# Push schema to local dev.db
npx prisma db push
```

### Production Deployment (Supabase / PostgreSQL)
Place Pulse is configured for PostgreSQL with transaction pooling:
1. In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
2. In your environment variables (Vercel / .env):
   - `DATABASE_URL`: Connection string on port 6543 with `?pgbouncer=true`.
   - `DIRECT_URL`: Direct session connection string on port 5432.


---

## 🚀 Getting Started

```bash
# Navigate to project directory
cd place-pulse

# Install dependencies
npm install

# Initialize Prisma Client and database
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
