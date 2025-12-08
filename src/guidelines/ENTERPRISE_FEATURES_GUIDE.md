# Enterprise Features Guide
## South African Municipal Portal - Advanced Systems

This document describes the enterprise-grade features recently integrated into your municipal portal, modeled after FSCA (Financial Sector Conduct Authority) regulatory patterns.

---

## 🗺️ Advanced GIS Integration

### Overview
Full-featured Geographic Information System with OGC (Open Geospatial Consortium) standards support.

### Features
- **OGC WFS (Web Feature Service)** integration
- **Multiple layer management** for:
  - Water distribution networks
  - Sanitation facilities
  - Road infrastructure
  - Service delivery points
  - Municipal boundaries
- **Spatial analytics**:
  - Buffer analysis
  - Proximity calculations
  - Intersection analysis
  - Distance measurements
- **Layer controls**:
  - Visibility toggles
  - Opacity adjustments
  - Category filtering
  - Real-time search
- **Data export**: GeoJSON format for interoperability

### Component Usage
```tsx
import { AdvancedMapViewer } from './components/AdvancedMapViewer';

<AdvancedMapViewer
  center={[-26.2041, 28.0473]} // Johannesburg
  zoom={12}
  enableAnalytics={true}
  onFeatureClick={(feature) => console.log(feature)}
/>
```

### WFS Configuration
To connect to actual OGC WFS services, configure the `url` property for each layer:

```tsx
{
  id: 'water-network',
  name: 'Water Distribution Network',
  type: 'wfs',
  url: 'https://your-gis-server.gov.za/geoserver/wfs',
  wfsConfig: {
    typeName: 'municipal:water_lines',
    version: '2.0.0',
    outputFormat: 'application/json'
  }
}
```

### Integration with Map Libraries
For full functionality, integrate with:
- **Leaflet** + leaflet-wfs plugin
- **OpenLayers** with WFS support
- **MapLibre GL JS** for vector tiles

---

## 🔄 Workflow Automation System

### Overview
Multi-step approval workflows with role-based access, audit trails, and notifications.

### Architecture
- **State-based workflow engine**
- **Role-based step assignment**
- **Immutable audit logs**
- **Deadline tracking**
- **Document attachment support**

### Workflow Structure
```tsx
interface WorkflowInstance {
  id: string;
  type: string; // 'license_application', 'procurement', 'compliance'
  title: string;
  initiatedBy: string;
  currentStep: number;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'archived';
  steps: WorkflowStep[];
  documents: WorkflowDocument[];
  comments: WorkflowComment[];
}
```

### Component Usage
```tsx
import { WorkflowEngine } from './components/WorkflowEngine';

<WorkflowEngine
  workflow={workflowInstance}
  userRole="billing_officer"
  userId={currentUser.id}
  onAction={async (action, data) => {
    await api.post(`/workflows/${workflow.id}/action`, { action, ...data });
  }}
/>
```

### Creating Workflows
```tsx
const workflow = {
  type: 'license_application',
  title: 'Business License Application - ABC Trading',
  description: 'New business license for retail operation',
  steps: [
    {
      id: 'step1',
      name: 'Initial Review',
      description: 'Verify application completeness',
      assignedRole: 'clerk',
      requiredDocuments: ['ID Document', 'Proof of Address'],
      deadline: '2025-11-10'
    },
    {
      id: 'step2',
      name: 'Compliance Check',
      description: 'Verify regulatory compliance',
      assignedRole: 'compliance_officer',
      deadline: '2025-11-15'
    },
    {
      id: 'step3',
      name: 'Final Approval',
      description: 'Manager approval',
      assignedRole: 'manager',
      deadline: '2025-11-20'
    }
  ],
  documents: []
};

await api.post('/workflows', workflow);
```

### Actions
- **Approve**: Move to next step
- **Reject**: Reject workflow (immutable)
- **Request Changes**: Send back to initiator with comments

### API Endpoints
- `GET /workflows` - List user's workflows
- `POST /workflows` - Create new workflow
- `POST /workflows/:id/action` - Perform action (approve/reject/request_changes)

---

## 🔔 Advanced Notification System

### Overview
Multi-channel notification system with email, push, and in-app delivery.

