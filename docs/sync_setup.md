## Remote → Local Free Sync Setup

This repository includes two free components to keep a copy of the remote recipe data available and recoverable:

- A GitHub Actions workflow `.github/workflows/export-remote.yml` that runs nightly and exports the remote recipes into `data/remote-recipes-backup.json`, then commits a timestamped backup to `data/backups/`.
- A local helper script `scripts/pull-and-import-backup.sh` that you run on your machine to pull the latest backup from the repo and import it into your local database.

How to enable (quick):

1. Add a repository secret named `REMOTE_DATABASE_URL` containing your remote database connection string.
2. Confirm the workflow runs (you can trigger it manually via Actions -> Export Remote Recipes -> Run workflow).
3. On your local machine, set up a cron job or run manually:

```bash
# example manual run
git pull origin main
LOCAL_DATABASE_URL="postgresql://niloy@localhost:5432/whattocook?schema=public" ./scripts/pull-and-import-backup.sh
```

Notes:

- This approach is free (uses GitHub Actions free tier and git) and creates immutable backups in the repo.
- For fully automated local imports, run `pull-and-import-backup.sh` via a cron job on your machine. Be mindful of credentials and secure your local environment.
- If you want real-time sync in future, we can design a CDC pipeline (Debezium/wal2json) but that requires additional infrastructure.
