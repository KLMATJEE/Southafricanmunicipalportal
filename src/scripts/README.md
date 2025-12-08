# Admin Bootstrap Scripts

This directory contains scripts to create the first admin user for the SA Municipal Portal.

## ⚠️ IMPORTANT UPDATE

**The system now uses a secure bootstrap endpoint that only requires your Supabase ANON KEY (public key), not the service role key.**

## Recommended Method: Web Interface

The easiest way to create your first admin user is through the web interface:

1. Open `/bootstrap-admin.html` in your browser
2. Enter your Supabase Project ID and Anon Key
3. Enter admin details (email, password, name)
4. Click "Create Admin User"

**Benefits:**
- ✅ No command line needed
- ✅ Uses public anon key (safe)
- ✅ Saves credentials for convenience
- ✅ Visual feedback and error handling

## Alternative: Node.js Script

Run the interactive Node.js script:

```bash
cd scripts
node bootstrap-admin.js
```

The script will prompt you for:
- Supabase Project ID
- Supabase Anon Key
- Admin email, password, and name

### Using Environment Variables

```bash
export SUPABASE_PROJECT_ID="your-project-id"
export SUPABASE_ANON_KEY="your-anon-key"
node bootstrap-admin.js
```

## Files

- `bootstrap-admin.js` - Interactive Node.js bootstrap script (NEW)
- `create_admin.js` - Legacy admin creation script (deprecated)
- `create_admin.sh` - Legacy bash script (deprecated)
- `package.json` - Node.js dependencies
- `README.md` - This file

## How It Works

The bootstrap endpoint (`/bootstrap-admin`):
1. ✅ Only works when NO admin users exist
2. ✅ Creates the first admin user
3. ✅ Automatically locks itself after first admin is created
4. ✅ Uses public anon key (not service role key)
5. ✅ Full audit logging enabled

After creating the first admin:
- Use the admin panel to create additional users
- The bootstrap endpoint becomes disabled
- All user creation requires admin authentication

## Security

✅ **SAFE**: 
- Uses public Supabase anon key
- Bootstrap endpoint self-locks after first admin
- Can't be misused once admin exists

⚠️ **IMPORTANT**: 
- Use strong passwords (12+ characters)
- Keep admin credentials secure
- Never share admin passwords
- Document credentials in secure storage

## Troubleshooting

### "Admin already exists"
An admin has been created. Login with existing credentials or use admin panel to create users.

### "Invalid credentials"
Check your Supabase Project ID and Anon Key in Supabase Dashboard → Settings → API

### "Network error"
Verify internet connection and Supabase project is not paused.

## Complete Documentation

See `/BOOTSTRAP_GUIDE.md` for comprehensive documentation including:
- Step-by-step instructions
- API usage examples
- Security best practices
- Production deployment checklist
