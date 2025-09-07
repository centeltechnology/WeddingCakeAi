// PWA utility functions for service worker registration and management

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Bakewise PWA: Service worker registered successfully', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                showUpdatePrompt(registration);
              }
            });
          }
        });

        // Handle controlling service worker change
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            window.location.reload();
            refreshing = true;
          }
        });

      } catch (error) {
        console.error('Bakewise PWA: Service worker registration failed', error);
      }
    });
  }
}

export function showUpdatePrompt(registration: ServiceWorkerRegistration) {
  // Create update notification
  const updateBanner = document.createElement('div');
  updateBanner.className = 'fixed top-0 left-0 right-0 bg-rose-500 text-white p-3 z-50 flex items-center justify-between';
  updateBanner.innerHTML = `
    <div class="flex items-center gap-2">
      <span>🍰</span>
      <span>A new version of Bakewise is available!</span>
    </div>
    <div class="flex gap-2">
      <button id="update-app" class="bg-white text-rose-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
        Update Now
      </button>
      <button id="dismiss-update" class="text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(updateBanner);

  // Handle update button click
  const updateButton = document.getElementById('update-app');
  const dismissButton = document.getElementById('dismiss-update');

  updateButton?.addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  dismissButton?.addEventListener('click', () => {
    document.body.removeChild(updateBanner);
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(updateBanner)) {
      document.body.removeChild(updateBanner);
    }
  }, 10000);
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

// Offline data management utilities
export class OfflineDataManager {
  private dbName = 'BakewiseOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for offline data
        if (!db.objectStoreNames.contains('quotes')) {
          const quotesStore = db.createObjectStore('quotes', { keyPath: 'tempId' });
          quotesStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('customers')) {
          const customersStore = db.createObjectStore('customers', { keyPath: 'tempId' });
          customersStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async saveOfflineQuote(quote: any) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['quotes'], 'readwrite');
    const store = transaction.objectStore('quotes');
    
    const offlineQuote = {
      ...quote,
      tempId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    };

    return store.add(offlineQuote);
  }

  async saveOfflineCustomer(customer: any) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    
    const offlineCustomer = {
      ...customer,
      tempId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    };

    return store.add(offlineCustomer);
  }

  async getOfflineQuotes() {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['quotes'], 'readonly');
    const store = transaction.objectStore('quotes');
    
    return new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.filter(q => !q.synced));
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineCustomers() {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    
    return new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.filter(c => !c.synced));
      request.onerror = () => reject(request.error);
    });
  }

  async markQuoteSynced(tempId: string) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['quotes'], 'readwrite');
    const store = transaction.objectStore('quotes');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.get(tempId);
      request.onsuccess = () => {
        const quote = request.result;
        if (quote) {
          quote.synced = true;
          const updateRequest = store.put(quote);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markCustomerSynced(tempId: string) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.get(tempId);
      request.onsuccess = () => {
        const customer = request.result;
        if (customer) {
          customer.synced = true;
          const updateRequest = store.put(customer);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Global offline data manager instance
export const offlineDataManager = new OfflineDataManager();

// Network status helpers
export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(callback: (isOnline: boolean) => void) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Background sync helpers
export function requestBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return (registration as any).sync.register(tag);
    }).catch((error) => {
      console.error('Background sync registration failed:', error);
    });
  }
}

// Push notification helpers
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
}

export function showNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
  }
  return null;
}