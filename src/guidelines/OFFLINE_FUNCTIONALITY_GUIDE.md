# 📡 Offline Functionality Guide

## Overview

The SA Municipal Portal includes offline sync capabilities designed for rural areas with poor or intermittent connectivity. This guide explains how the system works and how to configure it.

---

## 🔧 How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│  (Pay bill, report issue, vote on poll, etc.)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              Is Online? ─────No────> Queue in LocalStorage
                     │                        │
                    Yes                       │
                     │                        │
                     ▼                        ▼
              Send to Server          Store for later sync
                     │                        │
                     │                        │
                     ▼                        ▼
              Success/Error           Auto-sync when online
```

### Components

1. **OfflineSync Class** (`/utils/offlineSync.ts`)
   - Manages offline queue
   - Auto-detects online/offline status
   - Syncs actions when connection restored
   - Provides retry logic (max 3 attempts)

2. **CacheManager Class** (`/utils/offlineSync.ts`)
   - Caches static resources
   - Provides cache-first fallback
   - Manages cache versioning

3. **OfflineSyncIndicator** (`/components/OfflineSyncIndicator.tsx`)
   - Visual status indicator
   - Manual sync button
   - Queue statistics display

---

## 🚀 Supported Actions

The following actions can be queued for offline sync:

| Action Type | Description | API Endpoint |
|-------------|-------------|--------------|
| `bill_payment` | Pay a bill | `POST /payments` |
| `issue_report` | Report municipal issue | `POST /issues` |
| `forum_post` | Create discussion | `POST /forums` |
| `poll_vote` | Vote on poll | `POST /polls/:id/vote` |
| `feedback` | Submit feedback | `POST /feedback` |

---

## 📋 Current Configuration

### Cache Settings (Fixed)

```typescript
// /utils/offlineSync.ts
CACHE_NAME: 'municipal-portal-v1'
CACHE_URLS: [] // Empty by default to prevent errors
```

**Why empty?**
- Prevents "Failed to cache" errors on non-existent URLs
- Resources are cached dynamically as needed
- More resilient to environment differences

### Queue Settings

```typescript
STORAGE_KEY: 'municipal_portal_offline_queue'
MAX_RETRIES: 3
```

### Storage

- **Location:** Browser LocalStorage
- **Max Size:** ~5-10 MB (browser dependent)
- **Persistence:** Until manually cleared or browser storage cleared

---

## 🛠️ Setup & Configuration

### Basic Setup (Already Done)

The offline system is initialized automatically in `/App.tsx`:

```typescript
useEffect(() => {
  // Initialize offline cache (non-blocking)
  CacheManager.cacheResources().catch(err => {
    console.warn('Cache initialization failed (non-critical):', err)
  })
}, [])
```

### Adding Static Resources to Cache (Optional)

If you want to cache specific static files:

```typescript
// In /utils/offlineSync.ts, update CACHE_URLS:
private static readonly CACHE_URLS = [
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  // Add other static assets
]
```

**Note:** Only add URLs that you're certain exist!

### Service Worker Setup (Advanced - Optional)

For production PWA functionality, create `/public/service-worker.js`:

```javascript
const CACHE_NAME = 'municipal-portal-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Handle fetch events - cache strategy here
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

Then register it in `/App.tsx`:

```typescript
import { registerServiceWorker } from './utils/serviceWorker'

useEffect(() => {
  registerServiceWorker()
}, [])
```

---

## 💡 Usage Examples

### 1. Queue Action When Offline

```typescript
import { offlineSync } from './utils/offlineSync'

// In your component
const handleSubmit = async (data) => {
  if (!navigator.onLine) {
    // Queue for later
    await offlineSync.addPendingAction('issue_report', data)
    toast.success('Saved offline. Will sync when connected.')
  } else {
    // Send immediately
    await api.createIssue(data)
    toast.success('Issue reported successfully!')
  }
}
```

### 2. Check Queue Status

```typescript
const stats = offlineSync.getQueueStats()
console.log(`Pending actions: ${stats.total}`)
console.log('By type:', stats.byType)
// Output: { bill_payment: 2, issue_report: 1 }
```

### 3. Manual Sync

```typescript
// Trigger manual sync
await offlineSync.syncPendingActions()
```

### 4. Listen to Sync Events

