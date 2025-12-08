# Bootstrap Admin User Guide

## Overview

This guide explains how to create the first admin user in your SA Municipal Portal system. The bootstrap process is a one-time operation that creates the initial administrator account.

## Prerequisites

Before bootstrapping, you need:
1. **Supabase Project ID** - Found in your Supabase project settings
2. **Supabase Anon Key** - Found in your Supabase project settings under API

## Method 1: HTML Interface (Recommended)

The easiest way to create the first admin user is through the web interface.

### Steps:

1. **Open the Bootstrap Page**
   - Navigate to `/bootstrap-admin.html` in your browser
   - Or access it directly: `https://your-domain.com/bootstrap-admin.html`

2. **Enter Supabase Credentials**
   - Project ID: Your Supabase project identifier
   - Anon Key: Your public anonymous key (safe to use client-side)

3. **Enter Admin Details**
   - Email: A valid email address for the admin
   - Password: Minimum 6 characters (use a strong password)
   - Name: Full name of the administrator

4. **Submit**
   - Click "Create Admin User"
   - Wait for confirmation
   - You'll be automatically redirected to login

### Features:
- ✅ Saves your Supabase credentials in browser for convenience
- ✅ Client-side validation
- ✅ Clear error messages
- ✅ Auto-redirect after success

## Method 2: Node.js Script

If you prefer command-line tools, use the Node.js bootstrap script.

### Steps:

1. **Navigate to scripts directory**
   ```bash
   cd scripts
   ```

2. **Install dependencies (if not already installed)**
   ```bash
   npm install
   ```

3. **Run the bootstrap script**
   ```bash
   node bootstrap-admin.js
   ```

4. **Follow the prompts**
   - Enter your Supabase Project ID
   - Enter your Supabase Anon Key
   - Enter admin email, password, and name

### Alternative: Using Environment Variables

You can set environment variables to avoid entering credentials each time:

```bash
export SUPABASE_PROJECT_ID=your_project_id
export SUPABASE_ANON_KEY=your_anon_key
node bootstrap-admin.js
```

## Method 3: Direct API Call

For advanced users or automation, you can call the bootstrap endpoint directly.

### Using cURL:

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4c8674b4/bootstrap-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "name": "Admin Name"
  }'
```

### Using JavaScript:

```javascript
const response = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4c8674b4/bootstrap-admin',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_ANON_KEY'
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'securepassword',
      name: 'Admin Name'
    })
  }
);

const data = await response.json();
console.log(data);
```

## Security Notes

### Bootstrap Endpoint Protection

The `/bootstrap-admin` endpoint has built-in security:

1. **One-Time Use**: Only works when NO admin users exist in the system
2. **Automatic Lockout**: Once an admin exists, the endpoint returns a 403 error
3. **No Authentication Required**: For first admin only (can't be used maliciously after admin exists)

### After Bootstrap

Once the first admin is created:
- ❌ The bootstrap endpoint becomes disabled
- ✅ Use the admin panel to create additional users
- ✅ All user creation requires admin authentication
- ✅ Full audit logging is enabled

## What Happens During Bootstrap?

1. **Validation**: System checks if any admin users exist
2. **User Creation**: Creates Supabase auth user with admin metadata
3. **Profile Creation**: Stores user profile in KV store with role='admin'
4. **Confirmation**: Returns success with user details

## Troubleshooting

### Error: "Admin already exists"

**Cause**: An admin user has already been created.

**Solution**: 
- Login with existing admin credentials
- Use the admin panel to create additional users
- If you've lost admin credentials, contact support or reset database

### Error: "Invalid credentials"

**Cause**: Incorrect Supabase Project ID or Anon Key.

**Solution**:
- Verify credentials in Supabase Dashboard
- Go to Project Settings → API
- Copy the exact values (no extra spaces)

### Error: "Network error"

**Cause**: Cannot reach Supabase servers.

**Solution**:
- Check internet connection
- Verify Supabase project is not paused
- Check project URL format: `https://[project-id].supabase.co`

### Error: "Password must be at least 6 characters"

**Cause**: Password too short.

**Solution**: Use a password with minimum 6 characters (recommend 12+ with mixed characters)

## Next Steps

After creating the admin user:

1. **Login** - Use the credentials you just created
2. **Explore Admin Panel** - Access all administrative features
3. **Create Additional Users** - Add billing officers, auditors, supervisors
4. **Configure Settings** - Set up municipality details
5. **Import Data** - Add citizens, generate bills, etc.

## Production Best Practices

### Secure Password Requirements

For production deployments, enforce strong passwords:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words
- Use a password manager

### Admin Account Management

1. **Create Multiple Admins**: Don't rely on a single admin account
2. **Document Credentials Securely**: Use encrypted storage
3. **Regular Audits**: Review admin access logs
4. **Enable 2FA**: Add two-factor authentication (if available)
5. **Rotate Passwords**: Change admin passwords quarterly

### Deployment Checklist

Before going live:
- [ ] Bootstrap admin created
- [ ] Admin credentials documented securely
- [ ] Additional admin users created
- [ ] Test all role permissions
- [ ] Review audit log functionality
- [ ] Configure email notifications
- [ ] Set up backup admin accounts

## Support

If you encounter issues:

1. **Check Logs**: View browser console for detailed errors
2. **Verify Setup**: Ensure Supabase project is properly configured
3. **Review Documentation**: Check Supabase and system docs
4. **Contact Support**: Reach out with specific error messages

## Related Documentation

- [Admin Panel Guide](./ADMIN_SETUP_COMPLETE.md)
- [User Management Guide](./NEW_FEATURES_GUIDE.md)
- [API Reference](./README.md)
- [Security Best Practices](./IMPLEMENTATION_COMPLETE.md)

---

**Important**: Keep your admin credentials secure and never share them publicly. The bootstrap endpoint is designed for initial setup only and becomes disabled after the first admin is created.
