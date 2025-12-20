#!/bin/bash

###############################################################################
# ARCHIVE UNUSED CODE
# Moves partial/unused integrations to _ARCHIVE for future reference
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Archiving Unused Code ===${NC}"
echo "Moving partial integrations to _ARCHIVE/future-features/"
echo ""

# Create archive directories
mkdir -p _ARCHIVE/future-features/lib
mkdir -p _ARCHIVE/future-features/docs

# Files to archive (not currently integrated)
ARCHIVE_FILES=(
    "lib/databento-client.ts"
    "lib/databento-service.ts"
    "lib/futures-trading-integration.ts"
    "lib/advanced-analytics.ts"
)

# Files to keep (actively used)
# - lib/alpaca-client.ts (price updates)
# - lib/position-manager.ts (may be used)
# - lib/signal-generator.ts (may be used)

echo -e "${YELLOW}Archiving these files:${NC}"
for file in "${ARCHIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
        mv "$file" "_ARCHIVE/future-features/$file"
    else
        echo "  ⊘ $file (not found)"
    fi
done

# Create documentation
cat > _ARCHIVE/future-features/README.md << 'EOF'
# Future Features Archive

This directory contains code for features that are planned but not yet integrated into the main platform.

## Archived Integrations

### DataBento Integration
**Files:** `lib/databento-client.ts`, `lib/databento-service.ts`  
**Purpose:** Market data provider for advanced market data feeds  
**Status:** Partial implementation, not connected to main platform  
**To Enable:** 
1. Sign up at https://databento.com
2. Add DATABENTO_API_KEY to environment
3. Integrate with position tracking system

### Futures Trading
**File:** `lib/futures-trading-integration.ts`  
**Purpose:** Support for futures/options trading beyond equities  
**Status:** Basic structure, needs completion  
**To Enable:**
1. Complete futures contract data model
2. Add futures-specific position tracking
3. Update UI for futures display

### Advanced Analytics
**File:** `lib/advanced-analytics.ts`  
**Purpose:** Enhanced analytics and predictive models  
**Status:** Framework only, needs ML integration  
**To Enable:**
1. Integrate ML models
2. Add prediction endpoints
3. Create analytics dashboard

## Active Integrations

These remain in the main codebase:

- **Alpaca Client** (`lib/alpaca-client.ts`) - Used for live price updates
- **Position Manager** (`lib/position-manager.ts`) - Position lifecycle management
- **Signal Generator** (`lib/signal-generator.ts`) - Trading signal generation

## Restoration

To restore any feature:
```bash
# Move file back to original location
mv _ARCHIVE/future-features/lib/[filename].ts lib/[filename].ts

# Update imports in consuming files
# Test integration
# Update documentation
```

---
**Last Updated:** December 17, 2025
EOF

echo ""
echo -e "${GREEN}✓ Archive complete${NC}"
echo "Files moved to: _ARCHIVE/future-features/"
echo "Documentation: _ARCHIVE/future-features/README.md"
