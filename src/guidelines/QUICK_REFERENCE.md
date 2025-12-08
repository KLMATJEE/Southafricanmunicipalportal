# 📚 Quick Reference Guide - SA Municipal Portal

## 🎯 One-Page Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                     │
│  - Multilingual (5 languages)                                │
│  - Offline-first with sync                                   │
│  - Mobile-responsive design                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Supabase + Deno Edge)                  │
│  - JWT Authentication                                        │
│  - Role-based Access Control                                │
│  - Audit Logging                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Database (PostgreSQL + KV)                    │
│  - kv_store_4c8674b4 table                                  │
│  - Auth users                                               │
│  - File storage buckets                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Admin Bootstrap (FIRST STEP!)

### Prerequisites
```bash
# Required environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=admin@municipality.gov.za
ADMIN_PASSWORD=SecurePassword123!
ADMIN_NAME=System Administrator
```

### Quick Commands

**Node.js (Recommended):**
```bash
cd scripts && npm install && npm run create-admin:env
```

**Bash:**
```bash
cd scripts && chmod +x create_admin.sh && ./create_admin.sh
```

**Manual SQL (Emergency):**
```sql
-- Step 1: Get user ID from Supabase Auth Dashboard
-- Step 2: Run this SQL
INSERT INTO kv_store_4c8674b4 (key, value) VALUES
('user_YOUR_USER_ID', '{
  "id": "YOUR_USER_ID",
  "email": "admin@municipality.gov.za",
  "name": "System Administrator",
  "role": "admin",
  "municipality": "Default Municipality",
  "createdAt": "2025-10-31T12:00:00Z"
}'::jsonb);
```

---

## 🌐 Language Support

| Code | Language   | Coverage |
|------|------------|----------|
| en   | English    | 100%     |
| zu   | isiZulu    | 100%     |
| xh   | isiXhosa   | 100%     |
| st   | Sesotho    | 100%     |
| af   | Afrikaans  | 100%     |

**Switch Language:**
- Click globe icon (🌐) in header
- Selection persists in localStorage
- Instant UI update

---

## 👥 User Roles & Permissions

| Role              | Create | View Bills | Admin Panel | Audit Logs | Create Polls | Manage Users |
|-------------------|--------|------------|-------------|------------|--------------|--------------|
| **citizen**       | ✅     | Own only   | ❌          | ❌         | ❌           | ❌           |
| **billing_officer**| ❌    | All        | ✅          | ❌         | ❌           | ❌           |
| **auditor**       | ❌     | All        | ✅          | ✅         | ❌           | ❌           |
| **supervisor**    | ✅     | All        | ✅          | ✅         | ✅           | ❌           |
| **admin**         | ✅     | All        | ✅          | ✅         | ✅           | ✅           |

---

## 🔌 API Endpoints

### Authentication
```
POST /signup                  - Create citizen account
POST /create-admin            - Create admin (requires admin)
GET  /user-profile            - Get current user profile
```

### Billing
```
GET  /bills                   - List bills
POST /generate-bill           - Create new bill (admin)
POST /payments                - Make payment
GET  /payments                - List payments
```

### Issues
```
GET  /issues                  - List issues
POST /issues                  - Create issue
POST /issues/:id/update       - Update issue (admin)
```

### E-Participation
```
GET  /forums                  - List discussions
POST /forums                  - Create discussion
GET  /polls                   - List polls
POST /polls                   - Create poll (admin)
POST /polls/:id/vote          - Vote on poll
GET  /feedback                - List feedback
POST /feedback                - Submit feedback
```

### Procurement
```
GET  /tenders                 - List tenders
POST /tenders                 - Create tender (admin)
GET  /suppliers               - List suppliers
POST /suppliers               - Register supplier (admin)
GET  /contracts               - List contracts
POST /contracts               - Create contract (admin)
```

### System
```
GET  /audit-logs              - View audit logs (auditor)
GET  /public-stats            - Public statistics
GET  /transaction-fees        - Fee analytics (admin)
GET  /notifications           - User notifications
POST /notifications/:id/read  - Mark as read
```

---

## 📱 Feature Map