```typescript
useEffect(() => {
  const handleStatus = (status) => {
    if (status === 'syncing') {
      console.log('Syncing...')
    } else if (status === 'sync_complete') {
      console.log('Sync complete!')
    }
  }
  
  offlineSync.addListener(handleStatus)
  
  return () => {
    offlineSync.removeListener(handleStatus)
  }
}, [])
```

---

## 🔍 Monitoring & Debugging

### Browser Console Logs

The offline system logs important events:

```
✅ Action queued for offline sync: issue_report_1635789012345_abc123
✅ Syncing 3 pending actions...
✅ Successfully synced action: issue_report_1635789012345_abc123
✅ Sync complete: 3 succeeded, 0 failed
❌ Failed to sync action poll_vote_1635789012346_def456: Network error
⚠️  Removed action issue_report_1635789012347_ghi789 after max retries
```

### Check Queue in LocalStorage

Open browser DevTools → Application → Local Storage:

```
Key: municipal_portal_offline_queue
Value: [
  {
    "id": "issue_report_1635789012345_abc123",
    "type": "issue_report",
    "data": { ... },
    "timestamp": 1635789012345,
    "retries": 0
  }
]
```

### Visual Indicator

The **OfflineSyncIndicator** component shows:
- 🔴 Offline (no connection)
- 🟢 Online (connected)
- 🔵 Syncing (in progress)
- Pending action count
- Manual sync button

---

## ⚠️ Limitations & Considerations

### Storage Limits

**LocalStorage:**
- Typical limit: 5-10 MB
- Varies by browser
- Cleared if user clears browser data

**Mitigation:**
- Limit queued actions to essential data
- Don't store large files (photos)
- Consider using IndexedDB for larger data

### Security

**Concerns:**
- Data stored unencrypted in LocalStorage
- Accessible via JavaScript
- Visible in DevTools

**Mitigation:**
- Don't store sensitive data (passwords, card numbers)
- Use tokens, not raw credentials
- Implement server-side validation

### Retry Logic

**Current Behavior:**
- Max 3 retry attempts
- Action removed after 3 failures
- No exponential backoff

**Future Improvements:**
- Exponential backoff
- Priority queue
- Action expiration

### Network Detection

**Limitations:**
- `navigator.onLine` is not always accurate
- May report online when no internet access
- Doesn't detect slow connections

**Mitigation:**
- Timeout on API calls
- Fallback to offline mode on timeout
- User feedback for failed actions

---

## 🐛 Troubleshooting

### Error: "Failed to cache resources"

**Cause:** Trying to cache non-existent URLs

**Solution:** Already fixed! The cache now handles errors gracefully.

```typescript
// Old code (caused errors):
await cache.addAll(this.CACHE_URLS)

// New code (resilient):
for (const url of this.CACHE_URLS) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      await cache.put(url, response)
    }
  } catch (error) {
    console.warn(`Failed to cache ${url}`)
  }
}
```

### Actions Not Syncing

**Diagnosis:**
1. Check browser console for errors
2. Verify online status: `navigator.onLine`
3. Check queue: `offlineSync.getQueueStats()`
4. Look for network errors in DevTools

**Solutions:**
- Ensure backend is running
- Check API endpoints are correct
- Verify access token is valid
- Try manual sync button

### Queue Growing Too Large

**Diagnosis:**
```javascript
const stats = offlineSync.getQueueStats()
if (stats.total > 50) {
  console.warn('Queue is very large!')
}
```

**Solutions:**
- Clear failed actions: `offlineSync.clearQueue()`
- Check why actions are failing
- Reduce data size in queued actions

### Cache Not Working

**Check:**
1. Browser supports Cache API: `'caches' in window`
2. Service Worker registered (if using)
3. HTTPS enabled (required for Service Workers)

**Solutions:**
- Use Chrome/Firefox/Safari (modern browsers)
- Test on HTTPS or localhost
- Check Service Worker registration

---

## 🚀 Performance Optimization

### 1. Reduce Queue Size

```typescript
// Before queuing, minimize data
const minimalData = {
  id: data.id,
  title: data.title,
  // Only essential fields
}
await offlineSync.addPendingAction('issue_report', minimalData)
```

### 2. Batch Sync

Instead of syncing one by one, batch similar actions:

```typescript
// Group actions by type
const queue = offlineSync.getPendingActions()
const byType = queue.reduce((acc, action) => {
  acc[action.type] = acc[action.type] || []
  acc[action.type].push(action)
  return acc
}, {})

// Send batch requests
for (const [type, actions] of Object.entries(byType)) {
  await api.batchProcess(type, actions)
}
```

