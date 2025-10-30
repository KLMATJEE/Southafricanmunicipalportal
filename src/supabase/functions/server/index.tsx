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
    const userRole = "citizen"//
    
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
    return c.json({ profile: profile || { id: user.id, email: user.email, role: user.user_metadata?.role ||'citizen', ...user.user_metadata } })
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

// ============= E-PARTICIPATION ROUTES =============

// Forums/Discussions
app.get('/make-server-4c8674b4/forums', async (c) => {
  try {
    const forums = await kv.getByPrefix('forum_')
    const sortedForums = (forums || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return c.json({ forums: sortedForums })
  } catch (error) {
    console.log(`Forums fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch forums' }, 500)
  }
})

app.post('/make-server-4c8674b4/forums', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const { title, content, category } = await c.req.json()
    const forumId = `forum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const userData = await kv.get(`user_${user.id}`)
    
    const forum = {
      id: forumId,
      authorId: user.id,
      authorName: userData?.name || 'Anonymous',
      title,
      content,
      category,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    }
    
    await kv.set(forumId, forum)
    await createAuditLog(user.id, 'forum_created', 'forum', forumId, forum)
    
    return c.json({ success: true, forum })
  } catch (error) {
    console.log(`Forum creation error: ${error}`)
    return c.json({ error: 'Failed to create discussion' }, 500)
  }
})

// Polls
app.get('/make-server-4c8674b4/polls', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const polls = await kv.getByPrefix('poll_')
    
    // Check if user voted on each poll
    const pollsWithUserVote = await Promise.all(
      (polls || []).map(async (poll: any) => {
        const userVote = await kv.get(`poll_vote_${poll.id}_${user.id}`)
        return {
          ...poll,
          userVoted: !!userVote,
          active: new Date(poll.endsAt) > new Date(),
        }
      })
    )
    
    return c.json({ polls: pollsWithUserVote })
  } catch (error) {
    console.log(`Polls fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch polls' }, 500)
  }
})

app.post('/make-server-4c8674b4/polls', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'supervisor'].includes(userData?.role)) {
      return c.json({ error: 'Only admins can create polls' }, 403)
    }
    
    const { question, options, endsAt } = await c.req.json()
    const pollId = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const poll = {
      id: pollId,
      question,
      options: options.map((text: string) => ({ text, votes: 0 })),
      totalVotes: 0,
      endsAt,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    }
    
    await kv.set(pollId, poll)
    await createAuditLog(user.id, 'poll_created', 'poll', pollId, poll)
    
    return c.json({ success: true, poll })
  } catch (error) {
    console.log(`Poll creation error: ${error}`)
    return c.json({ error: 'Failed to create poll' }, 500)
  }
})

app.post('/make-server-4c8674b4/polls/:id/vote', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const pollId = c.req.param('id')
    const { optionIndex } = await c.req.json()
    
    // Check if user already voted
    const existingVote = await kv.get(`poll_vote_${pollId}_${user.id}`)
    if (existingVote) {
      return c.json({ error: 'You have already voted on this poll' }, 400)
    }
    
    const poll = await kv.get(pollId)
    if (!poll) {
      return c.json({ error: 'Poll not found' }, 404)
    }
    
    if (new Date(poll.endsAt) < new Date()) {
      return c.json({ error: 'Poll has ended' }, 400)
    }
    
    // Record vote
    poll.options[optionIndex].votes += 1
    poll.totalVotes += 1
    await kv.set(pollId, poll)
    
    // Mark that user voted
    await kv.set(`poll_vote_${pollId}_${user.id}`, {
      pollId,
      userId: user.id,
      optionIndex,
      timestamp: new Date().toISOString(),
    })
    
    await createAuditLog(user.id, 'poll_voted', 'poll', pollId, { optionIndex })
    
    return c.json({ success: true, poll })
  } catch (error) {
    console.log(`Poll vote error: ${error}`)
    return c.json({ error: 'Failed to record vote' }, 500)
  }
})

// Feedback
app.get('/make-server-4c8674b4/feedback', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    
    if (['admin', 'supervisor'].includes(userData?.role)) {
      // Admins see all feedback
      const allFeedback = await kv.getByPrefix('feedback_')
      return c.json({ feedback: allFeedback || [] })
    } else {
      // Citizens see only their feedback
      const feedback = await kv.getByPrefix(`feedback_${user.id}_`)
      return c.json({ feedback: feedback || [] })
    }
  } catch (error) {
    console.log(`Feedback fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch feedback' }, 500)
  }
})

app.post('/make-server-4c8674b4/feedback', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const { category, subject, message, rating } = await c.req.json()
    const feedbackId = `feedback_${user.id}_${Date.now()}`
    
    const feedback = {
      id: feedbackId,
      userId: user.id,
      category,
      subject,
      message,
      rating,
      response: null,
      createdAt: new Date().toISOString(),
    }
    
    await kv.set(feedbackId, feedback)
    await createAuditLog(user.id, 'feedback_submitted', 'feedback', feedbackId, feedback)
    
    return c.json({ success: true, feedback })
  } catch (error) {
    console.log(`Feedback submission error: ${error}`)
    return c.json({ error: 'Failed to submit feedback' }, 500)
  }
})

