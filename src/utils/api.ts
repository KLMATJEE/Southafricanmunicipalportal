import { projectId, publicAnonKey } from './supabase/info'

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4c8674b4`

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token')
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    console.error(`API request error for ${endpoint}:`, error)
    throw new Error(error.error || 'Request failed')
  }
  
  return response.json()
}

export const api = {
  // Auth
  signup: (data: any) => apiRequest('/signup', { method: 'POST', body: JSON.stringify(data) }),
  getUserProfile: () => apiRequest('/user-profile'),
  createAdmin: (data: any) => apiRequest('/create-admin', { method: 'POST', body: JSON.stringify(data) }),
  createVerifiedUser: (data: any) => apiRequest('/create-verified-user', { method: 'POST', body: JSON.stringify(data) }),
  
  // Bills
  getBills: () => apiRequest('/bills'),
  generateBill: (data: any) => apiRequest('/generate-bill', { method: 'POST', body: JSON.stringify(data) }),
  
  // Payments
  getPayments: () => apiRequest('/payments'),
  makePayment: (data: any) => apiRequest('/payments', { method: 'POST', body: JSON.stringify(data) }),
  
  // Issues
  getIssues: () => apiRequest('/issues'),
  createIssue: (data: any) => apiRequest('/issues', { method: 'POST', body: JSON.stringify(data) }),
  updateIssue: (id: string, data: any) => apiRequest(`/issues/${id}/update`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Audit
  getAuditLogs: () => apiRequest('/audit-logs'),
  
  // Stats
  getPublicStats: () => apiRequest('/public-stats'),
  
  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
  
  // Transaction Fees
  getTransactionFees: () => apiRequest('/transaction-fees'),
  
  // E-Participation
  getForums: () => apiRequest('/forums'),
  createDiscussion: (data: any) => apiRequest('/forums', { method: 'POST', body: JSON.stringify(data) }),
  getPolls: () => apiRequest('/polls'),
  createPoll: (data: any) => apiRequest('/polls', { method: 'POST', body: JSON.stringify(data) }),
  votePoll: (pollId: string, optionIndex: number) => apiRequest(`/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ optionIndex }) }),
  getFeedback: () => apiRequest('/feedback'),
  submitFeedback: (data: any) => apiRequest('/feedback', { method: 'POST', body: JSON.stringify(data) }),
  
  // Procurement
  getTenders: () => apiRequest('/tenders'),
  createTender: (data: any) => apiRequest('/tenders', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => apiRequest('/suppliers'),
  registerSupplier: (data: any) => apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  getContracts: () => apiRequest('/contracts'),
  createContract: (data: any) => apiRequest('/contracts', { method: 'POST', body: JSON.stringify(data) }),
  
  // Workflows
  getWorkflows: () => apiRequest('/workflows'),
  createWorkflow: (data: any) => apiRequest('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  performWorkflowAction: (id: string, data: any) => apiRequest(`/workflows/${id}/action`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Reports
  generateReport: (config: any) => apiRequest('/reports/generate', { method: 'POST', body: JSON.stringify({ config }) }),
  downloadReport: (id: string) => apiRequest(`/reports/${id}/download`),
  
  // Notification Preferences
  getNotificationPreferences: () => apiRequest('/notification-preferences'),
  updateNotificationPreferences: (preferences: any) => apiRequest('/notification-preferences', { method: 'POST', body: JSON.stringify({ preferences }) }),
  subscribeToPush: (subscription: any) => apiRequest('/push-subscription', { method: 'POST', body: JSON.stringify({ subscription }) }),
  
  // Generic fetch and post for flexibility
  fetch: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
}
