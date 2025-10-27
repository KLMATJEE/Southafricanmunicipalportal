import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { api } from '../utils/api'
import { FileText, CreditCard, AlertCircle, Bell, Download, DollarSign } from 'lucide-react'
import { BillingPortal } from './BillingPortal'
import { IssueReporting } from './IssueReporting'
import { NotificationCenter } from './NotificationCenter'

interface CitizenDashboardProps {
  user: any
}

export function CitizenDashboard({ user }: CitizenDashboardProps) {
  const [bills, setBills] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [billsData, paymentsData, issuesData, notificationsData] = await Promise.all([
        api.getBills(),
        api.getPayments(),
        api.getIssues(),
        api.getNotifications(),
      ])
      
      setBills(billsData.bills || [])
      setPayments(paymentsData.payments || [])
      setIssues(issuesData.issues || [])
      setNotifications(notificationsData.notifications || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const pendingBills = bills.filter(b => b.status === 'pending')
  const totalDue = pendingBills.reduce((sum, bill) => sum + bill.total, 0)
  const unreadNotifications = notifications.filter(n => !n.read).length
  const openIssues = issues.filter(i => i.status === 'open').length
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your dashboard...</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Outstanding Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R {totalDue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingBills.length} unpaid bill{pendingBills.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{payments.length}</div>
            <p className="text-xs text-muted-foreground">
              Transactions completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{openIssues}</div>
            <p className="text-xs text-muted-foreground">
              Service requests pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="bills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bills">Bills & Payments</TabsTrigger>
          <TabsTrigger value="issues">Service Requests</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bills" className="space-y-4">
          <BillingPortal 
            bills={bills} 
            payments={payments} 
            onPaymentComplete={loadData}
          />
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-4">
          <IssueReporting 
            issues={issues} 
            onIssueCreated={loadData}
          />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <NotificationCenter 
            notifications={notifications}
            onNotificationRead={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
