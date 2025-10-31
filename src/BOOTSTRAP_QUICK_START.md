# 🚀 Bootstrap Quick Start

## Create Your First Admin in 3 Steps

### Method 1: Web Interface (Easiest)

```
1. Open: /bootstrap-admin.html
2. Enter: Project ID + Anon Key + Admin Details  
3. Click: Create Admin User
```

### Method 2: Command Line

```bash
cd scripts
node bootstrap-admin.js
# Follow prompts
```

### Method 3: API Call

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4c8674b4/bootstrap-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"admin@example.com","password":"secure123","name":"Admin"}'
```

---

## Where to Find Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Settings → API
4. Copy:
   - **Project URL** → Extract project ID from URL
   - **anon/public key** → Use this as Anon Key

Example:
```
URL: https://abcdefghijklmnop.supabase.co
Project ID: abcdefghijklmnop

Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security Notes

✅ **SAFE TO USE**
- Bootstrap endpoint uses public anon key
- Self-locks after first admin created
- Can't create more admins via bootstrap

⚠️ **ONE-TIME ONLY**
- Only works when no admins exist
- After first admin: use admin panel
- Lost password? Reset database or contact support

---

## What Happens Next?

After bootstrap:
1. Login with your new admin credentials
2. Access the admin panel
3. Create additional users (billing officers, etc.)
4. Configure municipality settings
5. Start using the system!

---

## Need Help?

- Full Guide: [/BOOTSTRAP_GUIDE.md](./BOOTSTRAP_GUIDE.md)
- Scripts: [/scripts/README.md](./scripts/README.md)
- API Docs: [/README.md](./README.md)

---

**Remember**: Keep your admin password secure! 🔒
