-- AIAquacultureFishFarm schema (part 2) — operations entities, users, attachments, webhooks

-- ─────────────────────────────────────────────
-- RBAC users (admin / manager / viewer)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password        VARCHAR(120) NOT NULL,
  name            VARCHAR(120),
  role            VARCHAR(20) DEFAULT 'viewer',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER,
  title           VARCHAR(200),
  body            TEXT,
  severity        VARCHAR(20) DEFAULT 'info',
  source          VARCHAR(80),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at);

CREATE TABLE IF NOT EXISTS attachments (
  id              SERIAL PRIMARY KEY,
  resource_type   VARCHAR(60),
  resource_id     INTEGER,
  filename        VARCHAR(255),
  original_name   VARCHAR(255),
  mimetype        VARCHAR(120),
  size_bytes      INTEGER,
  uploaded_by     VARCHAR(150),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attachments_resource
  ON attachments (resource_type, resource_id);

CREATE TABLE IF NOT EXISTS webhooks (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120),
  url             VARCHAR(500),
  secret          VARCHAR(120),
  events          TEXT,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              SERIAL PRIMARY KEY,
  webhook_id      INTEGER,
  event           VARCHAR(120),
  payload         JSONB,
  status_code     INTEGER,
  response_body   TEXT,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook
  ON webhook_deliveries (webhook_id, attempted_at DESC);

-- ─────────────────────────────────────────────
-- Operations entities (9 more)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vessels (
  id              SERIAL PRIMARY KEY,
  vessel_id       VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  type            VARCHAR(60),
  capacity        INTEGER DEFAULT 0,
  fuel_status     VARCHAR(30),
  status          VARCHAR(30) DEFAULT 'available',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS divers (
  id              SERIAL PRIMARY KEY,
  diver_id        VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  certifications  TEXT,
  hours_total     INTEGER DEFAULT 0,
  last_dive       DATE,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS harvests (
  id              SERIAL PRIMARY KEY,
  harvest_id      VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  tons            NUMERIC(8,2) DEFAULT 0,
  harvested_at    TIMESTAMPTZ,
  processor       VARCHAR(150),
  status          VARCHAR(30) DEFAULT 'scheduled',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id              SERIAL PRIMARY KEY,
  customer_id     VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  country         VARCHAR(80),
  contract_id     VARCHAR(80),
  type            VARCHAR(60),
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
  id              SERIAL PRIMARY KEY,
  cert_id         VARCHAR(50) UNIQUE,
  farm_id         VARCHAR(50),
  standard        VARCHAR(80),
  issued_at       DATE,
  expires_at      DATE,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predator_incidents (
  id              SERIAL PRIMARY KEY,
  incident_id     VARCHAR(50) UNIQUE,
  pen_id          VARCHAR(50),
  predator        VARCHAR(80),
  severity        VARCHAR(20) DEFAULT 'medium',
  opened_at       TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'open',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS environmental_impacts (
  id              SERIAL PRIMARY KEY,
  impact_id       VARCHAR(50) UNIQUE,
  farm_id         VARCHAR(50),
  type            VARCHAR(80),
  severity        VARCHAR(20) DEFAULT 'medium',
  opened_at       TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'open',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendors (
  id              SERIAL PRIMARY KEY,
  vendor_id       VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  service         VARCHAR(200),
  country         VARCHAR(80),
  rating          NUMERIC(3,1) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'approved',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id              SERIAL PRIMARY KEY,
  entry_id        VARCHAR(50) UNIQUE,
  actor           VARCHAR(150),
  target          VARCHAR(200),
  action          VARCHAR(120),
  result          VARCHAR(40),
  ts              TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
