import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { api } from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, AlertCircle, Activity } from 'lucide-react'
import { CarbonIntensityWidget } from './CarbonIntensityWidget'

export function TransparencyPortal() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadStats()
  }, [])
  
  const loadStats = async () => {
    try {
      const data = await api.getPublicStats()
      setStats(data.stats)
    } catch (error) {
      console.error('Error loading public stats:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transparency data...</div>
      </div>
    )
  }
  
  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    )
  }
  
  const statusData = Object.entries(stats.issues.byStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }))
  
  const categoryData = Object.entries(stats.issues.byCategory || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }))
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl mb-2">Public Transparency Portal</h1>
        <p className="opacity-90">
          Open data on municipal services, billing, and citizen engagement
        </p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Service Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.issues.total}</div>
            <p className="text-xs text-muted-foreground">
              Reported by citizens
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.payments.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.payments.onlinePayments} online • {stats.payments.inPersonPayments} in-person
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Revenue Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R {stats.payments.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Municipal billing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Convenience Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R {stats.payments.totalTransactionFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From online payments
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Environmental Impact */}
      <CarbonIntensityWidget />
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
            <CardDescription>Current state of service requests</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Service request breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Transparency Commitment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">✓</Badge>
            <div>
              <p className="font-medium">Real-time Data</p>
              <p className="text-sm text-gray-600">
                All statistics are updated in real-time as citizens interact with the system
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">✓</Badge>
            <div>
              <p className="font-medium">Anonymized Information</p>
              <p className="text-sm text-gray-600">
                Personal data is protected - only aggregate statistics are shown
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">✓</Badge>
            <div>
              <p className="font-medium">Open Access</p>
              <p className="text-sm text-gray-600">
                This portal is publicly accessible without requiring authentication
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">💰</Badge>
            <div>
              <p className="font-medium">Transparent Fee Structure</p>
              <p className="text-sm text-gray-600">
                Online payments incur a R5.00 convenience fee to cover processing costs. In-person payments at municipal offices are completely free.
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 pt-3 border-t">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
