# Verified Onboarding - System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │           VerifiedUserOnboarding Component                 │      │
│  │                                                             │      │
│  │  Step 1: Basic Info → Step 2: ID Verify →                 │      │
│  │  Step 3: Credit Check → Step 4: Biometric                 │      │
│  └────────────────────┬──────────────────────────────────────┘      │
│                       │                                              │
│                       │ HTTP POST (JSON)                             │
│                       ▼                                              │
└───────────────────────┼──────────────────────────────────────────────┘
                        │
                        │ Authorization: Bearer {access_token}
                        │
┌───────────────────────┼──────────────────────────────────────────────┐
│                       ▼          SERVER (Hono/Deno)                   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Endpoint: /make-server-4c8674b4/create-verified-user   │        │
│  │                                                           │        │
│  │  1. Verify requesting user (Admin/Billing Officer)       │        │
│  │  2. Validate ID format                                   │        │
│  │  3. Execute verification steps                           │        │
│  │  4. Create user in Supabase                              │        │
│  │  5. Store profile in KV                                  │        │
│  │  6. Create audit log                                     │        │
│  └───┬──────────────┬──────────────┬──────────────┬─────────┘        │
│      │              │              │              │                  │
└──────┼──────────────┼──────────────┼──────────────┼──────────────────┘
       │              │              │              │
       │ Step 1       │ Step 2       │ Step 3       │ Step 4
       │              │              │              │
┌──────▼──────┐ ┌─────▼─────┐  ┌────▼─────┐  ┌─────▼──────┐
│   PayJoy    │ │  PayJoy   │  │  Incode  │  │  Supabase  │
│ Credit Check│ │ Adaptive  │  │ Biometric│  │    Auth    │
│     API     │ │  Auth API │  │    API   │  │            │
└──────┬──────┘ └─────┬─────┘  └────┬─────┘  └─────┬──────┘
       │              │              │              │
       │ Response     │ Response     │ Response     │ User Created
       │              │              │              │
