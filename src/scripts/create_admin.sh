#!/usr/bin/env bash
# create_admin.sh - Bootstrap admin user for SA Municipal Portal
#
# This script creates the first admin user for your municipal portal.
# It requires the Supabase service role key.
#
# Usage:
#   export SUPABASE_URL="https://<project>.supabase.co"
#   export SUPABASE_SERVICE_ROLE_KEY="service_role_key_here"
#   export ADMIN_EMAIL="admin@municipality.gov.za"
#   export ADMIN_PASSWORD="SecurePassword123!"
#   export ADMIN_NAME="System Administrator"
#   chmod +x create_admin.sh
#   ./create_admin.sh

set -euo pipefail

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check required environment variables
if [ -z "${SUPABASE_URL:-}" ]; then
  echo -e "${RED}❌ Error: SUPABASE_URL is not set${NC}"
  echo "Please set: export SUPABASE_URL=\"https://your-project.supabase.co\""
  exit 1
fi

if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo -e "${RED}❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set${NC}"
  echo "Please set: export SUPABASE_SERVICE_ROLE_KEY=\"your-service-role-key\""
  exit 1
fi

if [ -z "${ADMIN_EMAIL:-}" ]; then
  echo -e "${RED}❌ Error: ADMIN_EMAIL is not set${NC}"
  echo "Please set: export ADMIN_EMAIL=\"admin@municipality.gov.za\""
  exit 1
fi

if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo -e "${RED}❌ Error: ADMIN_PASSWORD is not set${NC}"
  echo "Please set: export ADMIN_PASSWORD=\"SecurePassword123!\""
  exit 1
fi

if [ -z "${ADMIN_NAME:-}" ]; then
  echo -e "${RED}❌ Error: ADMIN_NAME is not set${NC}"
  echo "Please set: export ADMIN_NAME=\"System Administrator\""
  exit 1
fi

# Check for required tools
if ! command -v curl &> /dev/null; then
  echo -e "${RED}❌ Error: curl is not installed${NC}"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ Error: jq is not installed${NC}"
  echo "Install with: sudo apt-get install jq (Ubuntu/Debian)"
  echo "           or: brew install jq (macOS)"
  exit 1
fi

echo -e "${BLUE}🔧 SA Municipal Portal - Admin User Bootstrap${NC}"
echo "============================================================"
echo "Email: $ADMIN_EMAIL"
echo "Name: $ADMIN_NAME"
echo "============================================================"
echo ""

# Step 1: Create user in Supabase Auth
echo -e "${GREEN}📝 Step 1: Creating Supabase Auth user...${NC}"
CREATE_RESP=$(curl -sS -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"name\": \"${ADMIN_NAME}\",
      \"role\": \"admin\",
      \"municipality\": \"Default Municipality\"
    }
  }")

# Extract user ID
USER_ID=$(echo "$CREATE_RESP" | jq -r '.id // .user?.id // empty')

if [ -z "$USER_ID" ]; then
  ERROR_MSG=$(echo "$CREATE_RESP" | jq -r '.message // .error // empty')
  if echo "$ERROR_MSG" | grep -q "already registered"; then
    echo -e "${RED}❌ User already exists with this email${NC}"
    echo "   Solution: Use a different email or delete the existing user"
  else
    echo -e "${RED}❌ Failed to create user${NC}"
    echo "Response: $CREATE_RESP"
  fi
  exit 1
fi

echo -e "${GREEN}✅ User created with ID: $USER_ID${NC}"
echo ""

# Step 2: Create KV store profile
echo -e "${GREEN}📝 Step 2: Creating KV store profile...${NC}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
KV_PAYLOAD=$(jq -n \
  --arg k "user_${USER_ID}" \
  --arg id "$USER_ID" \
  --arg email "$ADMIN_EMAIL" \
  --arg name "$ADMIN_NAME" \
  --arg role "admin" \
  --arg muni "Default Municipality" \
  --arg createdAt "$TIMESTAMP" \
  '{ 
    key: $k, 
    value: { 
      id: $id, 
      email: $email, 
      name: $name, 
      role: $role, 
      municipality: $muni, 
      createdAt: $createdAt 
    } 
  }')

