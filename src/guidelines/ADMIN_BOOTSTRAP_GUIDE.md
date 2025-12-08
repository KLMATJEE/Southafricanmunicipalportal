# 🔐 Admin User Bootstrap Guide

## Overview

The South African Municipal Portal implements a secure role-based access control system where **admin accounts cannot be created through the public signup**. This is a critical security feature.

---

## 🎯 Key Security Points

### Public Signup Restrictions
- ✅ Public signup **always** creates `citizen` role accounts
- ❌ Cannot create `admin`, `supervisor`, `auditor`, or `billing_officer` via public UI
- 🔒 Role is enforced at the backend level (not just UI)

### Admin Creation Requirements
1. Must use Supabase Admin API (service role key)
2. Requires direct database access to KV store
3. First admin must be bootstrapped manually
4. Subsequent admins can be created by existing admins through the app

### Authorization Model
```
Public Signup → Supabase Auth → KV Store Profile (role: citizen)
                                        ↓
                                Role Check on Every Request
                                        ↓
                        Admin Endpoints → Requires role: admin
```

---

## 🚀 Bootstrap Your First Admin

### Prerequisites

You need these environment variables:
```bash
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
ADMIN_EMAIL="admin@municipality.gov.za"
ADMIN_PASSWORD="SecurePassword123!"
ADMIN_NAME="System Administrator"
```

**⚠️ Security Warning:** 
- Keep your service role key SECRET
- Never commit it to version control
- Use strong passwords for admin accounts
- Use official government email addresses

---

## 📝 Method 1: Node.js Script (Recommended)

### Step 1: Create the Script

Save this as `create_admin.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

/**
 * Bootstrap Admin User Creation Script
 * 
 * Usage:
 *   export SUPABASE_URL="https://<project>.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="service_role_key_here"
 *   export ADMIN_EMAIL="admin@test.gov.za"
 *   export ADMIN_PASSWORD="P@ssw0rd123!"
 *   export ADMIN_NAME="Site Admin"
 *   node create_admin.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.gov.za'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'P@ssw0rd123!'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Site Admin'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function createAdminUser() {
  console.log('🔧 Creating admin user...')
  console.log('Email:', ADMIN_EMAIL)
  console.log('Name:', ADMIN_NAME)
  
  try {
    // Step 1: Create user in Supabase Auth
    console.log('\n📝 Step 1: Creating Supabase Auth user...')
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: ADMIN_NAME,
        role: 'admin',
        municipality: 'Default Municipality'
      }
    })

    if (error) {
      console.error('❌ Failed to create user:', error.message)
      process.exit(1)
    }

    const createdUser = data?.user || data
    const userId = createdUser?.id
    
    if (!userId) {
      console.error('❌ No user ID returned')
      process.exit(1)
    }
    
    console.log('✅ User created with ID:', userId)

    // Step 2: Create KV store profile
    console.log('\n📝 Step 2: Creating KV store profile...')
    const kvRow = {
      key: `user_${userId}`,
      value: {
        id: userId,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: 'admin',
        municipality: 'Default Municipality',
        createdAt: new Date().toISOString()
      }
    }

    const { error: kvError } = await supabase
      .from('kv_store_4c8674b4')
      .upsert(kvRow, { onConflict: 'key' })

    if (kvError) {
      console.error('❌ Failed to create KV profile:', kvError.message)
      console.error('⚠️  Auth user created but KV profile failed!')
      console.error('You may need to manually insert the KV record.')
      process.exit(1)
    }
    
    console.log('✅ KV profile created')

    // Step 3: Verify by signing in
    console.log('\n📝 Step 3: Verifying credentials...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    if (signInError) {
      console.error('⚠️  Warning: Could not sign in:', signInError.message)
      console.error('User may exist but authentication failed.')
    } else {
      console.log('✅ Sign-in successful!')
      console.log('Access token:', signInData?.session?.access_token?.substring(0, 20) + '...')
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUCCESS! Admin user created successfully!')
    console.log('='.repeat(60))
    console.log('\n📋 Admin User Details:')
    console.log('   Email:', ADMIN_EMAIL)
    console.log('   Name:', ADMIN_NAME)
    console.log('   User ID:', userId)
    console.log('   Role: admin')
    console.log('\n🔐 Next Steps:')
    console.log('   1. Open your municipal portal')
    console.log('   2. Sign in with the email and password')
    console.log('   3. You should see the Admin Panel tab')
    console.log('   4. Use "Initialize Sample Data" to populate demo data')
    console.log('\n⚠️  Security Reminder:')
    console.log('   - Change the password after first login')
    console.log('   - Keep the service role key secure')
    console.log('   - Create additional admins through the app UI')
    console.log('')

  } catch (err) {
    console.error('\n❌ Unexpected error:', err)
    process.exit(1)
  }
}

// Run the script
createAdminUser().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 3: Set Environment Variables

**Option A: Export in terminal**
```bash
export SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export ADMIN_EMAIL="admin@municipality.gov.za"
export ADMIN_PASSWORD="SecurePassword123!"
export ADMIN_NAME="System Administrator"
```

**Option B: Create .env file** (Don't commit this!)
```env
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=admin@municipality.gov.za
ADMIN_PASSWORD=SecurePassword123!
ADMIN_NAME=System Administrator
```

Then use dotenv:
```bash
npm install dotenv
node -r dotenv/config create_admin.js
```

### Step 4: Run the Script

```bash
node create_admin.js
```

### Expected Output

```
🔧 Creating admin user...
Email: admin@municipality.gov.za
Name: System Administrator