### Unified Service Portal
**Location:** Services tab (main navigation)
**Features:**
- Quick stats dashboard
- Fast access cards (Bills, Issues, Participation, Procurement)
- Recent activity feed
- Mobile-optimized tabs

### E-Participation
**Location:** Participation tab
**Features:**
- Forums/Discussions (community-driven)
- Polls (vote on priorities)
- Feedback (direct to municipality)

### Procurement Transparency
**Location:** Procurement tab
**Features:**
- Tenders (active bids with deadlines)
- Suppliers (directory with ratings)
- Contracts (progress tracking)

### Offline Sync
**Location:** Bottom-right indicator (automatic)
**Features:**
- Auto-detect online/offline
- Queue actions locally
- Auto-sync when online
- Manual sync button

---

## 🛠️ Common Tasks

### Initialize Sample Data
1. Sign in as admin
2. Go to Admin Panel
3. Look for "Demo Data Initializer" card
4. Click "Initialize Sample Data"
5. Wait for success message
6. Browse new discussions, polls, tenders

### Create Additional Admin
1. Sign in as existing admin
2. Admin Panel → User Management tab
3. Click "Create Admin User"
4. Fill form (email, password, name, role)
5. Submit

### Generate Bill for Citizen
1. Sign in as billing_officer or admin
2. Admin Panel → Billing tab
3. Click "Generate Bill"
4. Enter citizen ID (user's ID)
5. Add services with amounts
6. Set due date
7. Submit

### Update Issue Status
1. Sign in as admin/supervisor
2. Admin Panel → Issue Management tab
3. Find issue in list
4. Click "Update Status"
5. Select new status
6. Add message for citizen
7. Submit

### Create Poll
1. Sign in as admin/supervisor
2. Participation → Polls tab
3. Click "New Poll"
4. Enter question
5. Add options (2-4)
6. Set end date
7. Submit

### Create Tender
1. Sign in as admin/supervisor
2. Procurement → Tenders tab
3. Click "Create Tender" (admin only)
4. Fill details (number, title, category, value, deadline)
5. Submit

---

## 🐛 Troubleshooting

### "Admin Panel not showing"
**Cause:** User role is not admin
**Fix:** Check KV profile:
```sql
SELECT value->>'role' FROM kv_store_4c8674b4 
WHERE key = 'user_YOUR_USER_ID';
```

### "Actions not syncing offline"
**Cause:** LocalStorage full or browser doesn't support
**Fix:** 
1. Clear browser cache
2. Check browser console for errors
3. Try manual sync button

### "Can't create poll/tender"
**Cause:** Insufficient permissions
**Fix:** Only admin/supervisor can create. Check role.

### "Language not changing"
**Cause:** JavaScript disabled or cache issue
**Fix:**
1. Enable JavaScript
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R)

### "Sample data not loading"
**Cause:** Permission denied or network error
**Fix:**
1. Ensure logged in as admin
2. Check browser console for errors
3. Verify backend is running

---

## 📊 Database Schema

### kv_store_4c8674b4 Table
```typescript
{
  key: string              // Primary key
  value: jsonb             // Flexible JSON data
  created_at: timestamp    // Auto-generated
  updated_at: timestamp    // Auto-updated
}
```

### Common Key Patterns
```
user_{userId}                      - User profiles
bill_{citizenId}_{timestamp}       - Bills
payment_{userId}_{timestamp}       - Payments
issue_{userId}_{timestamp}         - Issues
forum_{timestamp}_{random}         - Discussions
poll_{timestamp}_{random}          - Polls
feedback_{userId}_{timestamp}      - Feedback
tender_{timestamp}_{random}        - Tenders
supplier_{timestamp}_{random}      - Suppliers
contract_{timestamp}_{random}      - Contracts
audit_{timestamp}_{random}         - Audit logs
transaction_fee_{timestamp}        - Fee records
notification_{userId}_{timestamp}  - Notifications
```

---

## 🔧 Environment Variables

### Required (Backend)
```env
SUPABASE_URL                    # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY       # Service role key (SECRET!)
SUPABASE_ANON_KEY              # Public anon key
SUPABASE_DB_URL                # Database connection string
```

