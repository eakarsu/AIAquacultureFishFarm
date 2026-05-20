-- AIAquacultureFishFarm schema (part 1) — core net-pen aquaculture entities

CREATE TABLE IF NOT EXISTS farms (
  id              SERIAL PRIMARY KEY,
  farm_id         VARCHAR(50) UNIQUE,
  name            VARCHAR(200) NOT NULL,
  location        VARCHAR(200),
  pen_count       INTEGER DEFAULT 0,
  species         VARCHAR(80),
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS net_pens (
  id              SERIAL PRIMARY KEY,
  pen_id          VARCHAR(50) UNIQUE,
  farm_id         VARCHAR(50),
  volume_m3       INTEGER DEFAULT 0,
  depth_m         INTEGER DEFAULT 0,
  fish_count      INTEGER DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'stocked',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fish_groups (
  id              SERIAL PRIMARY KEY,
  group_id        VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  species         VARCHAR(80),
  count           INTEGER DEFAULT 0,
  avg_weight_g    INTEGER DEFAULT 0,
  stocked_at      DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feed_inventory (
  id              SERIAL PRIMARY KEY,
  inv_id          VARCHAR(50) UNIQUE,
  type            VARCHAR(80),
  qty_kg          INTEGER DEFAULT 0,
  location        VARCHAR(120),
  batch           VARCHAR(80),
  expiry          DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatments (
  id              SERIAL PRIMARY KEY,
  treatment_id    VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  product         VARCHAR(150),
  dosage          VARCHAR(120),
  applied_at      TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'scheduled',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mortality_logs (
  id              SERIAL PRIMARY KEY,
  log_id          VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  count           INTEGER DEFAULT 0,
  cause           VARCHAR(120),
  ts              TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'open',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_quality (
  id              SERIAL PRIMARY KEY,
  reading_id      VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  parameter       VARCHAR(80),
  value           NUMERIC(12,3),
  units           VARCHAR(20),
  ts              TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS biomass_estimates (
  id              SERIAL PRIMARY KEY,
  estimate_id     VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  total_kg        INTEGER DEFAULT 0,
  avg_kg          NUMERIC(8,3) DEFAULT 0,
  estimated_at    TIMESTAMPTZ,
  method          VARCHAR(40),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sea_lice_counts (
  id              SERIAL PRIMARY KEY,
  count_id        VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  lice_per_fish   NUMERIC(6,3),
  sampled_at      TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'logged',
  action          VARCHAR(120),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80) NOT NULL,
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);
