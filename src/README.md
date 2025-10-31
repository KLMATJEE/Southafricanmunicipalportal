# 🏛️ South African Municipal Portal

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-success.svg)](https://github.com/your-repo)

> A comprehensive, multilingual municipal service portal for South African citizens with offline capabilities, e-participation tools, and procurement transparency.

## 🚀 Quick Start

### For Citizens
1. Visit the portal
2. Click "Sign Up" to create your account
3. Access bills, report issues, participate in community discussions

### For Administrators

#### First-Time Setup: Create Bootstrap Admin

⚠️ **Important**: Admin accounts cannot be created via public signup.

**Option 1: Web Interface (Recommended)**
1. Open `/bootstrap-admin.html` in your browser
2. Enter your Supabase Project ID and Anon Key
3. Fill in admin details and click "Create Admin User"

**Option 2: Command Line**
```bash
cd scripts
node bootstrap-admin.js
# Follow the interactive prompts
```

**Option 3: API Call**
```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4c8674b4/bootstrap-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"admin@example.com","password":"secure123","name":"Admin Name"}'
```

📖 **Documentation:**
- Quick Start: [BOOTSTRAP_QUICK_START.md](BOOTSTRAP_QUICK_START.md)
- Full Guide: [BOOTSTRAP_GUIDE.md](BOOTSTRAP_GUIDE.md)
- Scripts: [scripts/README.md](scripts/README.md)

### Recent Updates (v2.0.1)
✅ **Fixed:** Cache initialization errors - offline sync now works smoothly  
📖 See [OFFLINE_FUNCTIONALITY_GUIDE.md](OFFLINE_FUNCTIONALITY_GUIDE.md) for offline features

---

# South African Municipal Portal

A comprehensive, secure municipal services portal built for South African government use, featuring real-time billing, issue reporting with geolocation, role-based access control, and full POPIA compliance.

## 🇿🇦 Features

### Core Functionality
- **Citizen Dashboard** - View bills, make payments, and track service requests
- **Billing Portal** - Real-time bill generation with PayFast/Stripe integration
- **Issue Reporting** - Report municipal issues with photo uploads and Google Maps geolocation
- **Admin Panel** - Role-based management for billing officers, supervisors, and auditors
- **Audit Logging** - Immutable audit trail for all system actions
- **Transparency Portal** - Public statistics and anonymized data

### Government-Specific Features
- **SA Government Branding** - Official color scheme and design components
- **Google Maps Integration** - Precise geolocation for issue reporting
- **Transaction Fee System** - R5.00 online payment fee with free in-person alternatives
- **POPIA Compliance** - Full data protection compliance indicators
- **Digital Receipts** - Automatic receipt generation for all transactions
- **2FA Support** - Two-factor authentication for enhanced security

## 🚀 Quick Start

### Prerequisites
- Supabase account (pre-configured)
- Google Maps API key (for geolocation features)

### Setup Instructions

#### 1. Google Maps API Setup (Required for Issue Reporting)

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create an API key
5. Restrict the API key:
   - **Application restrictions**: Add your domain
   - **API restrictions**: Enable only the three APIs above
6. Update `/components/MapPicker.tsx`:
   ```javascript
   const apiKey = 'YOUR_ACTUAL_API_KEY_HERE'
   ```

**Note:** For production, use environment variables instead of hardcoding the key.

#### 2. Run the Application

The application is pre-configured with Supabase. Simply:
1. Sign up with email/password
2. Access the citizen dashboard
3. Start using features immediately

## 📦 Architecture

### Frontend
- **React** with TypeScript
- **Tailwind CSS** with SA Government color palette
- **Shadcn UI** components
- **Google Maps JavaScript API**

### Backend
- **Supabase PostgreSQL** - Database
- **Supabase Auth** - Authentication with JWT
- **Supabase Edge Functions** - Hono web server
- **Key-Value Store** - Flexible data storage

### Security
- JWT-based session management
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- Immutable audit logs
- POPIA-compliant data handling

## 🎨 Government Design Kit

### Official Color Palette
```css
--sa-green: #007749   /* Primary government color */
--sa-gold: #FFBC40    /* Secondary accent */
--sa-red: #DE3831     /* Alerts and warnings */
--sa-blue: #001489    /* Information */
--sa-black: #000000   /* Text */
--sa-white: #FFFFFF   /* Backgrounds */
```

### Available Components

```typescript
import {
  SABadge,              // Official badges
  SAAlert,              // Government-styled alerts
  SAStatCard,           // Statistics cards
  SADepartmentBadge,    // Department identifiers
  SAServiceLevel,       // Service quality indicators
  SAPOPIACompliance,    // Compliance badges
  SAUserRoleBadge       // User role indicators
} from './components/GovernmentKit'
```

### Usage Example

```tsx
<SABadge label="Official" variant="official" />
<SAAlert 
  title="POPIA Notice" 
  description="Your data is protected" 
  variant="info" 
/>
<SAPOPIACompliance isCompliant={true} />
```

## 🗺️ Google Maps Integration

### Features
- **Geolocation** - Auto-detect user's current location
- **Interactive Map** - Click or drag marker to select location
- **Reverse Geocoding** - Convert coordinates to addresses
- **South Africa Focused** - Default center: Pretoria

### Issue Reporting Workflow
1. Citizen clicks "Report Issue"
2. Fills in title, description, category
3. Clicks map pin icon to open map
4. Uses "Use My Location" or manually selects on map
5. System captures coordinates and address
6. Issue submitted with geolocation data

## 👥 User Roles

### Citizen
- View bills and payment history
- Make online payments
- Report service issues
- Track issue status

### Billing Officer
- Generate bills
- View all payments
- Access transaction fee analytics
- View citizen data

### Auditor
- View all audit logs
- Access transaction records
- Review system activity
- Generate compliance reports

### Supervisor
- Manage user roles
- Update issue statuses
- Access all admin features
- View system analytics

### Admin
- Full system access
- Create/manage users
- Configure system settings
- Access all data

## 💰 Transaction Fee System

### Micro-Revenue Model
- **Online Payments**: R5.00 transaction fee
- **In-Person Payments**: FREE (alternative provided)
- **Full Transparency**: Fees disclosed before payment
- **Admin Analytics**: Track fee revenue
- **Public Disclosure**: Fee information on transparency portal

### Payment Methods
- Credit/Debit Card (R5.00 fee)
- EFT (R5.00 fee)
- PayFast (R5.00 fee)
- Stripe (R5.00 fee)
- In-Person at Municipal Office (FREE)

## 🔐 Security & Compliance

### POPIA Compliance
- ✅ Data minimization
- ✅ Purpose specification
- ✅ Consent management
- ✅ Right to access
- ✅ Right to deletion
- ✅ Audit logging
- ✅ Secure storage

### Security Features
- Password hashing
- JWT tokens
- Session management
- Role-based access
- Immutable audit logs
- SQL injection protection

### Production Checklist
- [ ] Enable SSL/TLS
- [ ] Configure 2FA
- [ ] Set up backups
- [ ] Implement rate limiting
- [ ] Store API keys in environment variables
- [ ] Conduct security audit
- [ ] Review POPIA compliance

## 📊 Database Schema

### Key-Value Store Structure
```
users:*           → User profiles and auth
bills:*           → Billing information
payments:*        → Payment records
issues:*          → Service requests with geolocation
audit_logs:*      → Immutable audit trail
transaction_fees:*→ Fee tracking and analytics
```

## 🎯 API Endpoints

### Citizen Endpoints
- `POST /make-server-4c8674b4/signup` - User registration
- `GET /make-server-4c8674b4/profile` - Get user profile
- `GET /make-server-4c8674b4/bills` - Get user bills
- `POST /make-server-4c8674b4/payments` - Process payment
- `POST /make-server-4c8674b4/issues` - Create issue report
- `GET /make-server-4c8674b4/issues` - Get user issues

### Admin Endpoints (Auth Required)
- `POST /make-server-4c8674b4/users` - Create user (admin)
- `POST /make-server-4c8674b4/bills` - Generate bill
- `PUT /make-server-4c8674b4/issues/:id/status` - Update issue
- `GET /make-server-4c8674b4/audit-logs` - View audit logs
- `GET /make-server-4c8674b4/transaction-fees` - Fee analytics

### Public Endpoints
- `GET /make-server-4c8674b4/transparency` - Public statistics

## 🧪 Testing

### Test Accounts
Create test accounts with different roles:
```
Email: admin@test.gov.za
Role: admin

Email: billing@test.gov.za
Role: billing_officer

Email: citizen@test.gov.za
Role: citizen
```

## 📱 Responsive Design

The portal is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🌍 Localization

Currently supports:
- English (default)
- Afrikaans (planned)
- isiZulu (planned)

## 📝 License

This is a government prototype. For production use, ensure compliance with:
- POPIA (Protection of Personal Information Act)
- PAIA (Promotion of Access to Information Act)
- Municipal Systems Act
- Municipal Finance Management Act

## 🤝 Support

For issues or questions:
1. Check the Setup Guide in the application
2. Review the Government Kit documentation
3. Consult the API documentation

## 🚧 Roadmap

- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Mobile app
- [ ] Automated bill generation
- [ ] Advanced analytics dashboard
- [ ] Integration with national systems
- [ ] Offline mode for field workers

## 📚 Additional Resources

- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [Supabase Documentation](https://supabase.com/docs)
- [POPIA Guidelines](https://popia.co.za)
- [South African Government Portal](https://www.gov.za)

---

**Built with 🇿🇦 for South African Municipalities**

*This is a prototype. Ensure proper security audits and compliance checks before production deployment.*
