# Audit Note — AIAquacultureFishFarm

Source: domain audit pass (aquaculture / fish farm management). Stack: Node + Express + React + Postgres + OpenRouter.

## Original Recommendations

### Missing AI Counterparts
- Fish health diagnostic from image + symptom input (current `treatment-recommend` is text-only)
- Biomass forecaster (time-series projection — current `biomass-vision-estimate` is point-in-time)
- Per-pen harvest timing recommender (current `harvest-schedule` is fleet/window-level, not pen-by-pen)
- Mortality predictor (current `mortality-anomaly-detect` is retrospective anomaly framing, not forward forecast)

### Missing Non-AI Features
- Sensor ingest endpoint for DO / temperature / pH telemetry (water_quality has CRUD but no streaming/batch ingest path)
- Feeding schedule CRUD (only `feed_inventory` exists; no per-pen ration/schedule resource)
- Regulatory reporting exports (sea lice thresholds, mortality, antibiotic use — SEPA / Mattilsynet / SERNAPESCA formats)
- Harvest tracking — EXISTS (`/api/harvests`)
- Water quality CRUD — EXISTS (`/api/water-quality`)

### Custom Feature Suggestions
- Pen-camera CV pipeline (image upload → frame extraction → analysis; uploads dir exists but no per-camera route)
- Sea-lice detection from pen-camera image (current `sea-lice-counts-classify` consumes manual count records only)
- Escape detection (net breach / count delta vs sonar) — not present
- Sustainability composite score (carbon / feed / waste / welfare) — `environmental-risk-brief` is narrative, not scored
- Net integrity / fouling CV scoring
- Cleaner-fish welfare scoring (lumpfish / wrasse cohorts)

## Implemented (this round)

NONE — audit-only pass per constraints. No code edits.

## Backlog (prioritized)

1. **MECHANICAL** `POST /api/ai/fish-health-diagnostic` — accept symptoms + image refs, return likely pathogens + differential. Reuse `callOpenRouter` + `record(...)` pattern in `backend/routes/ai.js`.
2. **MECHANICAL** `POST /api/ai/biomass-forecast` — N-week biomass projection per pen from historical `biomass_estimates` + `fish_groups` + `water_quality`.
3. **MECHANICAL** `POST /api/ai/harvest-timing` — per-pen optimal harvest date given growth curve, market forecast, regulatory window.
4. **MECHANICAL** `POST /api/ai/mortality-predict` — forward mortality risk over next 7/14/30 days.
5. **MECHANICAL** `POST /api/ai/sustainability-score` — composite ASC/BAP-aligned score across farms.
6. **MECHANICAL** `POST /api/water-quality/ingest` — batch sensor telemetry endpoint (DO, temp, pH, salinity).
7. **MECHANICAL** Feeding-schedule CRUD route + table migration.
8. **MECHANICAL** Regulatory-report export endpoints (sea lice / mortality / antibiotic usage CSV/PDF).
9. **NEEDS-PRODUCT-DECISION** Pen-camera CV pipeline (storage strategy, model choice, batch vs realtime). Uploads dir already present.
10. **NEEDS-PRODUCT-DECISION** Escape-detection signal sources (acoustic tag delta, sonar count delta, net-tension sensor).
11. **NEEDS-CREDS** Live regulator feeds (SEPA, Mattilsynet, SERNAPESCA, EPA Tasmania).

## Apply pass 3 (frontend)

NOT STARTED. Existing AI endpoints all have dedicated pages under `frontend/src/pages/AI*.js` (16 pages aligned with 16 AI routes). New backlog endpoints will need matching pages and `services/` API helpers when implemented.

## Apply pass 6 (close-out)

NOT STARTED — no code changes this pass.

## Apply pass 7 (full backlog implementation)

Implemented the entire prioritized backlog (items 1–10) and stubbed item 11 (NEEDS-CREDS).

### Backend — new AI endpoints (`POST /api/ai/...`)
Appended to `backend/routes/ai.js` (mounted on existing `/api/ai` router, before any 404). Each follows the `callOpenRouter` + `record(...)` pattern and persists to `ai_results`.

1. `POST /api/ai/fish-health-diagnostic` — symptoms + image refs + auto-pulled pen / water / mortality / lice / treatment context → differential diagnosis.
2. `POST /api/ai/biomass-forecast` — N-week per-pen biomass projection from historical `biomass_estimates`, `fish_groups`, `water_quality`.
3. `POST /api/ai/harvest-timing` — per-pen optimal harvest date with target weight + market notes.
4. `POST /api/ai/mortality-predict` — forward 7 / 14 / 30-day mortality risk forecast (fleet-wide if no `pen_id`).
5. `POST /api/ai/sustainability-score` — ASC/BAP composite across farms (carbon / feed / waste / welfare / escapes / chemicals).
6. `POST /api/ai/pen-camera-analyze` — text-proxy CV pipeline: net integrity, fouling, fish behavior, sea-lice visibility, escape risk (PRODUCT-DECISION default: synchronous, text-frame analysis with image refs as inputs; no new image-upload pipeline needed — existing `uploads/` already accepts files via attachments).
7. `POST /api/ai/escape-detect` — fuse acoustic-tag / sonar / net-tension / camera signals (PRODUCT-DECISION default: client supplies signal deltas as JSON; no hardware ingest stream added).

All seven also have sample-fill entries in `SAMPLES` and surface through `GET /api/ai/samples?feature=<slug>` / `GET /api/ai/history?feature=<slug>`.

