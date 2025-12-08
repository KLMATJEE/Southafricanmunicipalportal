// Service Worker registration and management
// This provides proper offline support for the municipal portal

const CACHE_VERSION = 'municipal-portal-v1'
const RUNTIME_CACHE = 'municipal-runtime-v1'

// URLs to cache on service worker install
const STATIC_ASSETS = [
  // Intentionally empty - will be populated dynamically
  // Static assets will be cached as they are requested
]

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered:', registration)
        })
        .catch(error => {
          console.log('ServiceWorker registration failed:', error)
        })
    })
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister()
        console.log('ServiceWorker unregistered')
      })
      .catch(error => {
        console.error('Error unregistering service worker:', error)
      })
  }
}

// Check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator
}

// Update service worker
export async function updateServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.update()
    console.log('ServiceWorker updated')
  }
}