### Optional (Frontend)
```env
VITE_GOOGLE_MAPS_API_KEY       # For maps in issue reporting
```

---

## 📦 File Structure Overview

```
/
├── App.tsx                     # Main app component
├── components/                 # React components
│   ├── UnifiedServicePortal.tsx
│   ├── EParticipationTools.tsx
│   ├── ProcurementTransparency.tsx
│   ├── OfflineSyncIndicator.tsx
│   ├── LanguageSelector.tsx
│   ├── FeatureTour.tsx
│   └── ui/                     # ShadCN components
├── utils/
│   ├── api.ts                  # API client
│   ├── translations.ts         # i18n system
│   └── offlineSync.ts          # Offline sync engine
├── supabase/functions/server/
│   └── index.tsx               # Backend server
├── scripts/
│   ├── create_admin.js         # Node.js bootstrap
│   └── create_admin.sh         # Bash bootstrap
├── ADMIN_BOOTSTRAP_GUIDE.md    # Admin setup guide
├── NEW_FEATURES_GUIDE.md       # Feature documentation
└── IMPLEMENTATION_COMPLETE.md  # Technical summary
```

---

## 🎯 Testing Checklist

- [ ] Admin bootstrap works
- [ ] Can sign in with admin account
- [ ] Admin Panel visible
- [ ] Sample data initializes
- [ ] Language switcher works
- [ ] Bills display correctly
- [ ] Issues can be reported
- [ ] Can create discussion
- [ ] Can vote on poll
- [ ] Can submit feedback
- [ ] Tenders are visible
- [ ] Offline mode works
- [ ] Actions sync when online
- [ ] Mobile layout responsive

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Admin Bootstrap | `/ADMIN_BOOTSTRAP_GUIDE.md` |
| Feature Guide | `/NEW_FEATURES_GUIDE.md` |
| Implementation Details | `/IMPLEMENTATION_COMPLETE.md` |
| Quick Reference | `/QUICK_REFERENCE.md` (this file) |
| Scripts | `/scripts/` directory |

---

## 🚦 Status Indicators

### User Status Badges
- 🟢 **Active** - Account in good standing
- 🟡 **Pending** - Email confirmation needed
- 🔴 **Suspended** - Account locked

### Bill Status
- 🔵 **Pending** - Awaiting payment
- 🟢 **Paid** - Payment received
- 🔴 **Overdue** - Past due date

### Issue Status
- 🟡 **Open** - Newly reported
- 🔵 **In Progress** - Being addressed
- 🟢 **Resolved** - Completed
- 🔴 **Closed** - No action taken

### Tender Status
- 🟢 **Active** - Currently accepting bids
- 🟡 **Closed** - Deadline passed
- 🔵 **Awarded** - Contract awarded

---

## 💡 Pro Tips

1. **Use Sample Data** - Initialize demo data to test features
2. **Check Offline Indicator** - Bottom-right shows sync status
3. **Feature Tour** - Click (?) button to replay onboarding
4. **Language Switching** - Changes apply immediately
5. **Mobile Testing** - Portal is fully responsive
6. **Admin Creation** - Use scripts, not manual SQL
7. **Security First** - Never commit service role keys
8. **Audit Logging** - All admin actions are logged
9. **Regular Backups** - Export audit logs regularly
10. **User Training** - Share NEW_FEATURES_GUIDE.md with users

---

## 🎓 Learning Path

### For New Administrators
1. Read ADMIN_BOOTSTRAP_GUIDE.md
2. Create first admin account
3. Sign in and explore Admin Panel
4. Initialize sample data
5. Test each feature
6. Read NEW_FEATURES_GUIDE.md
7. Create additional users

### For Developers
1. Review file structure
2. Understand auth flow
3. Study API endpoints
4. Check offline sync logic
5. Review translation system
6. Examine component structure
7. Read IMPLEMENTATION_COMPLETE.md

### For Citizens
1. Sign up for account
2. Complete feature tour
3. Switch to preferred language
4. View bills and issues
5. Join community discussions
6. Vote on polls
7. Submit feedback

---

*Last Updated: 2025-10-31*  
*Version: 2.0.0*  
*Maintained by: SA Municipal Portal Team*
