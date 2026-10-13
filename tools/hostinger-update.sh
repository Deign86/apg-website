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
for f in listings.generated.md listings.generated.json listings.status.json drive-doc-cache.json; do [ -f public_html/api/data/$f ] && cp -p public_html/api/data/$f releases/stage/api/data/; done   # Drive sync output
rm -rf public_html/api
cp -a releases/stage/. public_html/
rm -rf releases/stage releases/stage.tar.gz
rm -f public_html/.dbsetup.log "$HOME"/.logs/cronjob_*

# One-off data fixes for this release (api/lib/DataFixes.php, each runs once per database), after a
# DB backup to releases/db-pre-<tag>.sql.gz (outside public_html). No backup, no data fixes. A failure
# is logged, not fatal: the files are already live; re-run the command by hand.
# DB credentials come from the server-only .env; a 0600 option file keeps them off the command line.
env_val() { grep -m1 "^$1=" public_html/.env | cut -d= -f2- | sed -e 's/^["'"'"']//' -e 's/["'"'"']$//'; }
CNF="$(mktemp)"
chmod 600 "$CNF"
printf '[client]\nuser=%s\npassword=%s\nhost=%s\nport=%s\n' \
  "$(env_val DB_USER)" "$(env_val DB_PASS)" "$(env_val DB_HOST)" "$(env_val DB_PORT)" > "$CNF"
PHP="$(command -v php || echo /usr/bin/php)"
if mysqldump --defaults-extra-file="$CNF" --single-transaction --routines --no-tablespaces "$(env_val DB_NAME)" \
     | gzip > "releases/db-pre-$TAG.sql.gz" && [ "$(gzip -dc "releases/db-pre-$TAG.sql.gz" | head -c 1 | wc -c)" -eq 1 ]; then
  echo "backup: releases/db-pre-$TAG.sql.gz ($(du -h "releases/db-pre-$TAG.sql.gz" | cut -f1))"
  "$PHP" public_html/api/cron/data-fixes.php || echo "data-fixes failed (exit $?): $PHP public_html/api/cron/data-fixes.php"
else
  echo "db backup failed; data fixes skipped: $PHP public_html/api/cron/data-fixes.php"
fi
rm -f "$CNF"

touch "releases/$TAG.done"
echo "== $TAG done $(date -u)"