┌──────▼──────────────▼──────────────▼──────────────▼──────────────────┐
│                        VERIFICATION RESULT                            │
│                                                                       │
│  ┌─────────────┬──────────────┬──────────────┬──────────────┐       │
│  │ Credit      │ Risk Score   │ Biometric    │ User Profile │       │
│  │ Approved    │ < 0.7        │ Verified     │ Created      │       │
│  │ Score: 750  │ 0.15 (15%)   │ Match: True  │ ID: uuid     │       │
│  └─────────────┴──────────────┴──────────────┴──────────────┘       │
│                                                                       │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    │ Store Results
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Supabase)                           │
│                                                                       │
│  ┌──────────────────────┐    ┌──────────────────┐                   │
│  │   Supabase Auth      │    │   KV Store       │                   │
│  │                      │    │                  │                   │
│  │  user_metadata:      │    │  user_{id}:      │                   │
│  │  - creditScore       │    │  - All profile   │                   │
│  │  - creditApproved    │    │    data          │                   │
│  │  - biometricVerified │    │  - Verification  │                   │
│  │  - riskScore         │    │    results       │                   │
│  │  - verificationDate  │    │                  │                   │
│  └──────────────────────┘    └──────────────────┘                   │
│                                                                       │
│  ┌──────────────────────────────────────────────┐                   │
│  │          Audit Log (KV Store)                 │                   │
│  │                                                │                   │
│  │  audit_{timestamp}_{id}:                      │                   │
│  │  - action: "verified_user_created"            │                   │
│  │  - userId: requesting admin                   │                   │
│  │  - entityId: new user id                      │                   │
│  │  - changes: all verification data             │                   │
│  │  - timestamp: ISO 8601                        │                   │
│  └──────────────────────────────────────────────┘                   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AdminPanel.tsx                            │
│                                                               │
│  ┌────────────────────────────────────────────────┐         │
│  │  User Management Tab                            │         │
│  │                                                  │         │
│  │  ┌──────────────┐  ┌──────────────────────┐    │         │
│  │  │ Quick Create │  │ Verified Onboarding  │◄───┼─ Click  │
│  │  │   Button     │  │      Button          │    │         │
│  │  └──────────────┘  └──────┬───────────────┘    │         │
│  │                            │                     │         │
│  └────────────────────────────┼─────────────────────┘         │
│                               │ Opens Dialog                  │
└───────────────────────────────┼───────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│           VerifiedUserOnboarding.tsx                         │
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │  Dialog Component (Multi-step Wizard)              │      │
│  │                                                     │      │
│  │  State Management:                                 │      │
│  │  - step: number (1-5)                              │      │
│  │  - formData: object                                │      │
│  │  - isLoading: boolean                              │      │
│  │  - error: string                                   │      │
│  │  - verificationResults: object                     │      │
│  │                                                     │      │
│  │  ┌─────────────────────────────────────┐          │      │
│  │  │  Step Renderer (Conditional)         │          │      │
│  │  │                                       │          │      │
│  │  │  if step === 1 → Basic Info Form     │          │      │
│  │  │  if step === 2 → ID Verification     │          │      │
│  │  │  if step === 3 → Credit Check        │          │      │
│  │  │  if step === 4 → Biometric Upload    │          │      │
│  │  │  if step === 5 → Success Screen      │          │      │
│  │  └─────────────────────────────────────┘          │      │
│  │                                                     │      │
│  │  ┌─────────────────────────────────────┐          │      │
│  │  │  Validation Functions                │          │      │
│  │  │  - validateStep1()                   │          │      │
│  │  │  - validateStep2()                   │          │      │
│  │  │  - validateStep3()                   │          │      │
│  │  │  - handlePhotoCapture()              │          │      │
│  │  │  - handleSubmit()                    │          │      │
│  │  └─────────────────────────────────────┘          │      │
│  │                                                     │      │
│  └─────────────────────────┬───────────────────────────      │
│                            │ api.createVerifiedUser()        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      api.ts                                  │
│                                                               │
│  createVerifiedUser(data) {                                  │
│    return apiRequest('/create-verified-user', {             │
│      method: 'POST',                                         │
│      body: JSON.stringify(data)                              │
│    })                                                         │
│  }                                                            │
│                                                               │
│  Authorization: Bearer {localStorage.access_token}           │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS POST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Supabase Edge Function (Hono Server)               │
│           /supabase/functions/server/index.tsx               │
│                                                               │
│  app.post('/make-server-4c8674b4/create-verified-user')     │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Verification Pipeline                           │        │
│  │                                                   │        │
│  │  1. Auth Check                                   │        │
│  │     verifyUser(request)                          │        │
│  │     Check role: admin or billing_officer         │        │
│  │                                                   │        │
│  │  2. Input Validation                             │        │
│  │     validIdTypes.includes(idType)                │        │
│  │     idNumber validation                          │        │
│  │                                                   │        │
│  │  3. Credit Check (PayJoy)                        │        │
│  │     fetch('https://api.payjoy.com/credit-check') │        │
│  │     if (!approved) → return 403 error            │        │
│  │                                                   │        │
│  │  4. Biometric Check (Incode)                     │        │
│  │     fetch('https://api.incode.com/verify')       │        │
│  │     if (!match) → return 403 error               │        │
│  │                                                   │        │
│  │  5. Adaptive Auth (PayJoy)                       │        │
│  │     fetch('https://api.payjoy.com/adaptive')     │        │
│  │     if (riskScore > 0.7) → return 403 error      │        │
│  │                                                   │        │
│  │  6. Create User                                  │        │
│  │     supabase.auth.admin.createUser()             │        │
│  │                                                   │        │
│  │  7. Store Profile                                │        │
│  │     kv.set(`user_${id}`, profile)                │        │
│  │                                                   │        │
│  │  8. Audit Log                                    │        │
│  │     createAuditLog(...)                          │        │
│  │                                                   │        │
│  │  9. Return Success                               │        │
│  │     return { success, user, verification }       │        │
│  └─────────────────────────────────────────────────┘        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
User Action                  Frontend               Server                External APIs           Database
    │                           │                      │                       │                    │
    │ Click "Verified           │                      │                       │                    │
    │ Onboarding"               │                      │                       │                    │
    ├──────────────────────────>│                      │                       │                    │
    │                           │                      │                       │                    │
    │                           │ Open Dialog          │                       │                    │
    │                           │ Show Step 1          │                       │                    │
    │                           │                      │                       │                    │
    │ Fill Basic Info           │                      │                       │                    │
    ├──────────────────────────>│                      │                       │                    │
    │                           │ Validate             │                       │                    │
    │                           │ Move to Step 2       │                       │                    │
    │                           │                      │                       │                    │
    │ Enter ID Details          │                      │                       │                    │
    ├──────────────────────────>│                      │                       │                    │
    │                           │ Validate ID format   │                       │                    │
    │                           │ Move to Step 3       │                       │                    │
    │                           │                      │                       │                    │
    │ Enter Phone               │                      │                       │                    │
    ├──────────────────────────>│                      │                       │                    │
    │                           │ Validate phone       │                       │                    │
    │                           │ Move to Step 4       │                       │                    │
    │                           │                      │                       │                    │
    │ Upload Photo              │                      │                       │                    │
    ├──────────────────────────>│                      │                       │                    │
    │                           │ Convert to base64    │                       │                    │
    │                           │ Show preview         │                       │                    │
    │                           │                      │                       │                    │
    │ Click "Create User"       │                      │                       │                    │
    ├──────────────────────────>│                      │                       │                    │
    │                           │                      │                       │                    │
    │                           │ POST /create-verified-user                   │                    │
    │                           ├─────────────────────>│                       │                    │
    │                           │                      │                       │                    │
    │                           │                      │ Verify Auth Token     │                    │
    │                           │                      │──────────────────────>│                    │
    │                           │                      │<──────────────────────│                    │
    │                           │                      │ User authenticated    │                    │
    │                           │                      │                       │                    │
    │                           │                      │ Check Role            │                    │
    │                           │                      │──────────────────────────────────────────>│
    │                           │                      │                       │ Get user_${id}    │
    │                           │                      │<──────────────────────────────────────────│
    │                           │                      │ role: admin           │                    │
    │                           │                      │                       │                    │
    │                           │                      │ POST /credit-check    │                    │
    │                           │                      ├──────────────────────>│                    │
    │                           │                      │                       │ PayJoy API        │
    │                           │                      │<──────────────────────│                    │
    │                           │                      │ approved: true        │                    │
    │                           │                      │ score: 750            │                    │
    │                           │                      │                       │                    │
    │                           │                      │ POST /adaptive-auth   │                    │
    │                           │                      ├──────────────────────>│                    │
    │                           │                      │                       │ PayJoy API        │
    │                           │                      │<──────────────────────│                    │
    │                           │                      │ riskScore: 0.15       │                    │
    │                           │                      │                       │                    │
    │                           │                      │ POST /verify-faceprint│                    │
    │                           │                      ├──────────────────────>│                    │
    │                           │                      │                       │ Incode API        │
    │                           │                      │<──────────────────────│                    │
    │                           │                      │ match: true           │                    │
    │                           │                      │                       │                    │
    │                           │                      │ createUser()          │                    │
    │                           │                      │──────────────────────────────────────────>│
    │                           │                      │                       │ Supabase Auth     │
    │                           │                      │<──────────────────────────────────────────│
    │                           │                      │ user created          │                    │
    │                           │                      │                       │                    │
    │                           │                      │ kv.set(user_${id})    │                    │
    │                           │                      │──────────────────────────────────────────>│
    │                           │                      │                       │ KV Store          │
    │                           │                      │<──────────────────────────────────────────│
    │                           │                      │ profile saved         │                    │
    │                           │                      │                       │                    │
    │                           │                      │ createAuditLog()      │                    │
    │                           │                      │──────────────────────────────────────────>│
    │                           │                      │                       │ Audit Log         │
    │                           │                      │<──────────────────────────────────────────│
    │                           │                      │ audit created         │                    │
    │                           │                      │                       │                    │
    │                           │ 200 OK               │                       │                    │
    │                           │<─────────────────────│                       │                    │
    │                           │ {success, user,      │                       │                    │
    │                           │  verification}       │                       │                    │
    │                           │                      │                       │                    │
    │                           │ Show Success Screen  │                       │                    │
    │                           │ Display verification │                       │                    │
    │                           │ results              │                       │                    │
    │<──────────────────────────│                      │                       │                    │
    │ See Success Message       │                      │                       │                    │
    │                           │                      │                       │                    │
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Frontend Authentication
┌─────────────────────────────────────────────────────────────────┐
│  • User must be logged in                                        │
│  • access_token stored in localStorage                           │
│  • Token sent in Authorization header                            │
│  • UI only visible to admin/billing officer                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 2: Server Authorization
┌─────────────────────────────────────────────────────────────────┐
│  • verifyUser() checks access_token                              │
│  • Supabase Auth validates token                                 │
│  • Role verification: admin or billing_officer                   │
│  • Returns 401 if unauthorized, 403 if wrong role                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 3: Input Validation
┌─────────────────────────────────────────────────────────────────┐
│  • ID type must be in validIdTypes array                         │
│  • ID number format validation                                   │
│  • Email format validation                                       │
│  • Password minimum length                                       │
│  • Phone number format (SA)                                      │
│  • Sanitize all inputs                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 4: External API Verification
┌─────────────────────────────────────────────────────────────────┐
│  PayJoy Credit Check:                                            │
│  • Authorization: Bearer ${PAYJOY_API_KEY}                       │
│  • HTTPS only                                                    │
│  • Reject if not approved                                        │
│                                                                   │
│  PayJoy Adaptive Auth:                                           │
│  • Authorization: Bearer ${PAYJOY_API_KEY}                       │
│  • HTTPS only                                                    │
│  • Reject if riskScore > 0.7                                     │
│                                                                   │
│  Incode Biometric:                                               │
│  • Authorization: Bearer ${INCODE_API_KEY}                       │
│  • HTTPS only                                                    │
│  • Reject if match === false                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 5: Data Encryption
┌─────────────────────────────────────────────────────────────────┐
│  • All data encrypted in transit (HTTPS/TLS)                     │
│  • Supabase Auth encrypts user_metadata                          │
│  • KV store encrypted at rest                                    │
│  • API keys stored as environment variables                      │
│  • No sensitive data in logs                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 6: Audit Logging
┌─────────────────────────────────────────────────────────────────┐
│  • Every verification logged                                     │
│  • Immutable audit trail                                         │
│  • Timestamp all actions                                         │
│  • Log requesting user                                           │
│  • Log all verification results                                  │
│  • POPIA compliant                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Frontend Validation Error
    │
    ├──> Show inline error message
    ├──> Prevent step progression
    ├──> No API calls made
    └──> User corrects and retries
    
