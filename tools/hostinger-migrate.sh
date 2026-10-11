#!/bin/bash
# One-off database migration for alphapremiergroup.com, run ON the Hostinger server by a cron job
# right after tools/hostinger-update.sh has deployed the same release (that script strips
# api/migrate.php from the docroot, so it is fetched here from the release assets instead).
#   usage: hostinger-migrate.sh <release-tag>
# 1. Backs up the production DB to ../releases/db-pre-<tag>.sql.gz (outside public_html).
# 2. Runs api/migrate.php once from the CLI (idempotent; seeds are insert-only).
# 3. Removes migrate.php from the docroot again, whatever happened.
set -euo pipefail

TAG="${1:?release tag required}"
SITE="$HOME/domains/alphapremiergroup.com"
ASSET="https://github.com/Deign86/apg-website/releases/download/$TAG/migrate.php"
cd "$SITE"
mkdir -p releases
exec 9>releases/.migrate.lock
flock -n 9 || exit 0   # cron fires every minute; never run two migrations at once
LOG="$SITE/releases/$TAG.migrate.log"
exec >>"$LOG" 2>&1
CNF="$(mktemp)"
trap 'rm -f "$CNF" "$SITE/public_html/api/migrate.php"; cp "$LOG" "$SITE/public_html/.migrate.log" 2>/dev/null || true' EXIT
echo "== migrate $TAG start $(date -u)"

[ -e "releases/$TAG.migrated" ] && { echo "already migrated"; exit 0; }
[ -e "releases/$TAG.done" ] || { echo "release $TAG not deployed yet"; exit 1; }

# DB credentials come from the server-only .env; a 0600 option file keeps them off the command line.
env_val() { grep -m1 "^$1=" public_html/.env | cut -d= -f2- | sed -e 's/^["'"'"']//' -e 's/["'"'"']$//'; }
chmod 600 "$CNF"
printf '[client]\nuser=%s\npassword=%s\nhost=%s\nport=%s\n' \
  "$(env_val DB_USER)" "$(env_val DB_PASS)" "$(env_val DB_HOST)" "$(env_val DB_PORT)" > "$CNF"
DB="$(env_val DB_NAME)"

mysqldump --defaults-extra-file="$CNF" --single-transaction --routines --no-tablespaces "$DB" \
  | gzip > "releases/db-pre-$TAG.sql.gz"
test -s "releases/db-pre-$TAG.sql.gz"
echo "backup: releases/db-pre-$TAG.sql.gz ($(du -h "releases/db-pre-$TAG.sql.gz" | cut -f1))"

curl -fsSL -o public_html/api/migrate.php "$ASSET"
php public_html/api/migrate.php

touch "releases/$TAG.migrated"
echo "== migrate $TAG done $(date -u)"
