#!/bin/bash

###############################################################################
# DATABASE BACKUP SCRIPT
# Automated backup of Supabase PostgreSQL database
# Usage: ./scripts/backup-database.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="nexural_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Check if required environment variables are set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL environment variable not set${NC}"
    echo "Please set it in your .env file or export it"
    echo "Format: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
    exit 1
fi

echo -e "${GREEN}=== Nexural Trading Database Backup ===${NC}"
echo "Starting backup at: $(date)"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform the backup
echo -e "${YELLOW}Backing up database...${NC}"
if pg_dump "$SUPABASE_DB_URL" \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_DIR/$BACKUP_FILE" \
    --verbose \
    --no-owner \
    --no-acl 2>&1 | grep -v "^$"; then
    
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    echo "Backup file: $BACKUP_DIR/$BACKUP_FILE"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "Backup size: $FILE_SIZE"
    
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Compress the backup (already compressed by pg_dump, but creating .gz for clarity)
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "$BACKUP_DIR/$BACKUP_FILE"
COMPRESSED_FILE="$BACKUP_DIR/${BACKUP_FILE}.gz"

if [ -f "$COMPRESSED_FILE" ]; then
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo -e "${GREEN}✓ Compression completed${NC}"
    echo "Compressed file: $COMPRESSED_FILE"
    echo "Compressed size: $COMPRESSED_SIZE"
fi

# Clean up old backups (keep only last 30 days)
echo -e "${YELLOW}Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -name "nexural_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
REMAINING=$(find "$BACKUP_DIR" -name "nexural_backup_*.sql.gz" -type f | wc -l)
echo -e "${GREEN}✓ Old backups cleaned${NC}"
echo "Remaining backups: $REMAINING"

echo ""
echo -e "${GREEN}=== Backup Complete ===${NC}"
echo "Finished at: $(date)"

# Optional: Upload to cloud storage (uncomment if using AWS S3)
# if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
#     echo -e "${YELLOW}Uploading to S3...${NC}"
#     aws s3 cp "$COMPRESSED_FILE" "s3://$AWS_S3_BACKUP_BUCKET/backups/"
#     echo -e "${GREEN}✓ Uploaded to S3${NC}"
# fi

# Optional: Send notification (uncomment if using Discord webhook)
# if [ ! -z "$DISCORD_BACKUP_WEBHOOK" ]; then
#     curl -X POST "$DISCORD_BACKUP_WEBHOOK" \
#         -H "Content-Type: application/json" \
#         -d "{\"content\": \"✅ Database backup completed: $BACKUP_FILE (Size: $COMPRESSED_SIZE)\"}"
# fi

exit 0