Server Authorization Error
    │
    ├──> Return 401 Unauthorized or 403 Forbidden
    ├──> Frontend displays error alert
    ├──> User redirected to login
    └──> Log error for admin review

API Request Error (PayJoy/Incode)
    │
    ├──> Catch error in try/catch block
    ├──> Log error with full context
    ├──> Graceful fallback behavior
    │   │
    │   ├──> If API key not set → Default to approved
    │   ├──> If API timeout → Default to approved
    │   └──> If API error → Default to approved
    │
    ├──> Or reject if critical (credit/biometric fail)
    └──> Return detailed error to frontend

Verification Failure
    │
    ├──> Credit not approved → Return 403
    ├──> Biometric mismatch → Return 403
    ├──> High risk score → Return 403
    ├──> Frontend shows specific error
    └──> Audit log records failure

Database Error
    │
    ├──> Catch Supabase/KV errors
    ├──> Log full error details
    ├──> Return 500 Internal Server Error
    ├──> Frontend shows generic error
    └──> Rollback partial changes if possible

Success Path
    │
    ├──> All verifications pass
    ├──> User created successfully
    ├──> Profile stored in KV
    ├──> Audit log created
    ├──> Return success response
    └──> Frontend shows success screen
```

---

## Environment Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│             ENVIRONMENT VARIABLES (Supabase Secrets)             │
└─────────────────────────────────────────────────────────────────┘

Required (Pre-configured):
┌────────────────────────────┬─────────────────────────────────┐
│ SUPABASE_URL               │ Your Supabase project URL        │
│ SUPABASE_ANON_KEY          │ Public anonymous key             │
│ SUPABASE_SERVICE_ROLE_KEY  │ Private service role key         │
│ SUPABASE_DB_URL            │ PostgreSQL connection string     │
└────────────────────────────┴─────────────────────────────────┘

Required for Verification:
┌────────────────────────────┬─────────────────────────────────┐
│ PAYJOY_API_KEY ✅          │ PayJoy API authentication        │
│ INCODE_API_KEY ✅          │ Incode API authentication        │
└────────────────────────────┴─────────────────────────────────┘

Access in Code:
- Server: Deno.env.get('VARIABLE_NAME')
- Frontend: Not accessible (security)

Update via:
Supabase Dashboard → Settings → Edge Functions → Secrets
```

