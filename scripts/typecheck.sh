#!/usr/bin/env bash
set -euo pipefail

# TypeScript typecheck (non-emit).
# Keep as a script so CI/local can run consistently.

./node_modules/.bin/tsc -p tsconfig.typecheck.json --noEmit
