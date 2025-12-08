import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import {
  Receipt,
  AlertCircle,
  MessageSquare,
  FileText,
  Search,
  Bell,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react'
import { Language, getTranslation } from '../utils/translations'

interface UnifiedServicePortalProps {
  user: any
  bills: any[]
  issues: any[]
  notifications: any[]
  language: Language
  onNavigate: (section: string) => void
}

export function UnifiedServicePortal({
  user,
  bills,
  issues,
  notifications,
  language,
  onNavigate,
}: UnifiedServicePortalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const t = (key: string) => getTranslation(language, key)

  // Quick stats
  const unpaidBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue').length
  const activeIssues = issues.filter(i => i.status !== 'resolved').length
  const unreadNotifications = notifications.filter(n => !n.read).length

  // Recent activity combining bills, issues, and notifications
  const recentActivity = [
    ...bills.slice(0, 2).map(b => ({
      type: 'bill',
      title: `${t('bill')}: R${b.amount}`,
      description: `${t('dueDate')}: ${new Date(b.dueDate).toLocaleDateString()}`,
      status: b.status,
      date: b.createdAt,
      icon: Receipt,
    })),
    ...issues.slice(0, 2).map(i => ({
      type: 'issue',
      title: i.type,
      description: i.description.substring(0, 50) + '...',
      status: i.status,
      date: i.createdAt,
      icon: AlertCircle,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const quickAccessCards = [
    {
      title: t('bills'),
      description: `${unpaidBills} ${t('pending')}`,
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => onNavigate('billing'),
      count: unpaidBills,
    },
    {
      title: t('issues'),
      description: `${activeIssues} ${t('pending')}`,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => onNavigate('issues'),
      count: activeIssues,
    },
    {
      title: t('participation'),
      description: t('community'),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => onNavigate('participation'),
      count: 0,
    },
    {
      title: t('procurement'),
      description: t('tenders'),
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => onNavigate('procurement'),
      count: 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">{t('unifiedServices')}</h1>
        <p className="text-gray-600">{t('allServices')}</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={`${t('search')} ${t('services').toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('bills')}</p>
                <p className="text-2xl mt-1">{unpaidBills}</p>
                <p className="text-xs text-gray-500 mt-1">{t('pending')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('issues')}</p>
                <p className="text-2xl mt-1">{activeIssues}</p>
                <p className="text-xs text-gray-500 mt-1">{t('pending')}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('notifications')}</p>
                <p className="text-2xl mt-1">{unreadNotifications}</p>
                <p className="text-xs text-gray-500 mt-1">Unread</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="mb-4">{t('quickAccess')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessCards.map((card, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={card.action}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  {card.count > 0 && (
                    <Badge variant="destructive">{card.count}</Badge>
                  )}
                </div>
                <h3 className="text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
          <CardDescription>Your latest transactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'bill' ? 'bg-blue-50' : 'bg-orange-50'
                  }`}>
                    <activity.icon className={`w-5 h-5 ${
                      activity.type === 'bill' ? 'text-blue-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm truncate">{activity.title}</h4>
                      <Badge
                        variant={
                          activity.status === 'paid' || activity.status === 'resolved'
                            ? 'default'
                            : activity.status === 'overdue'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()} at{' '}
                      {new Date(activity.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile-Friendly Tabs for Services */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t('dashboard')}</TabsTrigger>
              <TabsTrigger value="bills">{t('bills')}</TabsTrigger>
              <TabsTrigger value="issues">{t('issues')}</TabsTrigger>
              <TabsTrigger value="community">{t('community')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Bills</p>
                  <p className="text-2xl">{bills.length}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-2xl">{issues.length}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bills">
              <div className="space-y-3">
                {bills.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm">Bill #{bill.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{bill.status}</Badge>
                    </div>
                    <p className="text-lg">R{bill.amount.toFixed(2)}</p>
                  </div>
                ))}
                <Button onClick={() => onNavigate('billing')} className="w-full">
                  View All Bills
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="issues">
              <div className="space-y-3">
                {issues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm">{issue.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{issue.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {issue.description.substring(0, 80)}...
                    </p>
                  </div>
                ))}
                <Button onClick={() => onNavigate('issues')} className="w-full">
                  View All Issues
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="community">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Join community discussions</p>
                <Button onClick={() => onNavigate('participation')}>
                  Go to E-Participation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
