#!/bin/bash

###############################################################################
# DATABASE RESTORE SCRIPT
# Restore Supabase PostgreSQL database from backup
# Usage: ./scripts/restore-database.sh <backup-file>
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: ./scripts/restore-database.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL environment variable not set${NC}"
    echo "Please set it in your .env file or export it"
    echo "Format: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: Database Restore Operation ⚠️${NC}"
echo ""
echo "This will OVERWRITE your current database with data from:"
echo "  $BACKUP_FILE"
echo ""
echo "Database: $SUPABASE_DB_URL"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to proceed): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}=== Nexural Trading Database Restore ===${NC}"
echo "Starting restore at: $(date)"
echo ""

# Decompress if file is gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup file...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
    echo -e "${GREEN}✓ Decompression completed${NC}"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Perform the restore
echo -e "${YELLOW}Restoring database...${NC}"
echo "This may take several minutes depending on database size..."
echo ""

if pg_restore \
    --dbname="$SUPABASE_DB_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --verbose \
    "$RESTORE_FILE" 2>&1 | grep -v "^$"; then
    
    echo ""
    echo -e "${GREEN}✓ Database restored successfully${NC}"
    
else
    echo ""
    echo -e "${RED}✗ Restore failed${NC}"
    echo "Please check the error messages above"
    
    # Clean up temp file if it exists
    if [ "$RESTORE_FILE" != "$BACKUP_FILE" ]; then
        rm -f "$RESTORE_FILE"
    fi
    
    exit 1
fi

# Clean up temp file if it exists
if [ "$RESTORE_FILE" != "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}Cleaning up temporary files...${NC}"
    rm -f "$RESTORE_FILE"
    echo -e "${GREEN}✓ Cleanup completed${NC}"
fi

echo ""
echo -e "${GREEN}=== Restore Complete ===${NC}"
echo "Finished at: $(date)"
echo ""
echo -e "${YELLOW}Important: Please verify your data after restore${NC}"
echo "1. Check critical tables"
echo "2. Verify user accounts"
echo "3. Test application functionality"

exit 0