📝 Step 1: Creating Supabase Auth user...
✅ User created with ID: 550e8400-e29b-41d4-a716-446655440000

📝 Step 2: Creating KV store profile...
✅ KV profile created

📝 Step 3: Verifying credentials...
✅ Sign-in successful!
Access token: eyJhbGciOiJIUzI1NiIs...

============================================================
🎉 SUCCESS! Admin user created successfully!
============================================================

📋 Admin User Details:
   Email: admin@municipality.gov.za
   Name: System Administrator
   User ID: 550e8400-e29b-41d4-a716-446655440000
   Role: admin

🔐 Next Steps:
   1. Open your municipal portal
   2. Sign in with the email and password
   3. You should see the Admin Panel tab
   4. Use "Initialize Sample Data" to populate demo data
```

---

## 🐚 Method 2: Bash Script (Alternative)

### Step 1: Create the Script

Save this as `create_admin.sh`:

```bash
#!/usr/bin/env bash
# create_admin.sh - Bootstrap admin user for SA Municipal Portal
#
# Usage:
#   export SUPABASE_URL="https://<project>.supabase.co"
#   export SUPABASE_SERVICE_ROLE_KEY="service_role_key_here"
#   export ADMIN_EMAIL="admin@test.gov.za"
#   export ADMIN_PASSWORD="P@ssw0rd123!"
#   export ADMIN_NAME="Site Admin"
#   chmod +x create_admin.sh
#   ./create_admin.sh

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check required environment variables
: "${SUPABASE_URL:?❌ Need to set SUPABASE_URL}"
: "${SUPABASE_SERVICE_ROLE_KEY:?❌ Need to set SUPABASE_SERVICE_ROLE_KEY}"
: "${ADMIN_EMAIL:?❌ Need to set ADMIN_EMAIL}"
: "${ADMIN_PASSWORD:?❌ Need to set ADMIN_PASSWORD}"
: "${ADMIN_NAME:?❌ Need to set ADMIN_NAME}"

echo -e "${GREEN}🔧 Creating admin user...${NC}"
echo "Email: $ADMIN_EMAIL"
echo "Name: $ADMIN_NAME"
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
  echo -e "${RED}❌ Failed to create user. Response:${NC}"
  echo "$CREATE_RESP"
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
  echo -e "${RED}❌ Failed to create KV profile:${NC}"
  echo "$KV_RESP"
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
  echo "$TOKEN_RESP"
else
  echo -e "${GREEN}✅ Sign-in successful!${NC}"
  echo "Access token: ${ACCESS_TOKEN:0:20}..."
fi

