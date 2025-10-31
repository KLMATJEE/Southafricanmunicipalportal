# 🚀 START HERE - Create Your Admin Account

## You're 3 Steps Away From Getting Started!

### Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Open your project
3. Click **Settings** → **API**
4. Find and copy:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`) → Your Project ID is `abcdefgh`
   - **anon / public** key (looks like: `eyJhbGciOiJIUz...`)

### Step 2: Open Bootstrap Tool

Click this file: **[bootstrap-admin.html](./bootstrap-admin.html)**

Or navigate to: `/bootstrap-admin.html`

### Step 3: Fill & Submit

1. Paste your Project ID
2. Paste your Anon Key
3. Enter your admin email, password, and name
4. Click "Create Admin User"

**Done!** 🎉

---

## What Happens Next?

After creating your admin account:

1. **You'll be redirected** to the login page
2. **Sign in** with your new admin credentials
3. **Access the admin panel** to manage the system
4. **Create more users** (billing officers, auditors, etc.)
5. **Start using the portal!**

---

## Need More Help?

### Quick Reference
📄 [BOOTSTRAP_QUICK_START.md](./BOOTSTRAP_QUICK_START.md) - 1-page guide

### Full Documentation
📚 [BOOTSTRAP_GUIDE.md](./BOOTSTRAP_GUIDE.md) - Complete instructions

### Technical Details
🔧 [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - What was fixed

### All Changes
📝 [CHANGES_APPLIED.md](./CHANGES_APPLIED.md) - Detailed changelog

---

## Alternative Methods

### Prefer Command Line?

```bash
cd scripts
node bootstrap-admin.js
```

### Want to Use API Directly?

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4c8674b4/bootstrap-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"admin@example.com","password":"secure123","name":"Admin"}'
```

---

## Important Notes

⚠️ **One-Time Process**
- Bootstrap only works ONCE (when no admin exists)
- After first admin: use admin panel to create more users

🔒 **Security**
- Use a strong password (12+ characters recommended)
- Keep your admin credentials secure
- Bootstrap endpoint automatically locks after first use

✅ **Safe to Use**
- Uses public anon key (not service role key)
- Self-locking after first admin
- Cannot be misused once admin exists

---

## Troubleshooting

### "Admin already exists"
✅ Good! Someone already bootstrapped the admin.  
→ Login with existing credentials or contact your administrator

### "Invalid credentials"
❌ Project ID or Anon Key is wrong  
→ Double-check in Supabase Dashboard → Settings → API

### "Network error"
❌ Can't reach Supabase  
→ Check internet connection and verify project is active

---

## That's It!

**Ready?** Open [bootstrap-admin.html](./bootstrap-admin.html) and create your admin! 🚀

---

Questions? Check the [BOOTSTRAP_GUIDE.md](./BOOTSTRAP_GUIDE.md) for answers.
