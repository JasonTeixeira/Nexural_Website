#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://www.nexural.io}"

echo "== Nexural smoke auth checks =="
echo "Base URL: $BASE_URL"

check_code () {
  local path="$1"
  local expect="${2:-200}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$path")
  if [[ "$code" != "$expect" ]]; then
    echo "FAIL $path expected $expect got $code"
    exit 1
  fi
  echo "OK   $path ($code)"
}

check_code "/api/health/env" 200
check_code "/auth/login" 200
check_code "/admin/login" 200
check_code "/api/public/marketplace/products" 200

echo "All smoke checks passed."
