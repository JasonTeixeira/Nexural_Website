#!/bin/bash

# Script to fix all Supabase module-level initializations
# This moves createClient calls from module level to runtime functions

echo "🔧 Fixing Supabase initialization patterns..."

# Find all TypeScript files with the problematic pattern
files=$(grep -rl "const supabase = createClient(" --include="*.ts" --include="*.tsx" app/ lib/ 2>/dev/null || true)

if [ -z "$files" ]; then
  echo "✅ No files found with problematic pattern!"
  exit 0
fi

count=0
for file in $files; do
  # Check if file actually has the issue (not already fixed)
  if grep -q "^const supabase = createClient(" "$file" || grep -q "^export const supabase = createClient(" "$file"; then
    echo "  📝 Processing: $file"
    count=$((count + 1))
  fi
done

echo ""
echo "📊 Found $count files with module-level Supabase initialization"
echo ""
echo "⚠️  This script would fix them, but please run the Node.js version instead:"
echo "   node fix-supabase-files.js"