### Features
- **Email notifications** (immediate, daily digest, weekly summary)
- **Push notifications** (browser and mobile)
- **Granular channel controls**:
  - Bills & Payments
  - Service Requests
  - Workflow Actions
  - Deadlines
  - Compliance Alerts
  - System Notifications
- **Priority levels**: Low, Medium, High, Urgent
- **Read/unread tracking**
- **Notification preferences per user**

### Component Usage
```tsx
import { NotificationService } from './components/NotificationService';

<NotificationService
  userId={currentUser.id}
  onNotificationClick={(notification) => {
    // Handle notification click
    navigate(notification.actionUrl);
  }}
/>
```

### Push Notification Setup

#### 1. Service Worker
The portal includes a service worker template at `/utils/serviceWorker.ts`. To enable push notifications:

```typescript
// In your main app initialization
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

#### 2. VAPID Keys
Generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

Add to environment variables:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

#### 3. Server-Side Push
```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@municipality.gov.za',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
const subscription = await kv.get(`push_subscription_${userId}`);
await webpush.sendNotification(subscription, JSON.stringify({
  title: 'Bill Payment Due',
  body: 'Your electricity bill is due in 3 days',
  icon: '/icon-192.png',
  badge: '/badge-72.png'
}));
```

### Email Notifications

#### Integration Options

**Option 1: SendGrid**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'notifications@municipality.gov.za',
  subject: 'Workflow Approved',
  html: emailTemplate
});
```

**Option 2: AWS SES**
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'af-south-1' });

await ses.send(new SendEmailCommand({
  Source: 'notifications@municipality.gov.za',
  Destination: { ToAddresses: [user.email] },
  Message: {
    Subject: { Data: 'Workflow Approved' },
    Body: { Html: { Data: emailTemplate } }
  }
}));
```

### API Endpoints
- `GET /notification-preferences` - Get user preferences
- `POST /notification-preferences` - Update preferences
- `POST /push-subscription` - Register push subscription
- `GET /notifications` - Get user notifications
- `POST /notifications/:id/read` - Mark as read

---

## 📊 Reporting & Analytics

### Overview
Comprehensive reporting system with multiple formats and data visualizations.

### Report Types
1. **Audit Trail Reports**
   - All system actions
   - User activity logs
   - Compliance tracking

2. **Compliance Reports**
   - Workflow status
   - Deadline adherence
   - Document compliance

3. **Financial Reports**
   - Revenue collection
   - Payment trends
   - Transaction fees
   - Outstanding balances

4. **Operational Reports**
   - Service request metrics
   - Response times
   - Resolution rates

### Component Usage
```tsx
import { ReportGenerator } from './components/ReportGenerator';

<ReportGenerator userRole={currentUser.role} />
```

### Export Formats
- **PDF**: Professional documents with charts
- **Excel**: Spreadsheets with multiple sheets
- **CSV**: Raw data for analysis
- **JSON**: API data format

### Generating Reports Programmatically
```typescript
const config = {
  type: 'financial',
  format: 'pdf',
  dateRange: {
    from: new Date('2025-01-01'),
    to: new Date('2025-11-03')
  },
  filters: {
    department: ['billing', 'collections'],
    status: ['completed', 'pending']
  },
  includeCharts: true,
  includeRawData: true,
  groupBy: 'month',
  sortBy: 'date'
};

const { reportId, downloadUrl } = await api.post('/reports/generate', { config });
```

### Report Security
- All reports are digitally signed
- Generation is logged in audit trail
- Access control based on user role
- Download links expire after 24 hours (recommended)

### API Endpoints
- `POST /reports/generate` - Generate new report
- `GET /reports/:id/download` - Download report
- `GET /reports` - List user's reports

---

## 🔗 External Integrations

### Overview
Framework for connecting to payment gateways, compliance databases, and government systems.

### Supported Integrations

#### Payment Gateways
1. **PayFast** (South African)
   - Merchant ID
   - Merchant Key
   - Passphrase
   - Test/Live mode

2. **Stripe** (International)
   - Public Key
   - Secret Key
   - Webhook Secret

#### Compliance Systems
1. **MFMA (Municipal Finance Management Act)**
   - API Endpoint
   - API Key
   - Municipal Code

2. **PAIA (Promotion of Access to Information Act)**
   - Registration Number
   - Compliance Officer

3. **National Treasury Portal**
   - Organization ID
   - API Key

4. **SARS eFiling**
   - Tax Reference
   - Digital Certificate

### Component Usage
```tsx
import { ExternalIntegrations } from './components/ExternalIntegrations';

