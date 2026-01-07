#!/usr/bin/env bash
set -euo pipefail

# Pull latest backups from repo and import to local DB
# Usage:
# LOCAL_DATABASE_URL="postgresql://user:pass@localhost:5432/whattocook?schema=public" ./scripts/pull-and-import-backup.sh

BRANCH=${1:-main}

echo "Pulling latest backups from origin/${BRANCH}..."
git fetch origin ${BRANCH}
git checkout ${BRANCH}
git pull origin ${BRANCH}

LATEST=$(ls -1t data/backups/remote-recipes-backup-*.json 2>/dev/null | head -n1 || true)
if [ -z "${LATEST}" ]; then
  echo "No backup found in data/backups/"
  exit 1
fi

echo "Using backup: ${LATEST}"
cp "${LATEST}" data/remote-recipes-backup.json

if [ -z "${LOCAL_DATABASE_URL:-}" ]; then
  echo "Please set LOCAL_DATABASE_URL env var to your local database connection string. Example:" 
  echo "LOCAL_DATABASE_URL=\"postgresql://niloy@localhost:5432/whattocook?schema=public\" ./scripts/pull-and-import-backup.sh"
  exit 1
fi

export TARGET_DATABASE_URL="$LOCAL_DATABASE_URL"
echo "Importing backup into local DB using TARGET_DATABASE_URL (local)..."
tsx scripts/importRemoteToLocal.ts

echo "Import complete."
