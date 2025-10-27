import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Storage bucket initialization
const BUCKET_NAME = 'make-4c8674b4-issue-photos'
const { data: buckets } = await supabase.storage.listBuckets()
const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
if (!bucketExists) {
  await supabase.storage.createBucket(BUCKET_NAME, { public: false })
}

// Helper function to create audit log
async function createAuditLog(userId: string, action: string, entityType: string, entityId: string, changes: any) {
  const timestamp = new Date().toISOString()
  const logId = `audit_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
  
  await kv.set(logId, {
    id: logId,
    userId,
    action,
    entityType,
    entityId,
    changes,
    timestamp,
  })
  
  console.log(`Audit log created: ${action} on ${entityType} ${entityId} by user ${userId}`)
}

// Helper function to verify user and get role
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return { user: null, error: 'No access token provided' }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }
  
  return { user, error: null }
}

// ============= AUTH ROUTES =============

app.post('/make-server-4c8674b4/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json()
    
    // Only allow 'citizen' role via public signup
    const userRole = role === 'admin' || role === 'billing_officer' || role === 'auditor' ? 'citizen' : 'citizen'
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: userRole,
        municipality: 'Default Municipality'
      },
      email_confirm: true // Automatically confirm since email server hasn't been configured
    })
    
    if (error) {
      console.log(`Signup error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }
    
    // Create user profile in KV store
    await kv.set(`user_${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: userRole,
      municipality: 'Default Municipality',
      createdAt: new Date().toISOString()
    })
    
    await createAuditLog('system', 'user_created', 'user', data.user.id, { email, name, role: userRole })
    
    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log(`Signup error: ${error}`)
    return c.json({ error: 'Signup failed' }, 500)
  }
})

app.post('/make-server-4c8674b4/create-admin', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json()
    
    // Verify requesting user is admin
    const { user: requestingUser, error: authError } = await verifyUser(c.req.raw)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const requestingUserData = await kv.get(`user_${requestingUser.id}`)
    if (requestingUserData?.role !== 'admin') {
      return c.json({ error: 'Only admins can create admin users' }, 403)
    }
    
    const validRoles = ['admin', 'billing_officer', 'auditor', 'supervisor']
    const userRole = validRoles.includes(role) ? role : 'billing_officer'
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: userRole,
        municipality: 'Default Municipality'
      },
      email_confirm: true
    })
    
    if (error) {
      console.log(`Admin creation error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }
    
    await kv.set(`user_${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: userRole,
      municipality: 'Default Municipality',
      createdAt: new Date().toISOString()
    })
    
    await createAuditLog(requestingUser.id, 'admin_user_created', 'user', data.user.id, { email, name, role: userRole })
    
    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log(`Admin creation error: ${error}`)
    return c.json({ error: 'Admin creation failed' }, 500)
  }
})

app.get('/make-server-4c8674b4/user-profile', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const profile = await kv.get(`user_${user.id}`)
    return c.json({ profile: profile || { id: user.id, email: user.email, role: 'citizen', ...user.user_metadata } })
  } catch (error) {
    console.log(`User profile fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// ============= BILLING ROUTES =============

app.get('/make-server-4c8674b4/bills', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const bills = await kv.getByPrefix(`bill_${user.id}_`)
    return c.json({ bills: bills || [] })
  } catch (error) {
    console.log(`Bills fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch bills' }, 500)
  }
})

app.post('/make-server-4c8674b4/generate-bill', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.raw)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'billing_officer'].includes(userData?.role)) {
      return c.json({ error: 'Unauthorized: Only billing officers can generate bills' }, 403)
    }
    
    const { citizenId, services, dueDate } = await c.req.json()
    
    const billId = `bill_${citizenId}_${Date.now()}`
    const total = services.reduce((sum: number, s: any) => sum + s.amount, 0)
    
    const bill = {
      id: billId,
      citizenId,
      services,
      total,
      dueDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: user.id
    }
    
    await kv.set(billId, bill)
    await createAuditLog(user.id, 'bill_generated', 'bill', billId, bill)
    
    return c.json({ success: true, bill })
  } catch (error) {
    console.log(`Bill generation error: ${error}`)
    return c.json({ error: 'Failed to generate bill' }, 500)
  }
})

// ============= PAYMENT ROUTES =============

app.post('/make-server-4c8674b4/payments', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const { billId, amount, method, transactionFee, totalWithFee } = await c.req.json()
    
    const paymentId = `payment_${user.id}_${Date.now()}`
    const payment = {
      id: paymentId,
      userId: user.id,
      billId,
      amount,
      method,
      transactionFee: transactionFee || 0,
      totalWithFee: totalWithFee || amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      receiptNumber: `RCP-${Date.now()}`
    }
    
    await kv.set(paymentId, payment)
    
    // Track transaction fee revenue separately
    if (transactionFee > 0) {
      const feeRecordId = `transaction_fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await kv.set(feeRecordId, {
        id: feeRecordId,
        paymentId,
        userId: user.id,
        amount: transactionFee,
        method,
        timestamp: new Date().toISOString()
      })
    }
    
    // Update bill status
    const bill = await kv.get(billId)
    if (bill) {
      bill.status = 'paid'
      bill.paidAt = new Date().toISOString()
      await kv.set(billId, bill)
    }
    
    await createAuditLog(user.id, 'payment_made', 'payment', paymentId, { ...payment, transactionFee, totalWithFee })
    
    return c.json({ success: true, payment })
  } catch (error) {
    console.log(`Payment processing error: ${error}`)
    return c.json({ error: 'Payment failed' }, 500)
  }
})

