#!/usr/bin/env bash
set -euo pipefail

# Wrapper to safely pull backups and import into local DB.
# It sources .env.local if present to get LOCAL_DATABASE_URL.

REPO_DIR="/Users/niloy/programming/whattocook"
cd "$REPO_DIR"

# Load environment from .env.local if present (but do not fail if missing)
if [ -f "$REPO_DIR/.env.local" ]; then
  # shellcheck disable=SC1091
  set -a
  # shellcheck source=/dev/null
  . "$REPO_DIR/.env.local"
  set +a
fi

mkdir -p "$REPO_DIR/logs"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting local sync wrapper"

# Ensure we have latest backups in repo
git fetch origin || true
git checkout main || true
git pull origin main || true

if [ -z "${LOCAL_DATABASE_URL:-}" ]; then
  echo "LOCAL_DATABASE_URL not set. Please add it to .env.local or export it before running this script."
  exit 1
fi

export LOCAL_DATABASE_URL

# Run pull-and-import-backup.sh which uses LOCAL_DATABASE_URL
./scripts/pull-and-import-backup.sh

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Local sync wrapper finished"
