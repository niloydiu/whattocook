#!/usr/bin/env bash
set -euo pipefail

# Safe sync from remote DB to local DB (export -> clear local -> import)
# Usage:
# REMOTE_DATABASE_URL="postgresql://user:pass@host:5432/remotedb" \
# LOCAL_DATABASE_URL="postgresql://user:pass@localhost:5432/whattocook" \
# ./scripts/sync-remote-to-local.sh

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN mode enabled — no destructive actions will be performed."
else
  if [ -z "${REMOTE_DATABASE_URL:-}" ] || [ -z "${LOCAL_DATABASE_URL:-}" ]; then
    echo "ERROR: REMOTE_DATABASE_URL and LOCAL_DATABASE_URL must be set as env vars"
    echo "Example: REMOTE_DATABASE_URL=... LOCAL_DATABASE_URL=... ./scripts/sync-remote-to-local.sh"
    exit 1
  fi
fi

# Show URLs for confirmation (may be placeholders in DRY_RUN)
echo "REMOTE_DATABASE_URL: ${REMOTE_DATABASE_URL:-<not set>}"
echo "LOCAL_DATABASE_URL: ${LOCAL_DATABASE_URL:-<not set>}"

echo "\nIMPORTANT: This script WILL DELETE data in the LOCAL database, and WILL NOT delete or modify REMOTE data."
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: Skipping confirmation prompt."
else
  read -p "Type YES to continue: " confirm
  if [ "$confirm" != "YES" ]; then
    echo "Aborting. No changes made."
    exit 0
  fi
fi

# Step 1: Export from remote to data/remote-recipes-backup.json
echo "\n[1/4] Exporting recipes from REMOTE to data/remote-recipes-backup.json using DATABASE_URL (remote)..."
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: Would run: DATABASE_URL=\"${REMOTE_DATABASE_URL:-<REMOTE_DATABASE_URL>}\" tsx scripts/exportRemoteRecipes.ts"
else
  export DATABASE_URL="$REMOTE_DATABASE_URL"
  tsx scripts/exportRemoteRecipes.ts
fi

# Step 2: Make a copy of the backup with timestamp
TS=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p data/backups
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: Would copy data/remote-recipes-backup.json to data/backups/remote-recipes-backup-${TS}.json"
else
  cp data/remote-recipes-backup.json data/backups/remote-recipes-backup-${TS}.json
  echo "Backup copied to data/backups/remote-recipes-backup-${TS}.json"
fi

# Step 3: Inspect LOCAL counts before deletion
echo "\n[2/4] Showing LOCAL DB counts before deletion (using DATABASE_URL pointing to local):"
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: Would run tsx to show counts with DATABASE_URL=\"${LOCAL_DATABASE_URL:-<LOCAL_DATABASE_URL>}\""
  echo "DRY RUN: recipes: <count>"
  echo "DRY RUN: recipeIngredients: <count>"
  echo "DRY RUN: steps: <count>"
  echo "DRY RUN: blogContent: <count>"
else
  export DATABASE_URL="$LOCAL_DATABASE_URL"
  tsx -e 'const Prisma=require("@prisma/client").PrismaClient; (async()=>{const p=new Prisma(); try{console.log("recipes:", await p.recipe.count()); console.log("recipeIngredients:", await p.recipeIngredient.count()); console.log("steps:", await p.recipeStep.count()); console.log("blogContent:", await p.recipeBlogContent.count());}catch(e){console.error(e);}finally{await p.$disconnect();}})()'

  read -p "Type YES to DELETE all recipes from LOCAL database now: " confirm2
  if [ "$confirm2" != "YES" ]; then
    echo "Aborting. No changes made to LOCAL DB. Backup remains in data/remote-recipes-backup.json"
    exit 0
  fi
fi

# Step 4: Delete local recipes
echo "\n[3/4] Deleting all recipes from LOCAL database..."
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: Would run tsx scripts/deleteAllRecipes.ts with DATABASE_URL=\"${LOCAL_DATABASE_URL:-<LOCAL_DATABASE_URL>}\""
else
  tsx scripts/deleteAllRecipes.ts
fi

# Optional: delete ingredients to avoid id/sequence conflicts on fresh import
echo "\n[3.5/4] Deleting ingredients and related links from LOCAL database to avoid id conflicts..."
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: Would run tsx scripts/deleteAllIngredients.ts with DATABASE_URL=\"${LOCAL_DATABASE_URL:-<LOCAL_DATABASE_URL>}\""
else
  tsx scripts/deleteAllIngredients.ts
fi

# Step 5: Import backup into local using TARGET_DATABASE_URL
echo "\n[4/4] Importing backup into LOCAL database using TARGET_DATABASE_URL..."
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: Would run: TARGET_DATABASE_URL=\"${LOCAL_DATABASE_URL:-<LOCAL_DATABASE_URL>}\" tsx scripts/importRemoteToLocal.ts"
else
  tsx scripts/importRemoteToLocal.ts
fi

echo "\nSync complete. Local DB now contains data imported from remote backup."

echo "Reminder: remote database was not modified."