app.get('/make-server-4c8674b4/payments', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const payments = await kv.getByPrefix(`payment_${user.id}_`)
    return c.json({ payments: payments || [] })
  } catch (error) {
    console.log(`Payments fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch payments' }, 500)
  }
})

// ============= ISSUE REPORTING ROUTES =============

app.post('/make-server-4c8674b4/issues', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const { title, description, category, location, photoData } = await c.req.json()
    
    const issueId = `issue_${user.id}_${Date.now()}`
    let photoUrl = null
    
    // Upload photo if provided
    if (photoData) {
      const photoPath = `${user.id}/${issueId}.jpg`
      const base64Data = photoData.split(',')[1]
      const photoBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(photoPath, photoBuffer, { contentType: 'image/jpeg' })
      
      if (!uploadError) {
        const { data: signedUrlData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(photoPath, 60 * 60 * 24 * 365) // 1 year
        photoUrl = signedUrlData?.signedUrl
      }
    }
    
    const issue = {
      id: issueId,
      userId: user.id,
      title,
      description,
      category,
      location,
      photoUrl,
      status: 'open',
      createdAt: new Date().toISOString(),
      updates: []
    }
    
    await kv.set(issueId, issue)
    await createAuditLog(user.id, 'issue_created', 'issue', issueId, issue)
    
    return c.json({ success: true, issue })
  } catch (error) {
    console.log(`Issue creation error: ${error}`)
    return c.json({ error: 'Failed to create issue' }, 500)
  }
})

app.get('/make-server-4c8674b4/issues', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    
    if (['admin', 'billing_officer', 'supervisor'].includes(userData?.role)) {
      // Admin can see all issues
      const allIssues = await kv.getByPrefix('issue_')
      return c.json({ issues: allIssues || [] })
    } else {
      // Citizens see only their issues
      const issues = await kv.getByPrefix(`issue_${user.id}_`)
      return c.json({ issues: issues || [] })
    }
  } catch (error) {
    console.log(`Issues fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch issues' }, 500)
  }
})

app.post('/make-server-4c8674b4/issues/:id/update', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.raw)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'billing_officer', 'supervisor'].includes(userData?.role)) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const issueId = c.req.param('id')
    const { status, message } = await c.req.json()
    
    const issue = await kv.get(issueId)
    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404)
    }
    
    const update = {
      timestamp: new Date().toISOString(),
      status,
      message,
      updatedBy: user.id
    }
    
    issue.status = status
    issue.updates = [...(issue.updates || []), update]
    
    await kv.set(issueId, issue)
    await createAuditLog(user.id, 'issue_updated', 'issue', issueId, update)
    
    return c.json({ success: true, issue })
  } catch (error) {
    console.log(`Issue update error: ${error}`)
    return c.json({ error: 'Failed to update issue' }, 500)
  }
})

