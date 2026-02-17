import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService, SyncStatus, QueuedOperation } from '@/services/offlineSyncService';
import { toast } from 'sonner';

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => 
    offlineSyncService.getStatus()
  );
  const [pendingOps, setPendingOps] = useState<QueuedOperation[]>([]);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((status) => {
      setSyncStatus(status);
      
      if (!status.isOnline && status.pendingCount > 0) {
        toast.info('You\'re offline. Changes will sync when connected.', {
          duration: 3000,
        });
      }
    });

    return unsubscribe;
  }, []);

  const syncNow = useCallback(async () => {
    if (!syncStatus.isOnline) {
      toast.error('Cannot sync while offline');
      return { synced: 0, failed: 0 };
    }

    toast.loading('Syncing...', { id: 'sync-progress' });
    const result = await offlineSyncService.syncPendingOperations();
    toast.dismiss('sync-progress');
    
    if (result.synced > 0) toast.success(`Synced ${result.synced} changes`);
    if (result.failed > 0) toast.error(`Failed to sync ${result.failed} changes`);
    
    return result;
  }, [syncStatus.isOnline]);

  const clearPending = useCallback(async () => {
    await offlineSyncService.clearPendingOperations();
    setPendingOps([]);
    toast.info('Pending operations cleared');
  }, []);

  const fetchPendingOps = useCallback(async () => {
    const ops = await offlineSyncService.getPendingOperations();
    setPendingOps(ops);
    return ops;
  }, []);

  const removeOperation = useCallback(async (id: string) => {
    await offlineSyncService.removeOperationById(id);
    setPendingOps(prev => prev.filter(op => op.id !== id));
    toast.success('Operation removed');
  }, []);

  return {
    isOnline: syncStatus.isOnline,
    pendingCount: syncStatus.pendingCount,
    lastSyncTime: syncStatus.lastSyncTime,
    isSyncing: syncStatus.isSyncing,
    pendingOps,
    syncNow,
    clearPending,
    fetchPendingOps,
    removeOperation,
  };
};
