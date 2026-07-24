#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test -f "$root/.env" || { echo 'Missing .env; copy .env.example.' >&2; exit 1; }
set -a
source "$root/.env"
set +a
test -n "${DATABASE_URL:-}" || { echo 'DATABASE_URL required' >&2; exit 1; }
for file in "$root"/backend/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done
