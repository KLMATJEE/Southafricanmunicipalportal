// Offline sync utilities for rural areas with poor connectivity

export interface PendingAction {
  id: string
  type: 'bill_payment' | 'issue_report' | 'forum_post' | 'poll_vote' | 'feedback'
  data: any
  timestamp: number
  retries: number
}

const STORAGE_KEY = 'municipal_portal_offline_queue'
const MAX_RETRIES = 3

export class OfflineSync {
  private static instance: OfflineSync
  private syncInProgress = false
  private listeners: Array<(status: string) => void> = []

  private constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', () => this.syncPendingActions())
      window.addEventListener('offline', () => this.notifyListeners('offline'))
      
      // Check if we're online and sync on page load
      if (navigator.onLine) {
        setTimeout(() => this.syncPendingActions(), 1000)
      }
    }
  }

  static getInstance(): OfflineSync {
    if (!OfflineSync.instance) {
      OfflineSync.instance = new OfflineSync()
    }
    return OfflineSync.instance
  }

  // Add a listener for sync status updates
  addListener(callback: (status: string) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (status: string) => void) {
    this.listeners = this.listeners.filter((l) => l !== callback)
  }

  private notifyListeners(status: string) {
    this.listeners.forEach((listener) => listener(status))
  }

  // Check if we're online
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  // Get all pending actions
  getPendingActions(): PendingAction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading offline queue:', error)
      return []
    }
  }

  // Add an action to the offline queue
  async addPendingAction(type: PendingAction['type'], data: any): Promise<void> {
    const action: PendingAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    }

    const queue = this.getPendingActions()
    queue.push(action)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
      console.log('Action queued for offline sync:', action.id)
      this.notifyListeners('queued')

      // Try to sync immediately if online
      if (this.isOnline()) {
        await this.syncPendingActions()
      }
    } catch (error) {
      console.error('Error adding to offline queue:', error)
      throw error
    }
  }

  // Remove an action from the queue
  private removeAction(actionId: string): void {
    const queue = this.getPendingActions()
    const filtered = queue.filter((action) => action.id !== actionId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }

  // Update retry count for an action
  private updateRetryCount(actionId: string): void {
    const queue = this.getPendingActions()
    const updated = queue.map((action) => {
      if (action.id === actionId) {
        return { ...action, retries: action.retries + 1 }
      }
      return action
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Sync all pending actions
  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline()) {
      return
    }

    this.syncInProgress = true
    this.notifyListeners('syncing')

    const queue = this.getPendingActions()
    console.log(`Syncing ${queue.length} pending actions...`)

    let successCount = 0
    let failureCount = 0

    for (const action of queue) {
      try {
        await this.processAction(action)
        this.removeAction(action.id)
        successCount++
        console.log(`Successfully synced action: ${action.id}`)
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error)
        
        if (action.retries >= MAX_RETRIES) {
          // Remove action after max retries
          this.removeAction(action.id)
          console.log(`Removed action ${action.id} after max retries`)
        } else {
          // Increment retry count
          this.updateRetryCount(action.id)
        }
        failureCount++
      }
    }

    this.syncInProgress = false

    if (successCount > 0) {
      this.notifyListeners('sync_complete')
      console.log(`Sync complete: ${successCount} succeeded, ${failureCount} failed`)
    } else if (failureCount > 0) {
      this.notifyListeners('sync_failed')
    }
  }

  // Process a single action by calling the appropriate API
  private async processAction(action: PendingAction): Promise<void> {
    // Import api at runtime to avoid circular dependencies
    const { api } = await import('./api')

    switch (action.type) {
      case 'bill_payment':
        await api.makePayment(action.data)
        break
      case 'issue_report':
        await api.createIssue(action.data)
        break
      case 'forum_post':
        await api.createDiscussion(action.data)
        break
      case 'poll_vote':
        await api.votePoll(action.data.pollId, action.data.optionIndex)
        break
      case 'feedback':
        await api.submitFeedback(action.data)
        break
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // Clear all pending actions (for testing/admin purposes)
  clearQueue(): void {
    localStorage.removeItem(STORAGE_KEY)
    this.notifyListeners('cleared')
  }

  // Get queue statistics
  getQueueStats(): { total: number; byType: Record<string, number> } {
    const queue = this.getPendingActions()
    const byType: Record<string, number> = {}

    queue.forEach((action) => {
      byType[action.type] = (byType[action.type] || 0) + 1
    })

    return {
      total: queue.length,
      byType,
    }
  }
}

// Cache management for offline access
export class CacheManager {
  private static readonly CACHE_NAME = 'municipal-portal-v1'
  private static readonly CACHE_URLS = [
    '/',
    '/styles/globals.css',
    // Add more URLs to cache as needed
  ]

  // Cache essential resources
  static async cacheResources(): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME)
        await cache.addAll(this.CACHE_URLS)
        console.log('Resources cached successfully')
      } catch (error) {
        console.error('Failed to cache resources:', error)
      }
    }
  }

  // Get cached response or fetch from network
  static async fetchWithCache(url: string): Promise<Response> {
    if ('caches' in window) {
      const cachedResponse = await caches.match(url)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    return fetch(url)
  }

  // Clear cache
  static async clearCache(): Promise<void> {
    if ('caches' in window) {
      await caches.delete(this.CACHE_NAME)
      console.log('Cache cleared')
    }
  }
}

// Export singleton instance
export const offlineSync = OfflineSync.getInstance()