<ExternalIntegrations
  onSave={async (integrations) => {
    await api.post('/integrations', { integrations });
  }}
/>
```

### PayFast Integration Example

#### 1. Configuration
```typescript
const payfastConfig = {
  merchantId: 'your_merchant_id',
  merchantKey: 'your_merchant_key',
  passphrase: 'your_passphrase',
  testMode: false
};
```

#### 2. Generate Payment
```typescript
import crypto from 'crypto';

function generatePayFastSignature(data: any, passphrase: string) {
  let paramString = '';
  for (const key in data) {
    if (data[key]) {
      paramString += `${key}=${encodeURIComponent(data[key])}&`;
    }
  }
  paramString = paramString.slice(0, -1); // Remove trailing &
  paramString += `&passphrase=${encodeURIComponent(passphrase)}`;
  
  return crypto.createHash('md5').update(paramString).digest('hex');
}

const paymentData = {
  merchant_id: payfastConfig.merchantId,
  merchant_key: payfastConfig.merchantKey,
  return_url: 'https://portal.municipality.gov.za/payment/return',
  cancel_url: 'https://portal.municipality.gov.za/payment/cancel',
  notify_url: 'https://portal.municipality.gov.za/api/payfast/notify',
  amount: '150.00',
  item_name: 'Electricity Bill Payment',
  item_description: 'Account: 12345678'
};

paymentData.signature = generatePayFastSignature(paymentData, payfastConfig.passphrase);

