#!/bin/bash
# In-place update of alphapremiergroup.com from a GitHub release bundle. Runs ON the Hostinger
# server via a one-off cron job (see DEPLOY.md "Deploying without SSH").
#   usage: hostinger-update.sh <release-tag>
# Keeps server-only state (public_html/.env, public_html/uploads/). Snapshots the current
# docroot (minus uploads) to ../releases/pre-<tag>.tar.gz first, so a bad deploy can be undone.
set -euo pipefail
shopt -s dotglob nullglob

TAG="${1:?release tag required}"
SITE="$HOME/domains/alphapremiergroup.com"
URL="https://github.com/Deign86/apg-website/releases/download/$TAG/apg-release.tar.gz"
cd "$SITE"
mkdir -p releases
exec 9>releases/.lock
flock -n 9 || exit 0   # cron fires every minute; never run two updates at once
LOG="$SITE/releases/$TAG.log"
exec >>"$LOG" 2>&1
trap 'cp "$LOG" "$SITE/public_html/.deploy.log" 2>/dev/null || true' EXIT
echo "== $TAG start $(date -u)"

[ -e "releases/$TAG.done" ] && { echo "already deployed"; exit 0; }

tar -czf "releases/pre-$TAG.tar.gz" --exclude=public_html/uploads public_html
rm -rf releases/stage && mkdir releases/stage
curl -fsSL -o releases/stage.tar.gz "$URL"
tar -xzf releases/stage.tar.gz -C releases/stage
test -f releases/stage/index.html && test -f releases/stage/.htaccess && test -f releases/stage/api/config.php

# Never ship these to the docroot, even if a bundle contains them.
rm -f releases/stage/.env* releases/stage/api/setup.php releases/stage/api/migrate.php releases/stage/api/schema.sql
find releases/stage \( -name 'codemap.md' -o -name 'README.md' \) -delete

# Replace the API wholesale; overlay everything else. Old hashed bundles in assets/ are kept
# on purpose so a visitor holding a previous index.html can still load its scripts.
for f in listings.generated.md listings.generated.json drive-doc-cache.json; do [ -f public_html/api/data/$f ] && cp -p public_html/api/data/$f releases/stage/api/data/; done   # Drive sync output
rm -rf public_html/api
cp -a releases/stage/. public_html/
rm -rf releases/stage releases/stage.tar.gz
rm -f public_html/.dbsetup.log "$HOME"/.logs/cronjob_*

touch "releases/$TAG.done"
echo "== $TAG done $(date -u)"
