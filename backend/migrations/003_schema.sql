-- AIAquacultureFishFarm schema (part 3) — Apply pass 7 backlog
-- New tables for feeding schedules (per-pen rations) and a sensor-ingest
-- audit log. All CREATE TABLE IF NOT EXISTS so this is rerunnable.

CREATE TABLE IF NOT EXISTS feeding_schedules (
  id              SERIAL PRIMARY KEY,
  schedule_id     VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  feed_type       VARCHAR(120),
  ration_kg_per_day  NUMERIC(10,3) DEFAULT 0,
  meals_per_day   INTEGER DEFAULT 1,
  feeding_window  VARCHAR(120),
  start_date      DATE,
  end_date        DATE,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feeding_schedules_pen
  ON feeding_schedules (pen_id, status);

-- Sensor ingest log — append-only record of every batch ingest call.
CREATE TABLE IF NOT EXISTS sensor_ingest_log (
  id              SERIAL PRIMARY KEY,
  source          VARCHAR(80),
  pen_id          VARCHAR(50),
  rows_received   INTEGER DEFAULT 0,
  rows_inserted   INTEGER DEFAULT 0,
  rows_failed     INTEGER DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sensor_ingest_log_created
  ON sensor_ingest_log (created_at DESC);
