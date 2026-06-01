#!/usr/bin/env bash
# Deploy the static export (./out) to cPanel public_html via FTPS.
#
# Required env (from .env.local or shell):
#   CPANEL_FTP_HOST  e.g. maredatum.pt or ftp.maredatum.pt
#   CPANEL_FTP_USER  e.g. maredatum (your cPanel user, or a dedicated FTP account)
#   CPANEL_FTP_PASS  the FTP password
# Optional:
#   CPANEL_FTP_PORT  default 21
#   CPANEL_REMOTE_DIR  default public_html

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Load .env.local if present
if [ -f .env.local ]; then
  # shellcheck disable=SC1091
  set -a
  . .env.local
  set +a
fi

: "${CPANEL_FTP_HOST:?CPANEL_FTP_HOST is required}"
: "${CPANEL_FTP_USER:?CPANEL_FTP_USER is required}"
: "${CPANEL_FTP_PASS:?CPANEL_FTP_PASS is required}"
CPANEL_FTP_PORT=${CPANEL_FTP_PORT:-21}
CPANEL_REMOTE_DIR=${CPANEL_REMOTE_DIR:-public_html}

if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp not found. Install via: brew install lftp" >&2
  exit 1
fi

echo "▸ Building static export..."
npm run build:static

if [ ! -d "out" ]; then
  echo "out/ not found after build" >&2
  exit 1
fi

echo "▸ Uploading out/ → ${CPANEL_FTP_HOST}:${CPANEL_REMOTE_DIR}"
lftp -p "$CPANEL_FTP_PORT" -u "$CPANEL_FTP_USER","$CPANEL_FTP_PASS" "$CPANEL_FTP_HOST" <<EOF
set ssl:verify-certificate no
set ftp:ssl-protect-data true
set net:max-retries 3
set net:reconnect-interval-base 4
mirror --reverse --delete --verbose --parallel=4 \
  --exclude-glob '.well-known/' \
  --exclude-glob '.htaccess' \
  --exclude-glob 'cgi-bin/' \
  out/ ${CPANEL_REMOTE_DIR}/
bye
EOF

echo "✓ Deploy concluído. https://maredatum.pt"
