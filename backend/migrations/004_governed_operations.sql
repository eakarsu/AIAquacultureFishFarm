BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
UPDATE users SET tenant_id='default' WHERE tenant_id IS NULL;
ALTER TABLE users ALTER COLUMN tenant_id SET DEFAULT 'default';
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS farm_users_id_tenant_uidx ON users(id,tenant_id);
CREATE TABLE IF NOT EXISTS governed_observations(
 id BIGSERIAL PRIMARY KEY,tenant_id TEXT NOT NULL,source_event_id TEXT NOT NULL,pen_id TEXT NOT NULL,metric TEXT NOT NULL,value NUMERIC NOT NULL,unit TEXT,observed_at TIMESTAMPTZ NOT NULL,provenance JSONB NOT NULL,state TEXT NOT NULL DEFAULT 'observed' CHECK(state IN('observed','triaged','approved','rejected','scheduled','completed')),severity TEXT NOT NULL,reasons JSONB NOT NULL,rule_version TEXT NOT NULL,created_by INTEGER NOT NULL,version INTEGER NOT NULL DEFAULT 1,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(tenant_id,source_event_id),UNIQUE(id,tenant_id),FOREIGN KEY(created_by,tenant_id) REFERENCES users(id,tenant_id) ON DELETE RESTRICT);
CREATE INDEX IF NOT EXISTS governed_observation_queue_idx ON governed_observations(tenant_id,state,severity,observed_at);
CREATE TABLE IF NOT EXISTS farm_work_orders(id BIGSERIAL PRIMARY KEY,tenant_id TEXT NOT NULL,observation_id BIGINT NOT NULL,title TEXT NOT NULL,safety_constraints JSONB NOT NULL DEFAULT '[]',assigned_to INTEGER,status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('open','in_progress','blocked','completed')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),FOREIGN KEY(observation_id,tenant_id) REFERENCES governed_observations(id,tenant_id) ON DELETE RESTRICT,FOREIGN KEY(assigned_to,tenant_id) REFERENCES users(id,tenant_id) ON DELETE RESTRICT);
CREATE TABLE IF NOT EXISTS farm_operation_events(id BIGSERIAL PRIMARY KEY,tenant_id TEXT NOT NULL,observation_id BIGINT NOT NULL,actor_id INTEGER NOT NULL,action TEXT NOT NULL,from_state TEXT,to_state TEXT,rationale TEXT,evidence JSONB NOT NULL DEFAULT '{}',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),FOREIGN KEY(observation_id,tenant_id) REFERENCES governed_observations(id,tenant_id) ON DELETE RESTRICT,FOREIGN KEY(actor_id,tenant_id) REFERENCES users(id,tenant_id) ON DELETE RESTRICT);
CREATE TABLE IF NOT EXISTS farm_provider_outbox(id BIGSERIAL PRIMARY KEY,tenant_id TEXT NOT NULL,provider TEXT NOT NULL CHECK(provider IN('weather','gis','sensor','equipment','laboratory','farm_management')),operation TEXT NOT NULL,payload_reference TEXT NOT NULL,idempotency_key TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','delivering','delivered','failed','dead_letter')),attempts INTEGER NOT NULL DEFAULT 0,last_error TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(tenant_id,provider,idempotency_key));
CREATE OR REPLACE FUNCTION reject_farm_event_mutation()RETURNS trigger AS $$BEGIN RAISE EXCEPTION 'farm_operation_events is append-only';END;$$LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS farm_events_append_only ON farm_operation_events;CREATE TRIGGER farm_events_append_only BEFORE UPDATE OR DELETE ON farm_operation_events FOR EACH ROW EXECUTE FUNCTION reject_farm_event_mutation();
COMMIT;