# Success summary
echo ""
echo "============================================================"
echo -e "${GREEN}🎉 SUCCESS! Admin user created successfully!${NC}"
echo "============================================================"
echo ""
echo "📋 Admin User Details:"
echo "   Email: $ADMIN_EMAIL"
echo "   Name: $ADMIN_NAME"
echo "   User ID: $USER_ID"
echo "   Role: admin"
echo ""
echo "🔐 Next Steps:"
echo "   1. Open your municipal portal"
echo "   2. Sign in with the email and password"
echo "   3. You should see the Admin Panel tab"
echo "   4. Use 'Initialize Sample Data' to populate demo data"
echo ""
echo "⚠️  Security Reminder:"
echo "   - Change the password after first login"
echo "   - Keep the service role key secure"
echo "   - Create additional admins through the app UI"
echo ""
```

### Step 2: Make Executable

```bash
chmod +x create_admin.sh
```

### Step 3: Run the Script

```bash
./create_admin.sh
```

---

## 🔍 Troubleshooting

### Issue: "User already exists"

**Cause:** An account with this email already exists

**Solution:**
1. Try signing in with the existing email
2. If it's a citizen account, delete it via Supabase Dashboard
3. Or use a different email address

```bash
# Check if user exists in Supabase Dashboard:
# Authentication → Users → Search by email
```

### Issue: "Failed to create KV profile"

**Cause:** Direct database access may be restricted

**Solution:**
1. Check Supabase Dashboard → Database → kv_store_4c8674b4 table exists
2. Verify service role key has admin privileges
3. Manually insert the KV record via SQL:

```sql
INSERT INTO kv_store_4c8674b4 (key, value)
VALUES (
  'user_YOUR_USER_ID_HERE',
  '{
    "id": "YOUR_USER_ID_HERE",
    "email": "admin@municipality.gov.za",
    "name": "System Administrator",
    "role": "admin",
    "municipality": "Default Municipality",
    "createdAt": "2025-10-31T12:00:00Z"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;
```

### Issue: "Could not sign in"

**Cause:** Auth user exists but credentials don't work

**Solution:**
1. Reset password via Supabase Dashboard
2. Check if email confirmation is required
3. Verify the password meets requirements

### Issue: "Admin Panel not showing"

**Cause:** KV profile role is not 'admin'

**Solution:**
1. Check the KV store via Supabase Dashboard:
   ```sql
   SELECT * FROM kv_store_4c8674b4 
   WHERE key = 'user_YOUR_USER_ID';
   ```
2. Verify the `value->>'role'` is `'admin'`
3. Update if needed:
   ```sql
   UPDATE kv_store_4c8674b4
   SET value = jsonb_set(value, '{role}', '"admin"')
   WHERE key = 'user_YOUR_USER_ID';
   ```

---

## ✅ Verification Checklist

After running the bootstrap script:

- [ ] Script completed without errors
- [ ] User ID was returned
- [ ] Access token was generated
- [ ] Can sign in to the portal
- [ ] "Admin Panel" tab is visible
- [ ] Can access admin-only features
- [ ] Sample data initializer works
- [ ] Can create additional admin users

---

## 🔐 Security Best Practices

### Service Role Key
- ✅ Never commit to Git
- ✅ Store in environment variables only
- ✅ Rotate regularly
- ✅ Use different keys for dev/prod

### Admin Passwords
- ✅ Minimum 12 characters
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ Change after first login
- ✅ Use password manager

### Admin Accounts
- ✅ Use official government email addresses
- ✅ Enable 2FA (when available)
- ✅ Limit number of admin users
- ✅ Audit admin actions regularly

### Creating Additional Admins
Once you have one admin, create others through the app:
1. Sign in as admin
2. Go to Admin Panel
3. Click "User Management" tab
4. Click "Create Admin User"
5. Fill in details and submit

---

## 📊 Role Hierarchy

```
admin
├── Full access to all features
├── Create other admin/supervisor/auditor/billing_officer accounts
├── Manage all data
└── View all audit logs

supervisor
├── Create tenders, contracts, suppliers
├── Manage issues
├── Create polls
└── View feedback

billing_officer
├── Generate bills
├── View transaction fees
└── Manage billing data

auditor
├── View audit logs
├── View transaction fees
└── Read-only access

citizen
├── View and pay bills
├── Report issues
├── Participate in forums
├── Vote on polls
└── Submit feedback
```

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the logs:**
   - Browser console (F12)
   - Supabase logs (Dashboard → Logs)
   - Edge function logs

2. **Verify environment:**
   - SUPABASE_URL is correct
   - SERVICE_ROLE_KEY is valid
   - Database table exists

3. **Manual verification:**
   ```sql
   -- Check Auth user
   SELECT id, email, raw_user_meta_data 
   FROM auth.users 
   WHERE email = 'admin@municipality.gov.za';
   
   -- Check KV profile
   SELECT * FROM kv_store_4c8674b4 
   WHERE key LIKE 'user_%';
   ```

---

## 📝 Summary

1. **First admin MUST be created manually** using service role key
2. **Subsequent admins** can be created through the app UI
3. **Public signup** always creates citizen accounts
4. **Use the provided scripts** for easy bootstrapping
5. **Keep service role key secure** at all times

---

*Last updated: 2025-10-31*
*For: South African Municipal Portal v2.0.0*
