import { createClient } from '@supabase/supabase-js'

/**
 * Bootstrap Admin User Creation Script for SA Municipal Portal
 * 
 * This script creates the first admin user for your municipal portal.
 * It must be run with the Supabase service role key.
 * 
 * Usage:
 *   export SUPABASE_URL="https://<project>.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="service_role_key_here"
 *   export ADMIN_EMAIL="admin@municipality.gov.za"
 *   export ADMIN_PASSWORD="SecurePassword123!"
 *   export ADMIN_NAME="System Administrator"
 *   node create_admin.js
 * 
 * Or use dotenv:
 *   npm install dotenv
 *   node -r dotenv/config create_admin.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.gov.za'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'P@ssw0rd123!'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Site Admin'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Example:')
  console.error('  export SUPABASE_URL="https://your-project.supabase.co"')
  console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function createAdminUser() {
  console.log('🔧 SA Municipal Portal - Admin User Bootstrap')
  console.log('=' .repeat(60))
  console.log('Email:', ADMIN_EMAIL)
  console.log('Name:', ADMIN_NAME)
  console.log('=' .repeat(60))
  
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
      if (error.message.includes('already registered')) {
        console.error('❌ User already exists with this email')
        console.error('   Solution: Use a different email or delete the existing user')
        process.exit(1)
      }
      console.error('❌ Failed to create user:', error.message)
      process.exit(1)
    }

    const createdUser = data?.user || data
    const userId = createdUser?.id
    
    if (!userId) {
      console.error('❌ No user ID returned from auth creation')
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
      console.error('⚠️  IMPORTANT: Auth user created but KV profile failed!')
      console.error('   The user exists but won\'t have admin permissions.')
      console.error('   You may need to manually insert the KV record.')
      console.error('')
      console.error('   SQL to fix:')
      console.error(`   INSERT INTO kv_store_4c8674b4 (key, value) VALUES`)
      console.error(`   ('user_${userId}', '${JSON.stringify(kvRow.value)}'::jsonb)`)
      console.error(`   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`)
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
      console.error('   User may exist but authentication failed.')
      console.error('   Try resetting the password via Supabase Dashboard.')
    } else {
      const token = signInData?.session?.access_token
      console.log('✅ Sign-in successful!')
      console.log('   Access token:', token?.substring(0, 20) + '...')
    }

    // Step 4: Verify KV profile
    console.log('\n📝 Step 4: Verifying KV profile...')
    const { data: kvData, error: kvCheckError } = await supabase
      .from('kv_store_4c8674b4')
      .select('*')
      .eq('key', `user_${userId}`)
      .single()

    if (kvCheckError) {
      console.error('⚠️  Could not verify KV profile:', kvCheckError.message)
    } else {
      const role = kvData?.value?.role
      if (role === 'admin') {
        console.log('✅ KV profile verified - Role: admin')
      } else {
        console.error('❌ KV profile role mismatch - Found:', role, 'Expected: admin')
      }
    }

    // Success summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUCCESS! Admin user created successfully!')
    console.log('='.repeat(60))
    console.log('\n📋 Admin User Details:')
    console.log('   Email:', ADMIN_EMAIL)
    console.log('   Name:', ADMIN_NAME)
    console.log('   User ID:', userId)
    console.log('   Role: admin')
    console.log('   Municipality: Default Municipality')
    console.log('\n🔐 Next Steps:')
    console.log('   1. Open your municipal portal in a web browser')
    console.log('   2. Click "Sign In"')
    console.log('   3. Enter email:', ADMIN_EMAIL)
    console.log('   4. Enter the password you set')
    console.log('   5. You should see "Admin Panel" in the navigation')
    console.log('   6. Go to Admin Panel → Initialize Sample Data')
    console.log('\n💡 Creating Additional Admins:')
    console.log('   Once logged in as admin, you can create more admins via:')
    console.log('   Admin Panel → User Management → Create Admin User')
    console.log('\n⚠️  Security Reminders:')
    console.log('   ✓ Change the password after first login')
    console.log('   ✓ Never commit service role key to version control')
    console.log('   ✓ Use strong, unique passwords')
    console.log('   ✓ Limit the number of admin users')
    console.log('   ✓ Use official government email addresses')
    console.log('')

  } catch (err) {
    console.error('\n❌ Unexpected error:', err)
    console.error('Stack trace:', err.stack)
    process.exit(1)
  }
}

// Run the script
console.log('')
createAdminUser().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
