import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  addPendingChange, 
  getPendingChanges, 
  clearPendingChanges,
  isOnline 
} from "./offlineStorage";

interface SyncEvent {
  type: 'place' | 'weather' | 'wellness';
  action: 'update' | 'delete' | 'insert';
  data: any;
}

class SyncManager {
  private syncInProgress = false;
  private eventQueue: SyncEvent[] = [];
  private syncInterval: number | null = null;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Start periodic sync if online
    if (isOnline()) {
      this.startPeriodicSync();
    }
  }

  /**
   * Handle when connection is restored
   */
  private async handleOnline() {
    console.log('SyncManager: Connection restored');
    toast.success('Back online - syncing data...');
    await this.syncPendingChanges();
    this.startPeriodicSync();
  }

  /**
   * Handle when connection is lost
   */
  private handleOffline() {
    console.log('SyncManager: Connection lost');
    toast.warning('Offline mode - changes will sync when reconnected');
    this.stopPeriodicSync();
  }

  /**
   * Start periodic background sync
   */
  private startPeriodicSync() {
    if (this.syncInterval) return;
    
    // Sync every 5 minutes
    this.syncInterval = window.setInterval(() => {
      if (isOnline()) {
        this.syncPendingChanges();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Queue an event for synchronization
   */
  async queueEvent(event: SyncEvent) {
    this.eventQueue.push(event);
    
    if (!isOnline()) {
      // Store in IndexedDB for later sync
      await addPendingChange(event.action, event.type, event.data);
      return;
    }

    // If online, sync immediately
    await this.processEvent(event);
  }

  /**
   * Process a single sync event
   */
  private async processEvent(event: SyncEvent) {
    try {
      switch (event.type) {
        case 'place':
          await this.syncPlace(event);
          break;
        case 'weather':
          await this.syncWeather(event);
          break;
        case 'wellness':
          await this.syncWellness(event);
          break;
      }
    } catch (error) {
      console.error('SyncManager: Error processing event', error);
      // Re-queue for retry
      await addPendingChange(event.action, event.type, event.data);
    }
  }

  /**
   * Sync place/location changes
   */
  private async syncPlace(event: SyncEvent) {
    const { action, data } = event;

    switch (action) {
      case 'insert':
        await supabase.from('itinerary_items').insert(data);
        break;
      case 'update':
        await supabase.from('itinerary_items').update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from('itinerary_items').delete().eq('id', data.id);
        break;
    }
  }

  /**
   * Sync weather data (cache only, no DB changes)
   */
  private async syncWeather(event: SyncEvent) {
    // Weather data is cached locally, no server sync needed
    console.log('Weather data cached locally');
  }

  /**
   * Sync wellness profile changes
   */
  private async syncWellness(event: SyncEvent) {
    const { action, data } = event;

    if (action === 'update') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('wellness_profiles')
        .upsert({ ...data, user_id: user.id });
    }
  }

  /**
   * Sync all pending changes from IndexedDB
   */
  async syncPendingChanges() {
    if (this.syncInProgress || !isOnline()) return;

    this.syncInProgress = true;
    console.log('SyncManager: Starting sync...');

    try {
      const pendingChanges = await getPendingChanges();
      
      if (pendingChanges.length === 0) {
        console.log('SyncManager: No pending changes');
        return;
      }

      console.log(`SyncManager: Syncing ${pendingChanges.length} changes`);

      for (const change of pendingChanges) {
        await this.processEvent({
          type: change.table as any,
          action: change.type,
          data: change.data,
        });
      }

      // Clear pending changes after successful sync
      await clearPendingChanges();
      toast.success(`Synced ${pendingChanges.length} changes`);
      
    } catch (error) {
      console.error('SyncManager: Sync failed', error);
      toast.error('Failed to sync some changes');
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Manual sync trigger
   */
  async forceSyn() {
    await this.syncPendingChanges();
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    const pendingChanges = await getPendingChanges();
    return {
      isOnline: isOnline(),
      pendingChanges: pendingChanges.length,
      isSyncing: this.syncInProgress,
    };
  }
}

export const syncManager = new SyncManager();
