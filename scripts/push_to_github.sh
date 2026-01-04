#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/push_to_github.sh
# Requires GitHub CLI (`gh`) authenticated, or edit to use your preferred method.

REPO_NAME=whattocook
OWNER=niloydiu

echo "Creating GitHub repo ${OWNER}/${REPO_NAME} (public) and pushing..."

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install GitHub CLI and authenticate (gh auth login)."
  exit 1
fi

gh repo create ${OWNER}/${REPO_NAME} --public --source=. --remote=origin --push

echo "Pushed to https://github.com/${OWNER}/${REPO_NAME}"