// ============= PROCUREMENT ROUTES =============

// Tenders
app.get('/make-server-4c8674b4/tenders', async (c) => {
  try {
    const tenders = await kv.getByPrefix('tender_')
    const sortedTenders = (tenders || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return c.json({ tenders: sortedTenders })
  } catch (error) {
    console.log(`Tenders fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch tenders' }, 500)
  }
})

app.post('/make-server-4c8674b4/tenders', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'supervisor'].includes(userData?.role)) {
      return c.json({ error: 'Only admins can create tenders' }, 403)
    }
    
    const { title, description, category, number, estimatedValue, deadline } = await c.req.json()
    const tenderId = `tender_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const tender = {
      id: tenderId,
      number,
      title,
      description,
      category,
      estimatedValue,
      deadline,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    }
    
    await kv.set(tenderId, tender)
    await createAuditLog(user.id, 'tender_created', 'tender', tenderId, tender)
    
    return c.json({ success: true, tender })
  } catch (error) {
    console.log(`Tender creation error: ${error}`)
    return c.json({ error: 'Failed to create tender' }, 500)
  }
})

// Suppliers
app.get('/make-server-4c8674b4/suppliers', async (c) => {
  try {
    const suppliers = await kv.getByPrefix('supplier_')
    return c.json({ suppliers: suppliers || [] })
  } catch (error) {
    console.log(`Suppliers fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch suppliers' }, 500)
  }
})

app.post('/make-server-4c8674b4/suppliers', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'supervisor'].includes(userData?.role)) {
      return c.json({ error: 'Only admins can register suppliers' }, 403)
    }
    
    const data = await c.req.json()
    const supplierId = `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const supplier = {
      id: supplierId,
      ...data,
      status: 'active',
      rating: data.rating || 0,
      completedProjects: data.completedProjects || 0,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    }
    
    await kv.set(supplierId, supplier)
    await createAuditLog(user.id, 'supplier_registered', 'supplier', supplierId, supplier)
    
    return c.json({ success: true, supplier })
  } catch (error) {
    console.log(`Supplier registration error: ${error}`)
    return c.json({ error: 'Failed to register supplier' }, 500)
  }
})

// Contracts
app.get('/make-server-4c8674b4/contracts', async (c) => {
  try {
    const contracts = await kv.getByPrefix('contract_')
    const sortedContracts = (contracts || []).sort((a: any, b: any) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    return c.json({ contracts: sortedContracts })
  } catch (error) {
    console.log(`Contracts fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch contracts' }, 500)
  }
})

app.post('/make-server-4c8674b4/contracts', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    if (!['admin', 'supervisor'].includes(userData?.role)) {
      return c.json({ error: 'Only admins can create contracts' }, 403)
    }
    
    const data = await c.req.json()
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const contract = {
      id: contractId,
      ...data,
      paidAmount: data.paidAmount || 0,
      milestones: data.milestones || [],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    }
    
    await kv.set(contractId, contract)
    await createAuditLog(user.id, 'contract_created', 'contract', contractId, contract)
    
    return c.json({ success: true, contract })
  } catch (error) {
    console.log(`Contract creation error: ${error}`)
    return c.json({ error: 'Failed to create contract' }, 500)
  }
})

Deno.serve(app.fetch)