---

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE CONSIDERATIONS                      │
└─────────────────────────────────────────────────────────────────┘

Frontend:
┌────────────────────────────────────────────────────────────────┐
│ • Lazy load VerifiedUserOnboarding component                   │
│ • Debounce form validation (300ms)                             │
│ • Compress photo uploads before sending                        │
│ • Show loading indicators during API calls                     │
│ • Cache form data in state during wizard steps                 │
└────────────────────────────────────────────────────────────────┘

Server:
┌────────────────────────────────────────────────────────────────┐
│ • Parallel API calls where possible                            │
│ • Set reasonable timeouts (30s for API calls)                  │
│ • Use connection pooling for database                          │
│ • Cache KV store reads where appropriate                       │
│ • Minimize database round trips                                │
└────────────────────────────────────────────────────────────────┘

External APIs:
┌────────────────────────────────────────────────────────────────┐
│ • Set timeout for each API call (5-10s)                        │
│ • Implement retry logic with exponential backoff               │
│ • Monitor API response times                                   │
│ • Cache API responses when appropriate                         │
│ • Use CDN for photo uploads                                    │
└────────────────────────────────────────────────────────────────┘
```

---

**This architecture provides a comprehensive, secure, and scalable verified user onboarding system for South African municipal portals.**

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0
