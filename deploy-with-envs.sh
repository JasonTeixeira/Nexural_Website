#!/bin/bash

# Nexural Trading - Bulk Deploy with Environment Variables
# This script reads .env.local and adds all variables to Vercel, then deploys

set -e  # Exit on any error

echo "🚀 Nexural Trading - Bulk Environment Variable Deployment"
echo "=========================================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    exit 1
fi

echo "✅ Found .env.local file"
echo ""

# Count variables
VAR_COUNT=$(grep -c "^[A-Z]" .env.local || true)
echo "📊 Found $VAR_COUNT environment variables to add"
echo ""

# Link to Vercel project (if not already linked)
echo "🔗 Linking to Vercel project..."
if [ ! -d ".vercel" ]; then
    echo "   Running: vercel link"
    vercel link --yes
else
    echo "   ✅ Already linked to Vercel"
fi
echo ""

# Add each environment variable to Vercel
echo "📤 Adding environment variables to Vercel..."
echo "   (This will take about 30-60 seconds)"
echo ""

ADDED=0
SKIPPED=0

# Read .env.local line by line
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
        continue
    fi
    
    # Extract variable name and value
    if [[ "$line" =~ ^([A-Z_0-9]+)=(.*)$ ]]; then
        VAR_NAME="${BASH_REMATCH[1]}"
        VAR_VALUE="${BASH_REMATCH[2]}"
        
        # Remove quotes if present
        VAR_VALUE="${VAR_VALUE%\"}"
        VAR_VALUE="${VAR_VALUE#\"}"
        
        echo "   Adding: $VAR_NAME"
        
        # Add to Vercel (production, preview, and development)
        # Pipe the value to avoid interactive prompt
        echo "$VAR_VALUE" | vercel env add "$VAR_NAME" production preview development --force > /dev/null 2>&1 && {
            ((ADDED++))
        } || {
            echo "      ⚠️  Skipped (may already exist): $VAR_NAME"
            ((SKIPPED++))
        }
    fi
done < .env.local

echo ""
echo "✅ Environment variables added:"
echo "   - Added: $ADDED"
echo "   - Skipped: $SKIPPED"
echo ""

# Deploy to production
echo "🚀 Deploying to production..."
echo "   (This will take 3-5 minutes)"
echo ""

vercel --prod --yes

echo ""
echo "=========================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================================="
echo ""
echo "Your site should be live now!"
echo "Check: https://vercel.com/sage-7259s-projects/nexural-trading"
echo ""
