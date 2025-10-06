// BakerIQ PWA Service Worker
const CACHE_VERSION = 'v1.1.0';
const STATIC_CACHE = `bakewise-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `bakewise-dynamic-${CACHE_VERSION}`;

// Core files to cache immediately (excluding index.html to prevent stale shells)
const CORE_ASSETS = [
  '/manifest.json',
  '/offline.html'
];

// Patterns to bypass service worker (for development and API requests)
const BYPASS_PATTERNS = [
  /^\/api\//,           // All API requests
  /^\/src\//,           // Vite dev files
  /^\/@vite\//,         // Vite internals
  /^\/__vite_ping/,     // Vite ping
  /^\/@react-refresh/,  // React refresh
  /^\/node_modules\//   // Node modules
];

// Check if request should bypass service worker
const shouldBypass = (url) => {
  return BYPASS_PATTERNS.some(pattern => pattern.test(url.pathname));
};

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('BakerIQ SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('BakerIQ SW: Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('BakerIQ SW: Core assets cached');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('BakerIQ SW: Error caching core assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('BakerIQ SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('BakerIQ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('BakerIQ SW: Activated');
        self.clients.claim();
      })
  );
});

// Fetch event - network-first for navigation, bypass patterns for dev/API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Bypass service worker for development and API requests
  if (shouldBypass(url)) {
    console.log('BakerIQ SW: Bypassing SW for:', url.pathname);
    return; // Let the request go directly to network
  }

  // Handle navigation requests (pages) with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
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
      console.log('BakerIQ SW: Serving API from cache:', url.pathname);
      
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
    console.log('BakerIQ SW: Network failed, checking cache for:', url.pathname);
    
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

// Handle navigation requests (pages) - ALWAYS network-first, never cache index.html
async function handleNavigationRequest(request) {
  try {
    console.log('BakerIQ SW: Network-first navigation request:', request.url);
    // Always try network first for navigation to ensure fresh app shell
    const response = await fetch(request);
    
    if (response.ok) {
      // DO NOT cache the main index.html to prevent stale shells
      // Only cache specific page resources if needed
      return response;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('BakerIQ SW: Network failed for navigation, checking offline status');
    
    // Only serve offline fallback if truly offline
    if (!navigator.onLine) {
      const cache = await caches.open(STATIC_CACHE);
      const offlinePage = await cache.match('/offline.html');
      
      if (offlinePage) {
        console.log('BakerIQ SW: Serving offline fallback');
        return offlinePage;
      }
    }
    
    // If network fails but we're online, let it fail naturally so browser can show error
    throw error;
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
  console.log('BakerIQ SW: Background sync triggered:', event.tag);
  
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
        console.error('BakerIQ SW: Failed to sync quote:', error);
      }
    }
    
  } catch (error) {
    console.error('BakerIQ SW: Background sync failed:', error);
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
        console.error('BakerIQ SW: Failed to sync customer:', error);
      }
    }
    
  } catch (error) {
    console.error('BakerIQ SW: Background sync failed:', error);
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
  console.log('BakerIQ SW: Push notification received');
  
  const options = {
    title: 'BakerIQ',
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
      console.error('BakerIQ SW: Error parsing push data:', error);
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

console.log('BakerIQ SW: Service Worker loaded successfully');