// ============= AUDIT LOG ROUTES =============

app.get('/make-server-4c8674b4/audit-logs', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.raw)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'auditor', 'supervisor'].includes(userData?.role)) {
      return c.json({ error: 'Unauthorized: Only auditors can view audit logs' }, 403)
    }
    
    const logs = await kv.getByPrefix('audit_')
    const sortedLogs = (logs || []).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    return c.json({ logs: sortedLogs })
  } catch (error) {
    console.log(`Audit logs fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch audit logs' }, 500)
  }
})

// ============= TRANSPARENCY/STATISTICS ROUTES =============

app.get('/make-server-4c8674b4/public-stats', async (c) => {
  try {
    const allIssues = await kv.getByPrefix('issue_')
    const allPayments = await kv.getByPrefix('payment_')
    const allTransactionFees = await kv.getByPrefix('transaction_fee_')
    
    const issuesByStatus = (allIssues || []).reduce((acc: any, issue: any) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    }, {})
    
    const issuesByCategory = (allIssues || []).reduce((acc: any, issue: any) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {})
    
    const totalRevenue = (allPayments || []).reduce((sum: number, payment: any) => 
      sum + (payment.amount || 0), 0
    )
    
    const totalTransactionFees = (allTransactionFees || []).reduce((sum: number, fee: any) => 
      sum + (fee.amount || 0), 0
    )
    
    const onlinePayments = (allPayments || []).filter((p: any) => p.method !== 'in-person').length
    const inPersonPayments = (allPayments || []).filter((p: any) => p.method === 'in-person').length
    
    const stats = {
      issues: {
        total: allIssues?.length || 0,
        byStatus: issuesByStatus,
        byCategory: issuesByCategory
      },
      payments: {
        total: allPayments?.length || 0,
        totalRevenue,
        onlinePayments,
        inPersonPayments,
        totalTransactionFees,
        averageFeePerOnlinePayment: onlinePayments > 0 ? totalTransactionFees / onlinePayments : 0
      },
      lastUpdated: new Date().toISOString()
    }
    
    return c.json({ stats })
  } catch (error) {
    console.log(`Public stats fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// ============= TRANSACTION FEE ROUTES =============

app.get('/make-server-4c8674b4/transaction-fees', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.raw)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'billing_officer', 'auditor'].includes(userData?.role)) {
      return c.json({ error: 'Unauthorized: Only admins can view transaction fee data' }, 403)
    }
    
    const allFees = await kv.getByPrefix('transaction_fee_')
    const sortedFees = (allFees || []).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    const totalRevenue = (allFees || []).reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0)
    
    const feesByMethod = (allFees || []).reduce((acc: any, fee: any) => {
      acc[fee.method] = (acc[fee.method] || 0) + fee.amount
      return acc
    }, {})
    
    return c.json({ 
      fees: sortedFees,
      summary: {
        totalRevenue,
        totalTransactions: allFees?.length || 0,
        feesByMethod,
        averageFee: allFees?.length ? totalRevenue / allFees.length : 0
      }
    })
  } catch (error) {
    console.log(`Transaction fees fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch transaction fees' }, 500)
  }
})

// ============= NOTIFICATIONS ROUTES =============

app.get('/make-server-4c8674b4/notifications', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const notifications = await kv.getByPrefix(`notification_${user.id}_`)
    const sortedNotifications = (notifications || []).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    return c.json({ notifications: sortedNotifications })
  } catch (error) {
    console.log(`Notifications fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
})

app.post('/make-server-4c8674b4/notifications/:id/read', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const notificationId = c.req.param('id')
    const notification = await kv.get(notificationId)
    
    if (!notification || notification.userId !== user.id) {
      return c.json({ error: 'Notification not found' }, 404)
    }
    
    notification.read = true
    await kv.set(notificationId, notification)
    
    return c.json({ success: true })
  } catch (error) {
    console.log(`Notification mark read error: ${error}`)
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
})

Deno.serve(app.fetch)
