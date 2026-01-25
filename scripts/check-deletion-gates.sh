#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/check-deletion-gates.sh <base_url> <days>
# Example:
#   ./scripts/check-deletion-gates.sh https://www.nexural.io 1

BASE_URL="${1:-}"
DAYS="${2:-1}"

if [[ -z "$BASE_URL" ]]; then
  echo "Usage: $0 <base_url> <days>"
  exit 1
fi

echo "Checking deletion-gate counts from: $BASE_URL (days=$DAYS)"
echo "NOTE: Must be run in a browser session OR with an Authorization header; otherwise you'll get 401."

echo
echo "Open this in your browser while logged into /admin:"
echo "  $BASE_URL/api/admin/deletion-gates?days=$DAYS"
echo

echo "If you want curl, export ADMIN_BEARER_TOKEN and run:"
cat <<'CURL'
  curl -sS "$BASE_URL/api/admin/deletion-gates?days=$DAYS" \
    -H "Authorization: Bearer $ADMIN_BEARER_TOKEN" | jq
CURL
