// Bakewise PWA Service Worker
const CACHE_NAME = 'bakewise-v1.0.0';
const STATIC_CACHE = 'bakewise-static-v1.0.0';
const DYNAMIC_CACHE = 'bakewise-dynamic-v1.0.0';

// Core files to cache immediately
const CORE_ASSETS = [
  '/',
  '/dashboard',
  '/admin',
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/bakers\//,
  /^\/api\/customers\//,
  /^\/api\/quotes\//,
  /^\/api\/tenant\//
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Bakewise SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Bakewise SW: Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('Bakewise SW: Core assets cached');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('Bakewise SW: Error caching core assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Bakewise SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Bakewise SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Bakewise SW: Activated');
        self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with cache-first strategy for GET requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests - cache-first for better offline experience
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this API endpoint should be cached
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!shouldCache) {
    // Don't cache sensitive endpoints - just fetch from network
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Network unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    // Try cache first for performance
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Bakewise SW: Serving API from cache:', url.pathname);
      
      // Fetch in background to update cache
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Network failed, but we have cache
      });
      
      return cachedResponse;
    }

    // No cache, fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
    
  } catch (error) {
    console.log('Bakewise SW: Network failed, checking cache for:', url.pathname);
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Network unavailable', 
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests (pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first for fresh content
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('Bakewise SW: Network failed for navigation, serving from cache');
    
    // Try cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to app shell
    const appShell = await cache.match('/');
    if (appShell) {
      return appShell;
    }
    
    // Last resort - offline page
    return cache.match('/offline.html') || new Response('App temporarily unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle static assets
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
    
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match(request) || new Response('Resource unavailable offline', {
      status: 503
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Bakewise SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-quotes') {
    event.waitUntil(syncOfflineQuotes());
  }
  
  if (event.tag === 'sync-customers') {
    event.waitUntil(syncOfflineCustomers());
  }
});

// Sync offline quotes when back online
async function syncOfflineQuotes() {
  try {
    // Get offline quotes from IndexedDB/localStorage
    const offlineQuotes = await getOfflineQuotes();
    
    for (const quote of offlineQuotes) {
      try {
        await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quote)
        });
        
        // Remove from offline storage on success
        await removeOfflineQuote(quote.tempId);
        
      } catch (error) {
        console.error('Bakewise SW: Failed to sync quote:', error);
      }
    }
    
  } catch (error) {
    console.error('Bakewise SW: Background sync failed:', error);
  }
}

// Sync offline customers when back online
async function syncOfflineCustomers() {
  try {
    const offlineCustomers = await getOfflineCustomers();
    
    for (const customer of offlineCustomers) {
      try {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
        
        await removeOfflineCustomer(customer.tempId);
        
      } catch (error) {
        console.error('Bakewise SW: Failed to sync customer:', error);
      }
    }
    
  } catch (error) {
    console.error('Bakewise SW: Background sync failed:', error);
  }
}

// Placeholder functions for offline data management
async function getOfflineQuotes() {
  // Implementation would use IndexedDB
  return [];
}

async function removeOfflineQuote(tempId) {
  // Implementation would remove from IndexedDB
}

async function getOfflineCustomers() {
  // Implementation would use IndexedDB
  return [];
}

async function removeOfflineCustomer(tempId) {
  // Implementation would remove from IndexedDB
}

// Push notification handling for real-time updates
self.addEventListener('push', (event) => {
  console.log('Bakewise SW: Push notification received');
  
  const options = {
    title: 'Bakewise',
    body: 'You have new activity in your bakery dashboard',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'bakewise-notification',
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'view',
        title: 'View Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      options.title = payload.title || options.title;
      options.body = payload.body || options.body;
      options.data.url = payload.url || options.data.url;
    } catch (error) {
      console.error('Bakewise SW: Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            const clientUrl = new URL(client.url);
            if (clientUrl.origin === self.location.origin) {
              return client.focus().then(() => client.navigate(urlToOpen));
            }
          }
          
          // Open new window
          return clients.openWindow(urlToOpen);
        })
    );
  }
});

console.log('Bakewise SW: Service Worker loaded successfully');