KV_RESP=$(curl -sS -X POST "${SUPABASE_URL}/rest/v1/kv_store_4c8674b4" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates, return=representation" \
  -d "$KV_PAYLOAD")

if echo "$KV_RESP" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${RED}❌ Failed to create KV profile${NC}"
  echo "Response: $KV_RESP"
  echo ""
  echo -e "${YELLOW}⚠️  IMPORTANT: Auth user created but KV profile failed!${NC}"
  echo "   The user exists but won't have admin permissions."
  echo "   Run this SQL in Supabase SQL Editor to fix:"
  echo ""
  echo "   INSERT INTO kv_store_4c8674b4 (key, value) VALUES"
  echo "   ('user_${USER_ID}', '{\"id\":\"${USER_ID}\",\"email\":\"${ADMIN_EMAIL}\",\"name\":\"${ADMIN_NAME}\",\"role\":\"admin\",\"municipality\":\"Default Municipality\",\"createdAt\":\"${TIMESTAMP}\"}'::jsonb)"
  echo "   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;"
  exit 1
fi

echo -e "${GREEN}✅ KV profile created${NC}"
echo ""

# Step 3: Verify by signing in
echo -e "${GREEN}📝 Step 3: Verifying credentials...${NC}"
TOKEN_RESP=$(curl -sS -X POST "${SUPABASE_URL}/auth/v1/token" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&email=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}")

ACCESS_TOKEN=$(echo "$TOKEN_RESP" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  Warning: Could not obtain access token${NC}"
  ERROR=$(echo "$TOKEN_RESP" | jq -r '.error_description // .error // empty')
  if [ -n "$ERROR" ]; then
    echo "   Error: $ERROR"
  fi
else
  echo -e "${GREEN}✅ Sign-in successful!${NC}"
  echo "   Access token: ${ACCESS_TOKEN:0:20}..."
fi
echo ""

# Step 4: Verify KV profile
echo -e "${GREEN}📝 Step 4: Verifying KV profile...${NC}"
KV_CHECK=$(curl -sS -X GET "${SUPABASE_URL}/rest/v1/kv_store_4c8674b4?key=eq.user_${USER_ID}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}")

STORED_ROLE=$(echo "$KV_CHECK" | jq -r '.[0].value.role // empty')

if [ "$STORED_ROLE" = "admin" ]; then
  echo -e "${GREEN}✅ KV profile verified - Role: admin${NC}"
else
  echo -e "${RED}❌ KV profile role mismatch - Found: $STORED_ROLE, Expected: admin${NC}"
fi
echo ""

# Success summary
echo "============================================================"
echo -e "${GREEN}🎉 SUCCESS! Admin user created successfully!${NC}"
echo "============================================================"
echo ""
echo "📋 Admin User Details:"
echo "   Email: $ADMIN_EMAIL"
echo "   Name: $ADMIN_NAME"
echo "   User ID: $USER_ID"
echo "   Role: admin"
echo "   Municipality: Default Municipality"
echo ""
echo "🔐 Next Steps:"
echo "   1. Open your municipal portal in a web browser"
echo "   2. Click 'Sign In'"
echo "   3. Enter email: $ADMIN_EMAIL"
echo "   4. Enter the password you set"
echo "   5. You should see 'Admin Panel' in the navigation"
echo "   6. Go to Admin Panel → Initialize Sample Data"
echo ""
echo "💡 Creating Additional Admins:"
echo "   Once logged in as admin, you can create more admins via:"
echo "   Admin Panel → User Management → Create Admin User"
echo ""
echo "⚠️  Security Reminders:"
echo "   ✓ Change the password after first login"
echo "   ✓ Never commit service role key to version control"
echo "   ✓ Use strong, unique passwords"
echo "   ✓ Limit the number of admin users"
echo "   ✓ Use official government email addresses"
echo ""
