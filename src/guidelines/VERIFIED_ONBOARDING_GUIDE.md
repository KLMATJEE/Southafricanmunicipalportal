# Verified User Onboarding Guide

## Overview

The Enhanced Verified User Onboarding system implements a comprehensive multi-step verification process that includes:

1. **ID Verification** - Government-issued ID validation (Smart Card, Green Book, Passport, SA ID)
2. **Credit Checks** - PayJoy API integration for creditworthiness assessment
3. **Biometric Authentication** - Incode facial recognition for identity verification
4. **Adaptive Authentication** - Behavioral risk scoring via PayJoy

## Features

### Multi-Step Verification Flow

#### Step 1: Basic Information
- Full name
- Email address
- Password (minimum 8 characters)
- User role selection (Citizen, Billing Officer, Supervisor, Auditor)

#### Step 2: Government ID Verification
- ID Type selection:
  - South African ID (Smart Card) - 13 digits
  - Green Book ID
  - Passport
  - Smart Card
- ID Number validation with format checking
- Secure storage with POPIA compliance

#### Step 3: Contact & Credit Verification
- Phone number (required for verification)
- Credit check via PayJoy API
- Behavioral risk analysis
- Phone number format validation (South African format)

#### Step 4: Biometric Authentication (Optional)
- Photo upload for facial recognition
- Incode API integration for faceprint verification
- Liveness detection to prevent spoofing
- Match verification against ID photo

### API Integrations

#### PayJoy API
**Environment Variable:** `PAYJOY_API_KEY`

**Endpoints Used:**
- `/credit-check` - Validates creditworthiness and returns credit score
- `/adaptive-auth` - Analyzes behavioral patterns and provides risk score

**Credit Check Response:**
```json
{
  "approved": true,
  "score": 750
}
```

**Adaptive Auth Response:**
```json
{
  "riskScore": 0.15
}
```

Risk scores above 0.7 (70%) will prevent user creation.

#### Incode API
**Environment Variable:** `INCODE_API_KEY`

**Endpoint Used:**
- `/verify-faceprint` - Performs facial recognition verification

**Response:**
```json
{
  "match": true,
  "confidence": 0.95
}
```

### Security Features

1. **Encrypted Data Storage** - All sensitive information encrypted at rest
2. **POPIA Compliance** - Fully compliant with Protection of Personal Information Act
3. **Audit Logging** - All verification steps logged for compliance
4. **Multi-Factor Verification** - Combines multiple verification methods
5. **Graceful Degradation** - System continues if optional verification fails

## Setup Instructions

### 1. Configure API Keys

You've already been prompted to add:
- `PAYJOY_API_KEY` - Your PayJoy API key
- `INCODE_API_KEY` - Your Incode API key

If you need to update these:
1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions > Secrets
3. Update the secret values

### 2. Access Verified Onboarding

1. Log in as an **Admin** or **Billing Officer**
2. Navigate to the **Admin Panel**
3. Click the **User Management** tab
4. Click the **"Verified Onboarding"** button (green shield icon)

### 3. Complete the Onboarding Process

Follow the 4-step wizard:
1. Enter basic user information
2. Provide government ID details
3. Enter phone number for verification
4. (Optional) Upload photo for biometric verification
5. Review verification results

## Verification Results

After successful onboarding, you'll see:

- **Credit Approval Status** - Whether the credit check passed
- **Credit Score** - Numerical score from PayJoy (if available)
- **Biometric Verification** - Whether facial recognition matched
- **Risk Score** - Behavioral risk percentage (lower is better)

All verification data is stored in the user profile and can be viewed in audit logs.

## API Endpoint

### POST `/make-server-4c8674b4/create-verified-user`

**Authorization:** Required (Admin or Billing Officer)

**Request Body:**
```json
{
  "email": "user@example.co.za",
  "password": "SecurePassword123",
  "name": "Thabo Mbeki",
  "role": "citizen",
  "phone": "+27821234567",
  "idType": "sa_id",
  "idNumber": "8001015009087",
  "photoUrl": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.co.za",
    "user_metadata": { ... }
  },
  "verification": {
    "creditScore": 750,
    "creditApproved": true,
    "biometricVerified": true,
    "riskScore": 0.15
  }
}
```

## Error Handling

The system handles various error scenarios:

### Credit Check Failed
```json
{
  "error": "Credit check failed or user not approved"
}
```

### Biometric Verification Failed
```json
{
  "error": "Biometric verification failed"
}
```

### High Risk Score
```json
{
  "error": "High-risk behavior detected during signup"
}
```

### Invalid ID Format
```json
{
  "error": "South African ID number must be 13 digits"
}
```

## Testing Without API Keys

If API keys are not configured, the system will:
- Log a warning message
- Default to **approved** status
- Continue with user creation
- Mark verification as "skipped" in audit logs

This allows you to test the system without real API credentials.

## Compliance & Privacy

### POPIA Compliance
All personal data handling complies with South Africa's Protection of Personal Information Act:
- **Consent** - Users are informed of all verification steps
- **Purpose** - Clear explanation of why data is collected
- **Security** - Encrypted storage and transmission
- **Access** - Users can request their verification data
- **Retention** - Data stored only as long as necessary

### Audit Trail
Every verification creates immutable audit log entries:
- User who initiated the onboarding
- Verification methods used
- Results of each check
- Timestamp of verification
- Any failures or skipped steps

## Best Practices

1. **Always use verified onboarding for high-privilege roles** (Admin, Billing Officer)
2. **Require biometric verification for financial roles**
3. **Review verification results** before granting system access
4. **Regularly audit verification logs** for anomalies
5. **Update API credentials** regularly for security

## Troubleshooting

### Issue: API calls failing
**Solution:** Check that environment variables are set correctly in Supabase Edge Functions settings

### Issue: Biometric verification always fails
**Solution:** Ensure photos are clear, well-lit, and show the full face

### Issue: SA ID validation fails
**Solution:** Verify the ID number is exactly 13 digits with no spaces or dashes

### Issue: Phone number validation fails
**Solution:** Use South African format: +27XXXXXXXXX or 0XXXXXXXXX

## Future Enhancements

Planned improvements:
- SMS OTP verification
- Email verification codes
- Document upload (ID copies, proof of address)
- Real-time ID verification via Home Affairs API
- Enhanced liveness detection
- Multi-language support for verification UI

## Support

For issues or questions:
1. Check the audit logs for detailed error messages
2. Review the server logs in Supabase Edge Functions
3. Verify API credentials are correctly configured
4. Test with mock data before using real credentials

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0