### Backend — new non-AI endpoints
- `POST /api/water-quality/ingest` — batch sensor telemetry endpoint. Accepts `{ source, readings: [...], notes }`. Each reading may be single-parameter (`{parameter, value, units, ts}`) or wide-shape (`dissolved_oxygen_mg_l`, `temp_c`, `ph`, `salinity_ppt`, `turbidity_ntu`, `chlorophyll_a_ug_l`) — wide-shape readings are expanded into multiple `water_quality` rows. `GET /api/water-quality/ingest/log` returns batch history. Mounted **before** `/api/water-quality` so the CRUD `/:id` does not shadow `/ingest`.
- `/api/feeding-schedules` — full CRUD (`_crudFactory`) on the new `feeding_schedules` table.
- `/api/regulatory-reports` — CSV / JSON exports. Sub-routes: `GET /sea-lice?regulator=<sepa|mattilsynet|sernapesca|epa-tasmania>&from=&to=&format=csv|json`, `GET /mortality`, `GET /antibiotic-use`, plus `GET /` index.
- `GET /api/ai/regulator-feed/{sepa,mattilsynet,sernapesca,epa-tasmania}` — **NEEDS-CREDS** 503 stubs (item 11).

### Backend — schema
New migration `backend/migrations/003_schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS`):
- `feeding_schedules(id, schedule_id, pen_id, feed_type, ration_kg_per_day, meals_per_day, feeding_window, start_date, end_date, status, notes, created_at, updated_at)` + index on (pen_id, status).
- `sensor_ingest_log(id, source, pen_id, rows_received, rows_inserted, rows_failed, notes, created_at)` + index on created_at DESC.

### Backend — files modified / added
- Modified: `backend/server.js` (4 new mounts), `backend/routes/ai.js` (+7 routes, +regulator stubs, +samples), `backend/services/ai.js` (+7 helpers, updated exports).
- Added: `backend/routes/feedingSchedules.js`, `backend/routes/waterQualityIngest.js`, `backend/routes/regulatoryReports.js`, `backend/migrations/003_schema.sql`.

### Frontend
- 10 new pages under `frontend/src/pages/`:
  - 7 AI pages: `AIFishHealthDiagnosticPage.js`, `AIBiomassForecastPage.js`, `AIHarvestTimingPage.js`, `AIMortalityPredictPage.js`, `AISustainabilityScorePage.js`, `AIPenCameraAnalyzePage.js`, `AIEscapeDetectPage.js` (escape-detect uses a custom shell with a JSON `signals` editor; others use the generic `AIPage` component).
  - 1 CRUD page: `FeedingSchedulesPage.js`.
  - 2 utility pages: `WaterQualityIngestPage.js` (batch JSON payload submit + ingest log table), `RegulatoryReportsPage.js` (date range + regulator profile picker + CSV download buttons).
- `frontend/src/services/api.js`: added 7 AI helpers, `feedingSchedulesApi`, `ingestWaterQuality`, `getWaterQualityIngestLog`, `listRegulatoryReports`, `downloadRegulatoryReport`.
- `frontend/src/App.js`: 10 new routes wired into existing shell.
- `frontend/src/components/Sidebar.js`: feed group adds Feeding Schedules + Sensor Ingest; governance group adds Regulatory Reports; AI Monitoring + Planning groups extended with the 7 new AI pages.

### Verification
- `node --check` passes on all modified/added .js backend files: `server.js`, `services/ai.js`, `routes/ai.js`, `routes/feedingSchedules.js`, `routes/waterQualityIngest.js`, `routes/regulatoryReports.js`.
- ESLint (parser-only sanity sweep) on the 10 new frontend pages + modified `App.js`, `Sidebar.js`, `services/api.js`: no syntax errors.
- No new npm dependencies; no edits to existing CRUD route files or existing AI service signatures; mount order keeps `/ingest` ahead of CRUD `:id`.

### Skipped
- Item 11 NEEDS-CREDS (live SEPA / Mattilsynet / SERNAPESCA / EPA Tasmania feeds) — exposed as documented 503 stubs at `/api/ai/regulator-feed/<slug>` only.

## Inventory snapshot

- Backend CRUD routes: 25 under `backend/routes/` (farms, net-pens, fish-groups, feed-inventory, treatments, mortality-logs, water-quality, biomass-estimates, sea-lice-counts, vessels, divers, harvests, customers, certifications, predator-incidents, environmental-impacts, vendors, audit-log, notifications, attachments, webhooks, dashboard, custom-views, plus `_crudFactory` / `_extendCrud` / `auth`).
- AI endpoints: 16 under `POST /api/ai/*` (biomass-vision-estimate, sea-lice-counts-classify, feed-conversion-optimize, mortality-anomaly-detect, treatment-recommend, executive-brief, harvest-schedule, water-quality-anomaly, predator-deterrent-plan, environmental-risk-brief, vessel-shift-schedule, diver-safety-brief, customer-quality-report, certification-readiness, vendor-quality-score, market-price-forecast) plus `GET /samples` and `GET /history`.
- Frontend pages: 38 under `frontend/src/pages/` (16 AI + 19 CRUD + Dashboard + Login + 2 Codex feature pages).
- AI persistence: `ai_results(feature, input, output, created_at)` via `record()` helper in `routes/ai.js`.
- Status: AUDIT-ONLY, no edits.
