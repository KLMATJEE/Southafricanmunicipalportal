import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { api } from '../utils/api'
import { Bell, BellOff, CheckCircle2, AlertCircle, Info } from 'lucide-react'

interface NotificationCenterProps {
  notifications: any[]
  onNotificationRead: () => void
}

export function NotificationCenter({ notifications, onNotificationRead }: NotificationCenterProps) {
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id)
      onNotificationRead()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Stay updated on your account activity</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
