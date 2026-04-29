#!/usr/bin/env bash
set -euo pipefail

export NODE_OPTIONS="--max-old-space-size=6144"
export NEXT_TELEMETRY_DISABLED=1

echo "Running pre-deploy checks..."
echo "Node: $(node -v)"
npm run lint
npm run build

echo "Committing changes (if any)..."
git add -A
if ! git diff --cached --quiet; then
  git commit -m "deploy: production"
else
  echo "No changes to commit"
fi

echo "Pushing to main (triggers Vercel deploy)..."
git push origin main

echo "Deployment triggered successfully."
