# Verified Onboarding - Test Scenarios

## Test Scenario 1: Successful Full Verification

### Input Data:
```json
{
  "name": "Thabo Mbeki",
  "email": "thabo.mbeki@example.co.za",
  "password": "SecurePass123!",
  "role": "citizen",
  "phone": "+27821234567",
  "idType": "sa_id",
  "idNumber": "8001015009087",
  "photoUrl": "[valid base64 image]"
}
```

### Expected Behavior:
1. ✅ All form validations pass
2. ✅ Credit check returns approved
3. ✅ Biometric verification succeeds
4. ✅ Risk score below 0.7
5. ✅ User created successfully
6. ✅ Audit log entry created
7. ✅ Success screen displays verification results

### Expected Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "thabo.mbeki@example.co.za"
  },
  "verification": {
    "creditScore": 750,
    "creditApproved": true,
    "biometricVerified": true,
    "riskScore": 0.15
  }
}
```

### Verification Level:
🟢 **Fully Verified** (3/3 checks passed)

---

## Test Scenario 2: Partial Verification (No Photo)

### Input Data:
```json
{
  "name": "Lindiwe Nkosi",
  "email": "lindiwe.nkosi@example.co.za",
  "password": "MyPassword789",
  "role": "citizen",
  "phone": "0823456789",
  "idType": "sa_id",
  "idNumber": "9203154321098",
  "photoUrl": ""
}
```

### Expected Behavior:
1. ✅ Form validations pass
2. ✅ Credit check returns approved
3. ⚠️ Biometric verification skipped (no photo)
4. ✅ Risk score acceptable
5. ✅ User created successfully
6. ⚠️ Biometric marked as "skipped" in results

### Expected Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "lindiwe.nkosi@example.co.za"
  },
  "verification": {
    "creditScore": 680,
    "creditApproved": true,
    "biometricVerified": false,
    "riskScore": 0.25
  }
}
```

### Verification Level:
🔵 **Verified** (2/3 checks passed)

---

## Test Scenario 3: Credit Check Failure

### Input Data:
```json
{
  "name": "Sipho Dlamini",
  "email": "sipho.dlamini@example.co.za",
  "password": "Password123",
  "role": "citizen",
  "phone": "+27821111111",
  "idType": "sa_id",
  "idNumber": "7501011234567",
  "photoUrl": ""
}
```

### Mock PayJoy Response:
```json
{
  "approved": false,
  "score": 450
}
```

### Expected Behavior:
1. ✅ Form validations pass
2. ❌ Credit check fails
3. 🛑 User creation blocked
4. ❌ Error message displayed

### Expected Response:
```json
{
  "error": "Credit check failed or user not approved"
}
```

### Result:
❌ User NOT created - Credit check failed

---

## Test Scenario 4: High Risk Score

### Input Data:
```json
{
  "name": "Zanele Mthembu",
  "email": "zanele.mthembu@example.co.za",
  "password": "TestPass456",
  "role": "billing_officer",
  "phone": "+27829999999",
  "idType": "passport",
  "idNumber": "A12345678",
  "photoUrl": "[valid base64 image]"
}
```

### Mock PayJoy Adaptive Auth Response:
```json
{
  "riskScore": 0.85
}
```

### Expected Behavior:
1. ✅ Form validations pass
2. ✅ Credit check passes
3. ✅ Biometric verification passes
4. ❌ Risk score too high (>0.7)
5. 🛑 User creation blocked
6. ❌ Error message displayed

### Expected Response:
```json
{
  "error": "High-risk behavior detected during signup"
}
```

### Result:
❌ User NOT created - High risk score

---

## Test Scenario 5: Biometric Verification Failure

### Input Data:
```json
{
  "name": "Mandla Zuma",
  "email": "mandla.zuma@example.co.za",
  "password": "SafePass321",
  "role": "citizen",
  "phone": "+27827777777",
  "idType": "sa_id",
  "idNumber": "8501015009087",
  "photoUrl": "[invalid/blurry image]"
}
```

