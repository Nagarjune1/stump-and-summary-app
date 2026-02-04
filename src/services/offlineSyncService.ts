import { supabase } from '@/integrations/supabase/client';

// Types for queued operations
type OperationType = 'insert' | 'update' | 'delete' | 'upsert';
type TableName = 'ball_by_ball' | 'match_stats' | 'matches' | 'partnerships';

interface QueuedOperation {
  id: string;
  timestamp: number;
  type: OperationType;
  table: TableName;
  data: Record<string, unknown>;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  isSyncing: boolean;
}

const DB_NAME = 'wickets_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_operations';
const MAX_RETRIES = 3;

class OfflineSyncService {
  private db: IDBDatabase | null = null;
  private syncStatus: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    lastSyncTime: null,
    isSyncing: false
  };
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private syncInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
      this.setupNetworkListeners();
    }
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.updatePendingCount();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('table', 'table', { unique: false });
        }
      };
    });
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Back online - starting sync...');
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline - operations will be queued');
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async updatePendingCount(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        this.syncStatus.pendingCount = countRequest.result;
        this.notifyListeners();
        resolve();
      };

      countRequest.onerror = () => {
        resolve();
      };
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.syncStatus }));
  }

  // Subscribe to sync status changes
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.syncStatus });
    return () => this.listeners.delete(listener);
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Check if online
  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  // Queue an operation for later sync
  async queueOperation(
    type: OperationType,
    table: TableName,
    data: Record<string, unknown>
  ): Promise<boolean> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve) => {
      const operation: QueuedOperation = {
        id: this.generateId(),
        timestamp: Date.now(),
        type,
        table,
        data,
        retryCount: 0
      };

      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(operation);

      request.onsuccess = () => {
        console.log('📝 Operation queued for offline sync:', { type, table });
        this.updatePendingCount();
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to queue operation:', request.error);
        resolve(false);
      };
    });
  }

  // Execute an operation (try online first, queue if offline)
  async executeWithOfflineSupport<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>,
    fallbackData: { type: OperationType; table: TableName; data: Record<string, unknown> }
  ): Promise<{ success: boolean; offline: boolean }> {
    // If online, try to execute directly
    if (this.syncStatus.isOnline) {
      try {
        const result = await operation();
        if (!result.error) {
          return { success: true, offline: false };
        }
        // If error and might be network related, queue it
        console.warn('Operation failed, queuing for retry:', result.error);
      } catch (error) {
        console.warn('Operation threw error, queuing:', error);
      }
    }

    // Queue for later
    const queued = await this.queueOperation(
      fallbackData.type,
      fallbackData.table,
      fallbackData.data
    );
    return { success: queued, offline: true };
  }

  // Sync all pending operations
  async syncPendingOperations(): Promise<{ synced: number; failed: number }> {
    if (!this.db || this.syncInProgress || !this.syncStatus.isOnline) {
      return { synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    this.syncStatus.isSyncing = true;
    this.notifyListeners();

    let synced = 0;
    let failed = 0;

    try {
      const operations = await this.getAllPendingOperations();
      console.log(`🔄 Syncing ${operations.length} pending operations...`);

      for (const operation of operations) {
        const success = await this.executeOperation(operation);
        
        if (success) {
          await this.removeOperation(operation.id);
          synced++;
        } else {
          operation.retryCount++;
          if (operation.retryCount >= MAX_RETRIES) {
            console.error('Max retries reached, removing operation:', operation);
            await this.removeOperation(operation.id);
            failed++;
          } else {
            await this.updateOperation(operation);
            failed++;
          }
        }
      }

      this.syncStatus.lastSyncTime = Date.now();
      console.log(`✅ Sync complete: ${synced} synced, ${failed} failed`);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.syncInProgress = false;
      this.syncStatus.isSyncing = false;
      await this.updatePendingCount();
    }

    return { synced, failed };
  }

  private async getAllPendingOperations(): Promise<QueuedOperation[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }

  private async executeOperation(operation: QueuedOperation): Promise<boolean> {
    try {
      let result;

      switch (operation.type) {
        case 'insert':
          result = await supabase
            .from(operation.table)
            .insert(operation.data as never);
          break;

        case 'update':
          const { id: updateId, ...updateData } = operation.data;
          result = await supabase
            .from(operation.table)
            .update(updateData as never)
            .eq('id', updateId as string);
          break;

        case 'delete':
          result = await supabase
            .from(operation.table)
            .delete()
            .eq('id', operation.data.id as string);
          break;

        case 'upsert':
          result = await supabase
            .from(operation.table)
            .upsert(operation.data as never);
          break;

        default:
          console.error('Unknown operation type:', operation.type);
          return false;
      }

      if (result.error) {
        console.error('Sync operation failed:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error executing sync operation:', error);
      return false;
    }
  }

  private async removeOperation(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }

  private async updateOperation(operation: QueuedOperation): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }

  // Clear all pending operations (use with caution)
  async clearPendingOperations(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        this.updatePendingCount();
        resolve();
      };

      request.onerror = () => {
        resolve();
      };
    });
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();

// Export types
export type { SyncStatus, QueuedOperation };
