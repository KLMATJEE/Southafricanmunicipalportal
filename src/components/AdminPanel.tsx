import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { api } from '../utils/api'
import { Users, FileText, Shield, Plus, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import { AuditLogViewer } from './AuditLogViewer'

interface AdminPanelProps {
  user: any
}

export function AdminPanel({ user }: AdminPanelProps) {
  const [issues, setIssues] = useState<any[]>([])
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [transactionFeeSummary, setTransactionFeeSummary] = useState<any>(null)
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'billing_officer',
  })
  
  const [newBill, setNewBill] = useState({
    citizenId: '',
    services: [{ name: 'Water', amount: 0 }, { name: 'Electricity', amount: 0 }],
    dueDate: '',
  })
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const issuesData = await api.getIssues()
      setIssues(issuesData.issues || [])
      
      // Load transaction fee data if user has permission
      if (['admin', 'billing_officer', 'auditor'].includes(user.role)) {
        try {
          const feeData = await api.getTransactionFees()
          setTransactionFeeSummary(feeData.summary)
        } catch (error) {
          console.error('Error loading transaction fee data:', error)
        }
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createAdmin(newUser)
      setShowCreateUserDialog(false)
      setNewUser({ email: '', password: '', name: '', role: 'billing_officer' })
      alert('User created successfully')
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user')
    }
  }
  
  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.generateBill(newBill)
      setShowBillDialog(false)
      setNewBill({
        citizenId: '',
        services: [{ name: 'Water', amount: 0 }, { name: 'Electricity', amount: 0 }],
        dueDate: '',
      })
      alert('Bill generated successfully')
    } catch (error) {
      console.error('Error generating bill:', error)
      alert('Failed to generate bill')
    }
  }
  
  const handleUpdateIssue = async (issueId: string, status: string, message: string) => {
    try {
      await api.updateIssue(issueId, { status, message })
      loadData()
    } catch (error) {
      console.error('Error updating issue:', error)
      alert('Failed to update issue')
    }
  }
  
  const openIssues = issues.filter(i => i.status === 'open')
  const inProgressIssues = issues.filter(i => i.status === 'in_progress')
  const resolvedIssues = issues.filter(i => i.status === 'resolved')
  
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Open Issues</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{openIssues.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{inProgressIssues.length}</div>
            <p className="text-xs text-muted-foreground">Being resolved</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{resolvedIssues.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        {transactionFeeSummary && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Fee Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">R {transactionFeeSummary.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{transactionFeeSummary.totalTransactions} transactions</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Admin Tabs */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Issue Management</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          {['admin', 'billing_officer', 'auditor'].includes(user.role) && (
            <TabsTrigger value="revenue">Fee Revenue</TabsTrigger>
          )}
          {user.role === 'admin' && (
            <TabsTrigger value="users">User Management</TabsTrigger>
          )}
          {['admin', 'auditor', 'supervisor'].includes(user.role) && (
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Service Requests</CardTitle>
              <CardDescription>Manage and respond to citizen issues</CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No issues to display
                </div>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{issue.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Location: {issue.location} • Category: {issue.category}
                          </p>
                        </div>
                        <Badge variant={
                          issue.status === 'open' ? 'destructive' :
                          issue.status === 'in_progress' ? 'default' :
                          'secondary'
                        }>
                          {issue.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        {issue.status === 'open' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateIssue(issue.id, 'in_progress', 'We are working on this issue')}
                          >
                            Start Working
                          </Button>
                        )}
                        {issue.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateIssue(issue.id, 'resolved', 'This issue has been resolved')}
                          >
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bill Generation</CardTitle>
                  <CardDescription>Create and manage citizen bills</CardDescription>
                </div>
                <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate New Bill</DialogTitle>
                      <DialogDescription>Create a bill for a citizen</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleGenerateBill} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="citizenId">Citizen ID</Label>
                        <Input
                          id="citizenId"
                          value={newBill.citizenId}
                          onChange={(e) => setNewBill({ ...newBill, citizenId: e.target.value })}
                          placeholder="Enter citizen user ID"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Services</Label>
                        {newBill.services.map((service, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={service.name}
                              onChange={(e) => {
                                const newServices = [...newBill.services]
                                newServices[idx].name = e.target.value
                                setNewBill({ ...newBill, services: newServices })
                              }}
                              placeholder="Service name"
                            />
                            <Input
                              type="number"
                              value={service.amount}
                              onChange={(e) => {
                                const newServices = [...newBill.services]
                                newServices[idx].amount = parseFloat(e.target.value) || 0
                                setNewBill({ ...newBill, services: newServices })
                              }}
                              placeholder="Amount (R)"
                              step="0.01"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newBill.dueDate}
                          onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Generate Bill
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Use the "Generate Bill" button to create new bills for citizens. Bills will be visible in their dashboard.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {['admin', 'billing_officer', 'auditor'].includes(user.role) && (
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Fee Revenue</CardTitle>
                <CardDescription>Micro-revenue from online payment convenience fees</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionFeeSummary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-3xl">R {transactionFeeSummary.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Total Transactions</p>
                        <p className="text-3xl">{transactionFeeSummary.totalTransactions}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Average Fee</p>
                        <p className="text-3xl">R {transactionFeeSummary.averageFee.toFixed(2)}</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-gray-600">Revenue by Method</p>
                        <div className="mt-2 space-y-1">
                          {Object.entries(transactionFeeSummary.feesByMethod || {}).map(([method, amount]: [string, any]) => (
                            <p key={method} className="text-sm">
                              <span className="capitalize">{method}:</span> R {amount.toFixed(2)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-900 mb-2">📊 Fee Structure</p>
                      <p className="text-sm text-gray-700">Online payments (Card, EFT, PayFast, Stripe): <strong>R5.00 per transaction</strong></p>
                      <p className="text-sm text-gray-700">In-person payments: <strong>FREE</strong> (promotes transparency)</p>
                      <p className="text-sm text-gray-700 mt-2">This micro-revenue model helps cover payment processing costs while offering citizens a free alternative.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Loading transaction fee data...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {user.role === 'admin' && (
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Create and manage staff accounts</CardDescription>
                  </div>
                  <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Staff Account</DialogTitle>
                        <DialogDescription>Add a new admin or staff member</DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="billing_officer">Billing Officer</SelectItem>
                              <SelectItem value="auditor">Auditor</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button type="submit" className="w-full">
                          Create User
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Admin:</strong> Full system access</p>
                  <p><strong>Billing Officer:</strong> Generate and manage bills</p>
                  <p><strong>Auditor:</strong> View audit logs and reports</p>
                  <p><strong>Supervisor:</strong> Manage service requests</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {['admin', 'auditor', 'supervisor'].includes(user.role) && (
          <TabsContent value="audit" className="space-y-4">
            <AuditLogViewer />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