### Mock Incode Response:
```json
{
  "match": false,
  "confidence": 0.35
}
```

### Expected Behavior:
1. ✅ Form validations pass
2. ✅ Credit check passes
3. ❌ Biometric verification fails
4. 🛑 User creation blocked
5. ❌ Error message displayed

### Expected Response:
```json
{
  "error": "Biometric verification failed"
}
```

### Result:
❌ User NOT created - Biometric mismatch

---

## Test Scenario 6: Invalid SA ID Format

### Input Data:
```json
{
  "name": "Test User",
  "email": "test@example.co.za",
  "password": "Password123",
  "role": "citizen",
  "phone": "+27821234567",
  "idType": "sa_id",
  "idNumber": "12345",  // Too short!
  "photoUrl": ""
}
```

### Expected Behavior:
1. ❌ Form validation fails at Step 2
2. 🛑 Cannot proceed to next step
3. ❌ Error message: "South African ID number must be 13 digits"
4. 🚫 No API calls made

### Result:
❌ Form validation prevents submission

---

## Test Scenario 7: Invalid Phone Number

### Input Data:
```json
{
  "name": "Test User",
  "email": "test2@example.co.za",
  "password": "Password123",
  "role": "citizen",
  "phone": "555-1234",  // Invalid format!
  "idType": "sa_id",
  "idNumber": "8001015009087",
  "photoUrl": ""
}
```

### Expected Behavior:
1. ✅ Steps 1-2 pass
2. ❌ Form validation fails at Step 3
3. 🛑 Cannot proceed to next step
4. ❌ Error message: "Please enter a valid South African phone number"
5. 🚫 No API calls made

### Result:
❌ Form validation prevents submission

---

## Test Scenario 8: API Keys Not Configured

### Input Data:
```json
{
  "name": "Nomsa Khumalo",
  "email": "nomsa.khumalo@example.co.za",
  "password": "MySecurePass99",
  "role": "citizen",
  "phone": "+27824444444",
  "idType": "greenbook",
  "idNumber": "GB123456",
  "photoUrl": "[valid base64 image]"
}
```

### Environment:
- `PAYJOY_API_KEY` = not set
- `INCODE_API_KEY` = not set

### Expected Behavior:
1. ✅ Form validations pass
2. ⚠️ Credit check skipped (no API key)
3. ⚠️ Biometric verification skipped (no API key)
4. ⚠️ Risk scoring skipped (no API key)
5. ✅ User created with default values
6. ⚠️ Console warnings logged

### Expected Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "nomsa.khumalo@example.co.za"
  },
  "verification": {
    "creditScore": 0,
    "creditApproved": true,
    "biometricVerified": true,
    "riskScore": 0
  }
}
```

### Console Logs:
```
PAYJOY_API_KEY not configured, skipping credit check
INCODE_API_KEY not configured, skipping biometric check
```

### Verification Level:
🟡 **Partially Verified** (API keys not configured)

---

## Test Scenario 9: API Timeout/Error

### Input Data:
```json
{
  "name": "Bongani Sithole",
  "email": "bongani.sithole@example.co.za",
  "password": "StrongPass555",
  "role": "supervisor",
  "phone": "+27825555555",
  "idType": "sa_id",
  "idNumber": "8601015009087",
  "photoUrl": "[valid base64 image]"
}
```

### API Behavior:
- PayJoy API returns 500 error
- Incode API times out

### Expected Behavior:
1. ✅ Form validations pass
2. ⚠️ Credit check API error (logged)
3. ⚠️ Biometric API error (logged)
4. ✅ System gracefully defaults to approved
5. ✅ User created successfully
6. ⚠️ Error logged for admin review

### Expected Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "bongani.sithole@example.co.za"
  },
  "verification": {
    "creditScore": 0,
    "creditApproved": true,
    "biometricVerified": true,
    "riskScore": 0
  }
}
```

### Console Logs:
```
Credit check error: [error details]
Biometric verification error: [error details]
```

### Result:
✅ User created with graceful fallback