### 3. Prioritize Actions

```typescript
// Add priority field to actions
interface PendingAction {
  priority: 'high' | 'normal' | 'low'
  // ... other fields
}

// Sync high priority first
const sorted = queue.sort((a, b) => {
  const priorities = { high: 0, normal: 1, low: 2 }
  return priorities[a.priority] - priorities[b.priority]
})
```

---

## 📊 Statistics & Monitoring

### Queue Metrics

```typescript
const stats = offlineSync.getQueueStats()

console.log(`Total pending: ${stats.total}`)
console.log(`Bill payments: ${stats.byType.bill_payment || 0}`)
console.log(`Issue reports: ${stats.byType.issue_report || 0}`)
console.log(`Forum posts: ${stats.byType.forum_post || 0}`)
console.log(`Poll votes: ${stats.byType.poll_vote || 0}`)
console.log(`Feedback: ${stats.byType.feedback || 0}`)
```

### Sync Success Rate

Track in your component:

```typescript
const [syncStats, setSyncStats] = useState({
  attempts: 0,
  successes: 0,
  failures: 0
})

useEffect(() => {
  const handleStatus = (status) => {
    if (status === 'syncing') {
      setSyncStats(prev => ({ ...prev, attempts: prev.attempts + 1 }))
    } else if (status === 'sync_complete') {
      setSyncStats(prev => ({ ...prev, successes: prev.successes + 1 }))
    } else if (status === 'sync_failed') {
      setSyncStats(prev => ({ ...prev, failures: prev.failures + 1 }))
    }
  }
  
  offlineSync.addListener(handleStatus)
  return () => offlineSync.removeListener(handleStatus)
}, [])

const successRate = syncStats.attempts > 0 
  ? (syncStats.successes / syncStats.attempts * 100).toFixed(1)
  : 0

console.log(`Success rate: ${successRate}%`)
```

---

## 🔮 Future Enhancements

### Planned Features

1. **IndexedDB Storage**
   - Replace LocalStorage for larger capacity
   - Store photos and files offline
   - Better performance for large queues

2. **Background Sync API**
   - Sync even when page is closed
   - Better battery efficiency
   - Reliable sync on poor networks

3. **Push Notifications**
   - Notify when sync completes
   - Alert on sync failures
   - Remind to sync pending actions

4. **Conflict Resolution**
   - Handle simultaneous edits
   - Merge strategies
   - Version control

5. **Smart Retry**
   - Exponential backoff
   - Network quality detection
   - Adaptive retry timing

### Implementation Roadmap

**Phase 1:** (Current)
- ✅ Basic offline detection
- ✅ Action queuing
- ✅ Manual sync
- ✅ Retry logic

**Phase 2:** (Next)
- 🔄 IndexedDB migration
- 🔄 Background Sync API
- 🔄 Push notifications

**Phase 3:** (Future)
- ⏳ Conflict resolution
- ⏳ Smart retry logic
- ⏳ Predictive caching

---

## 📚 Additional Resources

### Documentation
- [Cache API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Service Workers - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.chrome.com/docs/workbox/modules/workbox-background-sync/)
- [IndexedDB - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### Related Files
- `/utils/offlineSync.ts` - Core offline functionality
- `/utils/serviceWorker.ts` - Service Worker helpers
- `/components/OfflineSyncIndicator.tsx` - Visual indicator
- `/App.tsx` - Initialization

---

## ✅ Summary

**What Works:**
- ✅ Offline action queuing
- ✅ Auto-sync when online
- ✅ Manual sync trigger
- ✅ Retry logic (3 attempts)
- ✅ Visual status indicator
- ✅ Error handling

**What's Fixed:**
- ✅ Cache errors (non-blocking)
- ✅ Resilient resource caching
- ✅ Graceful error handling

**What to Test:**
1. Turn off internet
2. Perform actions (vote, report issue)
3. See queued indicator
4. Turn internet back on
5. Watch actions sync automatically

**Next Steps:**
1. Test offline functionality
2. Monitor queue size
3. Check sync success rate
4. Consider IndexedDB for production
5. Implement Service Worker for PWA

---

*Last Updated: 2025-10-31*  
*Version: 2.0.0*  
*Status: Error Fixed ✅*
