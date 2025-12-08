import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Bell,
  Mail,
  Smartphone,
  Check,
  Clock,
  AlertCircle,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { api } from '../utils/api';

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    address: string;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    permission: 'granted' | 'denied' | 'default';
  };
  channels: {
    bills: boolean;
    payments: boolean;
    serviceRequests: boolean;
    workflows: boolean;
    deadlines: boolean;
    compliance: boolean;
    system: boolean;
  };
}

export interface NotificationItem {
  id: string;
  type: 'bill' | 'payment' | 'service_request' | 'workflow' | 'deadline' | 'compliance' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: any;
}

interface NotificationServiceProps {
  userId: string;
  onNotificationClick?: (notification: NotificationItem) => void;
}

export function NotificationService({ userId, onNotificationClick }: NotificationServiceProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      address: '',
      frequency: 'immediate'
    },
    push: {
      enabled: false,
      permission: 'default'
    },
    channels: {
      bills: true,
      payments: true,
      serviceRequests: true,
      workflows: true,
      deadlines: true,
      compliance: true,
      system: true
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadNotifications();
    checkPushPermission();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const response = await api.fetch('/notification-preferences');
      if (response.preferences) {
        setPreferences(response.preferences);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.fetch('/notifications');
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const checkPushPermission = async () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setPreferences(prev => ({
        ...prev,
        push: { ...prev.push, permission }
      }));
    }
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPreferences(prev => ({
        ...prev,
        push: { ...prev.push, permission }
      }));

      if (permission === 'granted') {
        // Subscribe to push notifications
        await subscribeToPush();
      }
    }
  };

  const subscribeToPush = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        // In production, use your VAPID public key
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'YOUR_VAPID_PUBLIC_KEY' // Replace with actual VAPID key
          )
        });

        // Send subscription to server
        await api.post('/push-subscription', { subscription });
        console.log('Push subscription successful');
      }
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      await api.post('/notification-preferences', { preferences });
      alert('Notification preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (path: string[], value: any) => {
    setPreferences(prev => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return updated;
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Center
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage your notification preferences and view alerts
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Notification Preferences</DialogTitle>
                  <DialogDescription>
                    Configure how and when you receive notifications
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <Label>Email Notifications</Label>
                      </div>
                      <Switch
                        checked={preferences.email.enabled}
                        onCheckedChange={(checked) => 
                          updatePreference(['email', 'enabled'], checked)
                        }
                      />
                    </div>

                    {preferences.email.enabled && (
                      <div className="ml-6 space-y-3">
                        <div>
                          <Label className="text-xs">Email Address</Label>
                          <Input
                            type="email"
                            value={preferences.email.address}
                            onChange={(e) => 
                              updatePreference(['email', 'address'], e.target.value)
                            }
                            placeholder="your@email.com"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Frequency</Label>
                          <select
                            value={preferences.email.frequency}
                            onChange={(e) => 
                              updatePreference(['email', 'frequency'], e.target.value)
                            }
                            className="w-full border rounded p-2 text-sm"
                          >
                            <option value="immediate">Immediate</option>
                            <option value="daily">Daily Digest</option>
                            <option value="weekly">Weekly Summary</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Push Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <Label>Push Notifications</Label>
                      </div>
                      <Switch
                        checked={preferences.push.enabled && preferences.push.permission === 'granted'}
                        onCheckedChange={(checked) => {
                          if (checked && preferences.push.permission !== 'granted') {
                            requestPushPermission();
                          } else {
                            updatePreference(['push', 'enabled'], checked);
                          }
                        }}
                      />
                    </div>

                    {preferences.push.permission !== 'granted' && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Push notifications are blocked. Click enable to request permission.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Separator />

                  {/* Notification Channels */}
                  <div className="space-y-3">
                    <Label>Notification Types</Label>
                    
                    {Object.entries(preferences.channels).map(([channel, enabled]) => (
                      <div key={channel} className="flex items-center justify-between">
                        <Label className="text-sm cursor-pointer">
                          {channel.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => 
                            updatePreference(['channels', channel], checked)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <Button onClick={savePreferences} disabled={isLoading} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No notifications</div>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => (
            <Card 
              key={notification.id}
              className={`cursor-pointer transition-colors ${
                !notification.read ? 'border-blue-300 bg-blue-50' : ''
              }`}
              onClick={() => {
                markAsRead(notification.id);
                onNotificationClick?.(notification);
              }}
            >
              <CardContent className="py-4">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 p-2 rounded ${getPriorityColor(notification.priority)}`}>
                    {getPriorityIcon(notification.priority)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                          <span>{notification.title}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {notification.message}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleString('en-ZA')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