---

## Test Scenario 10: Unauthorized Access Attempt

### Input Data:
Citizen user (not admin) tries to access `/create-verified-user` endpoint

### Expected Behavior:
1. 🚫 Authorization check fails
2. ❌ 403 Forbidden response
3. ❌ Error message displayed
4. 🛑 User creation blocked

### Expected Response:
```json
{
  "error": "Only admins or billing officers can onboard verified users"
}
```

### Result:
❌ Access denied - Insufficient permissions

---

## Manual Testing Checklist

### UI Testing:
- [ ] All 4 steps display correctly
- [ ] Progress indicator updates
- [ ] Back button works at each step
- [ ] Form validation shows errors inline
- [ ] Photo preview displays after upload
- [ ] Success screen shows verification results
- [ ] Dialog closes after success
- [ ] Mobile responsive design works

### Form Validation:
- [ ] Name required
- [ ] Email format validated
- [ ] Password minimum 8 characters
- [ ] SA ID must be 13 digits
- [ ] Phone number SA format validated
- [ ] Cannot proceed with invalid data

### API Integration:
- [ ] Credit check API called correctly
- [ ] Adaptive auth API called correctly
- [ ] Biometric API called correctly
- [ ] Error responses handled gracefully
- [ ] Timeout scenarios handled

### Data Storage:
- [ ] User created in Supabase Auth
- [ ] Profile stored in KV store
- [ ] Audit log entry created
- [ ] All metadata saved correctly
- [ ] Timestamps accurate

### Security:
- [ ] Only admin/billing officer can access
- [ ] API keys read from environment
- [ ] No sensitive data in console logs
- [ ] Encrypted data storage
- [ ] HTTPS for all API calls

---

## Automated Test Data

### Valid SA ID Numbers (Test):
- `8001015009087` - Male, born Jan 1, 1980
- `9203154321098` - Female, born Mar 15, 1992
- `8501015009087` - Male, born Jan 1, 1985
- `7501011234567` - Male, born Jan 1, 1975
- `8601015009087` - Male, born Jan 1, 1986

### Valid Phone Numbers:
- `+27821234567`
- `+27823456789`
- `0821234567`
- `0827777777`
- `+27824444444`

### Valid Email Addresses:
- `user@example.co.za`
- `test.user@municipality.gov.za`
- `admin@city.org.za`

---

## Performance Benchmarks

### Expected Response Times:
- **Form validation:** < 100ms
- **Step navigation:** < 200ms
- **Credit check API:** 1-3 seconds
- **Biometric API:** 2-5 seconds
- **Total onboarding time:** 30-60 seconds

### API Call Sequence:
1. User submits form (instant)
2. Credit check API called (1-3s)
3. Adaptive auth API called (1-2s)
4. Biometric API called (2-5s)
5. User created in Supabase (1s)
6. KV store update (< 1s)
7. Audit log created (< 1s)
8. Success response returned (instant)

**Total:** ~10-15 seconds for full verification

---

## Error Message Reference

| Error | Cause | Resolution |
|-------|-------|------------|
| "Please fill in all basic information fields" | Missing name, email, or password | Complete all required fields |
| "Password must be at least 8 characters long" | Password too short | Use longer password |
| "Invalid or missing government ID" | Invalid ID type or number | Verify ID format |
| "South African ID number must be 13 digits" | SA ID wrong length | Enter exactly 13 digits |
| "Phone number is required for verification" | Missing phone | Enter phone number |
| "Please enter a valid South African phone number" | Invalid phone format | Use +27 or 0 prefix |
| "Credit check failed or user not approved" | PayJoy rejected | Review credit criteria |
| "Biometric verification failed" | Face doesn't match | Use clearer photo |
| "High-risk behavior detected during signup" | Risk score > 0.7 | Review user behavior |
| "Only admins or billing officers can onboard verified users" | Insufficient permissions | Use admin account |

---

**Use these test scenarios to ensure your verified onboarding system is working correctly!** ✅

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0
