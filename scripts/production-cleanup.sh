#!/bin/bash

# =====================================================
# PRODUCTION CLEANUP SCRIPT
# Archives unused/future features
# Keeps only production-ready code
# =====================================================

echo "🧹 Starting Production Cleanup..."
echo "=================================="

# Create archive directory
mkdir -p _ARCHIVE/future-features
mkdir -p _ARCHIVE/unused-files
mkdir -p _ARCHIVE/test-files

echo ""
echo "📦 Archiving future/unused features..."

# Archive advanced features not currently used
mv lib/databento-client.ts _ARCHIVE/future-features/ 2>/dev/null || true
mv lib/databento-service.ts _ARCHIVE/future-features/ 2>/dev/null || true
mv lib/advanced-analytics.ts _ARCHIVE/future-features/ 2>/dev/null || true
mv lib/futures-trading-integration.ts _ARCHIVE/future-features/ 2>/dev/null || true
mv lib/position-manager.ts _ARCHIVE/future-features/ 2>/dev/null || true
mv lib/rate-limiter.ts _ARCHIVE/future-features/ 2>/dev/null || true
mv lib/signal-generator.ts _ARCHIVE/future-features/ 2>/dev/null || true
mv lib/cron-jobs.ts _ARCHIVE/future-features/ 2>/dev/null || true

echo "  ✅ Advanced features archived"

# Archive ML/Python features
mv ml_models/ _ARCHIVE/future-features/ 2>/dev/null || true
mv ml_training/ _ARCHIVE/future-features/ 2>/dev/null || true
mv Python-testers/ _ARCHIVE/future-features/ 2>/dev/null || true
mv databento-python/ _ARCHIVE/future-features/ 2>/dev/null || true

echo "  ✅ ML/Python features archived"

# Archive test/debug files
mv test-*.js _ARCHIVE/test-files/ 2>/dev/null || true
mv test-*.html _ARCHIVE/test-files/ 2>/dev/null || true
mv scripts/test-*.js _ARCHIVE/test-files/ 2>/dev/null || true
mv scripts/check-*.js _ARCHIVE/test-files/ 2>/dev/null || true
mv scripts/*-test*.js _ARCHIVE/test-files/ 2>/dev/null || true

echo "  ✅ Test files archived"

# Archive old SQL fix files
mv *FIX*.sql _ARCHIVE/unused-files/ 2>/dev/null || true
mv *COMPLETE*.sql _ARCHIVE/unused-files/ 2>/dev/null || true
mv *SIMPLE*.sql _ARCHIVE/unused-files/ 2>/dev/null || true
mv *CLEANUP*.sql _ARCHIVE/unused-files/ 2>/dev/null || true
mv *VERIFY*.sql _ARCHIVE/unused-files/ 2>/dev/null || true

echo "  ✅ Old SQL files archived"

# Archive duplicate/old scripts
mv rename-testimonials*.js _ARCHIVE/unused-files/ 2>/dev/null || true
mv create-members-table.sql _ARCHIVE/unused-files/ 2>/dev/null || true
mv create-table-via-api.js _ARCHIVE/unused-files/ 2>/dev/null || true
mv setup-database.js _ARCHIVE/unused-files/ 2>/dev/null || true
mv fix-database-cli.js _ARCHIVE/unused-files/ 2>/dev/null || true

echo "  ✅ Old scripts archived"

# Archive old documentation
mv *_PLAN.md _ARCHIVE/unused-files/ 2>/dev/null || true
mv SESSION_*.md _ARCHIVE/unused-files/ 2>/dev/null || true
mv PHASE*.json _ARCHIVE/unused-files/ 2>/dev/null || true

echo "  ✅ Old documentation archived"

# Archive QA results
mv qa-results-*/ _ARCHIVE/unused-files/ 2>/dev/null || true

echo "  ✅ QA results archived"

# Archive python data downloaders (not needed in production)
mv download_*.py _ARCHIVE/future-features/ 2>/dev/null || true
mv ib-gateway-config.json _ARCHIVE/future-features/ 2>/dev/null || true

echo "  ✅ Python scripts archived"

echo ""
echo "=================================="
echo "✅ Cleanup Complete!"
echo ""
echo "📊 Summary:"
echo "  - Advanced features → _ARCHIVE/future-features/"
echo "  - Test files → _ARCHIVE/test-files/"
echo "  - Unused files → _ARCHIVE/unused-files/"
echo ""
echo "🚀 Platform is now production-ready!"
echo "=================================="