// Redirect to PayFast
window.location.href = `https://www.payfast.co.za/eng/process?${new URLSearchParams(paymentData)}`;
```

#### 3. Webhook Handler
```typescript
app.post('/make-server-4c8674b4/payfast/notify', async (c) => {
  const data = await c.req.formData();
  
  // Verify signature
  const signature = data.get('signature');
  const calculatedSignature = generatePayFastSignature(data, payfastConfig.passphrase);
  
  if (signature !== calculatedSignature) {
    return c.json({ error: 'Invalid signature' }, 400);
  }
  
  // Process payment
  const paymentId = data.get('m_payment_id');
  const status = data.get('payment_status');
  
  if (status === 'COMPLETE') {
    await updatePaymentStatus(paymentId, 'completed');
    await createNotification(userId, {
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment has been processed',
      priority: 'medium'
    });
  }
  
  return c.text('OK');
});
```

### MFMA Integration Example
```typescript
async function submitMFMAReport(reportData: any) {
  const response = await fetch(mfmaConfig.apiEndpoint + '/reports', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mfmaConfig.apiKey}`,
      'Content-Type': 'application/json',
      'X-Municipal-Code': mfmaConfig.municipalCode
    },
    body: JSON.stringify(reportData)
  });
  
  return response.json();
}
```

---

## 🏗️ Architecture Best Practices

### Modular Design
All features are designed as independent modules:

```
/components
  ├── WorkflowEngine.tsx           # Standalone workflow component
  ├── AdvancedMapViewer.tsx        # GIS without dependencies
  ├── NotificationService.tsx      # Notification management
  ├── ReportGenerator.tsx          # Report creation
  └── ExternalIntegrations.tsx     # Integration framework
```

### Type Safety
All components use TypeScript interfaces:

```typescript
// Easy to extend
interface WorkflowStep {
  id: string;
  name: string;
  assignedRole: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  // Add custom fields as needed
  customField?: any;
}
```

### API Abstraction
Use the centralized API utility:

```typescript
// /utils/api.ts
export const api = {
  fetch: (endpoint) => fetchWithAuth(endpoint),
  post: (endpoint, data) => postWithAuth(endpoint, data),
  // Automatically handles auth tokens, error handling, logging
};
```

---

## 🧪 Testing Recommendations

### Integration Tests

```typescript
describe('Workflow Engine', () => {
  it('should create workflow', async () => {
    const workflow = await api.post('/workflows', testWorkflowData);
    expect(workflow.id).toBeDefined();
    expect(workflow.status).toBe('submitted');
  });

  it('should approve step', async () => {
    const result = await api.post(`/workflows/${workflowId}/action`, {
      action: 'approve',
      stepId: 'step1',
      comment: 'Approved'
    });
    expect(result.workflow.currentStep).toBe(1);
  });

  it('should reject workflow', async () => {
    const result = await api.post(`/workflows/${workflowId}/action`, {
      action: 'reject',
      stepId: 'step1',
      comment: 'Missing documents'
    });
    expect(result.workflow.status).toBe('rejected');
  });
});
```

### Unit Tests
```typescript
describe('Report Generator', () => {
  it('should generate audit report', async () => {
    const config = { type: 'audit', format: 'json', dateRange: {...} };
    const report = await generateReport(config);
    expect(report.dataSnapshot.logs).toBeDefined();
  });
});
```

---

## 🔒 Security Considerations

### API Keys & Credentials
- All credentials encrypted at rest
- Never log API keys
- Use environment variables
- Rotate keys regularly

### Audit Logging
- All actions are logged
- Logs are immutable
- Include user, action, timestamp, changes
- Store indefinitely for compliance

### Role-Based Access
```typescript
const permissions = {
  'admin': ['*'],
  'manager': ['workflows.approve', 'reports.generate', 'users.view'],
  'billing_officer': ['bills.create', 'payments.process'],
  'clerk': ['workflows.view', 'documents.upload']
};

function hasPermission(userRole: string, action: string) {
  return permissions[userRole]?.includes(action) || 
         permissions[userRole]?.includes('*');
}
```

---

## 🚀 Deployment

### Environment Variables
```bash
# Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
SENDGRID_API_KEY=your_sendgrid_key

# Integrations
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase

STRIPE_PUBLIC_KEY=your_stripe_public
STRIPE_SECRET_KEY=your_stripe_secret

MFMA_API_KEY=your_mfma_key
MFMA_ENDPOINT=https://api.mfma.gov.za

# GIS
GIS_WFS_ENDPOINT=https://gis.municipality.gov.za/geoserver/wfs
```

### Supabase Edge Functions
Ensure all server routes are deployed:

```bash
supabase functions deploy make-server-4c8674b4
```

### Service Worker
Add service worker for push notifications:

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge
    })
  );
});
```

---

## 📈 Monitoring & Maintenance

### Automated Backups
```typescript
// Daily backup job
async function backupDatabase() {
  const allData = await kv.getByPrefix('');
  const backup = {
    timestamp: new Date().toISOString(),
    data: allData
  };
  
  // Store in Supabase Storage
  await supabase.storage
    .from('backups')
    .upload(`backup_${Date.now()}.json`, JSON.stringify(backup));
}
```

### Health Checks
```typescript
app.get('/make-server-4c8674b4/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    integrations: {
      database: 'connected',
      storage: 'connected',
      notifications: 'active'
    }
  });
});
```

### Monitoring Metrics
- Workflow completion rates
- Average approval time
- Notification delivery rates
- API response times
- Integration sync status

---

## 📚 Additional Resources

- [FSCA Portal](https://faisombud.co.za/) - Regulatory workflow inspiration
- [OGC Standards](https://www.ogc.org/standards) - GIS specifications
- [MFMA](https://www.treasury.gov.za/legislation/MFMA/) - Municipal Finance Management Act
- [PAIA](https://www.justice.gov.za/legislation/acts/2000-002.pdf) - Access to Information Act

---

## 🎯 Next Steps

1. **Configure Integrations**: Set up PayFast, MFMA, etc.
2. **Deploy Service Worker**: Enable push notifications
3. **Set Up Email**: Configure SendGrid or AWS SES
4. **Connect GIS Server**: Integrate actual WFS endpoints
5. **Create Workflows**: Define your approval processes
6. **Generate Reports**: Start tracking compliance
7. **Train Users**: Onboard staff with new features

---

## Support

For technical assistance:
- Email: support@municipality.gov.za
- Phone: +27 (0) 11 123 4567
- Portal: https://portal.municipality.gov.za/support
