# Quick Start: Verified User Onboarding

## 🚀 Get Started in 3 Steps

### Step 1: Configure API Keys (Done! ✅)

You've already been prompted to add:
- `PAYJOY_API_KEY` - For credit checks and risk scoring
- `INCODE_API_KEY` - For biometric verification

**To verify or update:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Confirm both keys are present

---

### Step 2: Access the Onboarding Feature

1. **Log in** to your municipal portal
2. Use credentials for an **Admin** or **Billing Officer** account
3. Navigate to **Admin Panel**
4. Click the **"User Management"** tab
5. Click the **"Verified Onboarding"** button (green with shield icon 🛡️)

---

### Step 3: Create Your First Verified User

Follow the 4-step wizard:

#### ✅ Step 1: Basic Information (30 seconds)
- Full name
- Email address  
- Password (min 8 characters)
- Role (Citizen, Billing Officer, Supervisor, Auditor)

#### ✅ Step 2: Government ID (30 seconds)
- Select ID type (SA ID, Green Book, Passport, Smart Card)
- Enter ID number
  - **SA ID format:** 13 digits (e.g., `8001015009087`)
  - Validation happens automatically

#### ✅ Step 3: Contact & Credit Check (30 seconds)
- Enter phone number
  - **Format:** `+27821234567` or `0821234567`
- System automatically performs:
  - ✅ Credit check via PayJoy
  - ✅ Behavioral risk analysis
  - ✅ Phone validation

#### ✅ Step 4: Biometric Verification (1 minute - Optional)
- Upload a clear, well-lit photo
- System performs:
  - ✅ Facial recognition via Incode
  - ✅ Liveness detection
  - ✅ ID photo matching

**Tips for good photos:**
- Face clearly visible
- Good lighting
- No sunglasses or hats
- Look directly at camera

---

## 🎉 Success!

After completion, you'll see:
- ✅ Credit approval status
- 📊 Credit score (if available)
- 🔐 Biometric verification status  
- 📈 Risk score percentage

All data is:
- 🔒 Encrypted and stored securely
- 📝 Logged in audit trail
- ✅ POPIA compliant

---

## 🧪 Testing Without Real API Keys

Don't have PayJoy or Incode credentials yet? No problem!

**The system will:**
- ✅ Automatically approve credit checks
- ✅ Skip biometric verification gracefully
- ✅ Default to low risk score
- ✅ Allow you to test the full workflow

**Console logs will show:**
```
PAYJOY_API_KEY not configured, skipping credit check
INCODE_API_KEY not configured, skipping biometric check
```

This lets you fully test the UI and user experience before integrating real APIs.

---

## 📋 Quick Validation Reference

### South African ID Number
- **Length:** Exactly 13 digits
- **Format:** `YYMMDDGGGGSSCZ`
- **Example:** `8001015009087`
- ❌ No spaces, dashes, or letters

### Phone Number
- **Format:** `+27` followed by 9 digits
- **Alternative:** `0` followed by 9 digits
- **Example:** `+27821234567` or `0821234567`
- ❌ No spaces or special characters

### Password
- **Minimum:** 8 characters
- **Recommended:** Mix of letters, numbers, symbols
- **Example:** `SecurePass123!`

---

## 🔍 View Verification Results

### In User Profile:
```
{
  "creditScore": 750,
  "creditApproved": true,
  "biometricVerified": true,
  "riskScore": 0.15,
  "verificationDate": "2025-11-03T10:30:00.000Z"
}
```

### In Audit Logs:
Navigate to **Admin Panel** → **Audit Logs** to see:
- Who created the verified user
- All verification results
- Timestamp of verification
- Complete audit trail

---

## ⚡ Quick Tips

### For Best Results:
1. ✅ **Use verified onboarding for all staff roles** (Admin, Billing Officer, Auditor)
2. ✅ **Require biometric verification for financial roles**
3. ✅ **Review verification results before granting access**
4. ✅ **Check audit logs regularly** for compliance

### Common Use Cases:
- **New employee onboarding** → Use verified onboarding
- **Temporary contractor** → Use quick create (basic validation)
- **High-privilege roles** → Require all 3 verification steps
- **Standard citizens** → Public signup (no verification needed)

---

## 🆘 Quick Troubleshooting

### Issue: "Only admins or billing officers can onboard verified users"
**Solution:** Log in with an Admin or Billing Officer account

### Issue: ID validation fails
**Solution:** Check format - SA ID must be exactly 13 digits, no spaces

### Issue: Phone validation fails  
**Solution:** Use SA format - `+27` or `0` prefix, then 9 digits

### Issue: Photo upload doesn't work
**Solution:** Ensure image is JPEG/PNG, under 5MB, clear quality

### Issue: API calls failing
**Solution:** Check environment variables in Supabase Edge Functions settings

---

## 📚 More Information

- **Complete Guide:** See `VERIFIED_ONBOARDING_GUIDE.md`
- **Technical Details:** See `VERIFIED_ONBOARDING_SUMMARY.md`
- **Server Code:** `/supabase/functions/server/index.tsx` (line 211)
- **UI Component:** `/components/VerifiedUserOnboarding.tsx`

---

## 🎯 Next Steps

After creating your first verified user:

1. **Test the user account** - Log in with the new credentials
2. **Check audit logs** - Verify all steps were logged
3. **Review verification data** - Look at user profile metadata
4. **Create more users** - Onboard your team with verification
5. **Configure real APIs** - When ready, add actual PayJoy and Incode keys

---

## 💡 Pro Tips

### Security Best Practices:
- 🔒 Never share API keys
- 🔄 Rotate keys regularly (quarterly recommended)
- 📊 Monitor verification failure rates
- 🚨 Alert on high-risk user creations
- 📝 Review audit logs weekly

### Compliance Best Practices:
- ✅ Inform users of data collection
- ✅ Obtain consent before verification
- ✅ Store only necessary data
- ✅ Provide access to verification records
- ✅ Delete data when no longer needed

---

**Ready to go? Click "Verified Onboarding" and create your first secure user!** 🚀

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
