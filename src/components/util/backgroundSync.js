import { isOnline, onNetworkChange, saveDataStructureCache, getCacheInfo } from './offlineCache';

class BackgroundSync {
  constructor() {
    this.syncInterval = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncIntervalMs = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Start background sync
   */
  start() {
    if (this.syncInterval) {
      return; // Already running
    }

    // Starting background sync
    
    // Listen for network changes
    this.networkCleanup = onNetworkChange((online) => {
      if (online) {
        // Network restored, triggering sync
        this.sync();
      }
    });

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      if (isOnline() && !this.isSyncing) {
        this.sync();
      }
    }, this.syncIntervalMs);

    // Initial sync if online
    if (isOnline()) {
      this.sync();
    }
  }

  /**
   * Stop background sync
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.networkCleanup) {
      this.networkCleanup();
      this.networkCleanup = null;
    }

    // Background sync stopped
  }

  /**
   * Perform sync operation
   */
  async sync() {
    if (this.isSyncing || !isOnline()) {
      return;
    }

    try {
      this.isSyncing = true;
      // Performing background sync

      // Check if we need to sync
      const cacheInfo = await getCacheInfo();
      const shouldSync = !cacheInfo.hasCache || !cacheInfo.isValid || 
                        (Date.now() - this.lastSyncTime) > this.syncIntervalMs;

      if (!shouldSync) {
        // Cache is still valid, skipping sync
        return;
      }

      // Fetch fresh data
      const response = await fetch('/api/data-structure', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Save to cache
      await saveDataStructureCache(data);
      
      this.lastSyncTime = Date.now();
      // Background sync completed successfully

      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('backgroundSyncComplete', {
        detail: { data, timestamp: this.lastSyncTime }
      }));

    } catch (error) {
      // Background sync failed
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('backgroundSyncError', {
        detail: { error: error.message }
      }));
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync() {
    if (!isOnline()) {
      throw new Error('Cannot sync while offline');
    }

    this.lastSyncTime = 0; // Force sync
    await this.sync();
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isRunning: !!this.syncInterval,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      syncIntervalMs: this.syncIntervalMs
    };
  }
}

// Create singleton instance
const backgroundSync = new BackgroundSync();

export default backgroundSync;
