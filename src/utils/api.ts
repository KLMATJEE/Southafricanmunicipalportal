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
}
