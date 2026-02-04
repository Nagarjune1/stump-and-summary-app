import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService, SyncStatus } from '@/services/offlineSyncService';
import { toast } from 'sonner';

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => 
    offlineSyncService.getStatus()
  );

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((status) => {
      setSyncStatus(status);
      
      // Show toast notifications for status changes
      if (!status.isOnline && status.pendingCount > 0) {
        toast.info('You\'re offline. Changes will sync when connected.', {
          duration: 3000,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Manually trigger sync
  const syncNow = useCallback(async () => {
    if (!syncStatus.isOnline) {
      toast.error('Cannot sync while offline');
      return { synced: 0, failed: 0 };
    }

    toast.loading('Syncing...', { id: 'sync-progress' });
    
    const result = await offlineSyncService.syncPendingOperations();
    
    toast.dismiss('sync-progress');
    
    if (result.synced > 0) {
      toast.success(`Synced ${result.synced} changes`);
    }
    if (result.failed > 0) {
      toast.error(`Failed to sync ${result.failed} changes`);
    }
    
    return result;
  }, [syncStatus.isOnline]);

  // Clear pending operations
  const clearPending = useCallback(async () => {
    await offlineSyncService.clearPendingOperations();
    toast.info('Pending operations cleared');
  }, []);

  return {
    isOnline: syncStatus.isOnline,
    pendingCount: syncStatus.pendingCount,
    lastSyncTime: syncStatus.lastSyncTime,
    isSyncing: syncStatus.isSyncing,
    syncNow,
    clearPending,
  };
};
