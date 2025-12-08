import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { offlineSync } from '../utils/offlineSync'
import { toast } from 'sonner@2.0.3'

export function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<string>('idle')
  const [queueStats, setQueueStats] = useState({ total: 0, byType: {} })

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Update queue stats
    updateQueueStats()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online! Syncing pending changes...')
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('You are now offline. Changes will be synced when connection is restored.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for sync status updates
    const handleSyncStatus = (status: string) => {
      setSyncStatus(status)
      updateQueueStats()

      if (status === 'sync_complete') {
        toast.success('All pending changes have been synced!')
      } else if (status === 'sync_failed') {
        toast.error('Some changes could not be synced. Will retry later.')
      }
    }

    offlineSync.addListener(handleSyncStatus)

    // Periodic queue stats update
    const interval = setInterval(updateQueueStats, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      offlineSync.removeListener(handleSyncStatus)
      clearInterval(interval)
    }
  }, [])

  const updateQueueStats = () => {
    const stats = offlineSync.getQueueStats()
    setQueueStats(stats)
  }

  const handleManualSync = async () => {
    setSyncStatus('syncing')
    await offlineSync.syncPendingActions()
  }

  if (isOnline && queueStats.total === 0) {
    // Don't show indicator when online and no pending items
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className={`shadow-lg ${!isOnline ? 'border-orange-500' : queueStats.total > 0 ? 'border-blue-500' : ''}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-50' : 'bg-orange-50'
            }`}>
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </h3>
                {syncStatus === 'syncing' && (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                )}
              </div>

              <p className="text-xs text-gray-600 mb-2">
                {isOnline ? (
                  queueStats.total > 0 ? (
                    `${queueStats.total} pending ${queueStats.total === 1 ? 'action' : 'actions'}`
                  ) : (
                    'All changes synced'
                  )
                ) : (
                  'Working offline. Changes will sync when online.'
                )}
              </p>

              {queueStats.total > 0 && (
                <div className="space-y-1 mb-3">
                  {Object.entries(queueStats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                      <span className="text-gray-600 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isOnline && queueStats.total > 0 && (
                <Button
                  size="sm"
                  onClick={handleManualSync}
                  disabled={syncStatus === 'syncing'}
                  className="w-full"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              )}

              {!isOnline && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>You can continue working offline</span>
                </div>
              )}

              {isOnline && queueStats.total === 0 && syncStatus === 'sync_complete' && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All changes synced successfully</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
