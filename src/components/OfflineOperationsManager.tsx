import { useEffect } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCw, Trash2, CloudOff, Cloud, Database } from 'lucide-react';
import { format } from 'date-fns';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';

export const OfflineOperationsManager = () => {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    pendingOps,
    syncNow,
    clearPending,
    fetchPendingOps,
    removeOperation,
  } = useOfflineSync();

  useEffect(() => {
    fetchPendingOps();
  }, [fetchPendingOps, pendingCount]);

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'insert': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      case 'upsert': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Offline Operations Queue
            </CardTitle>
            <CardDescription>
              View and manage operations queued while offline
            </CardDescription>
          </div>
          <OfflineSyncIndicator showDetails />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={syncNow}
            disabled={!isOnline || pendingCount === 0 || isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPendingOps}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          {pendingCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all pending operations?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {pendingCount} queued operation(s). These changes will be lost and won't be synced.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearPending}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Status banner */}
        {!isOnline && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
            <CloudOff className="h-4 w-4 text-destructive shrink-0" />
            <span>You're offline. Operations will sync automatically when connected.</span>
          </div>
        )}

        {/* Operations list */}
        {pendingOps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Cloud className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No pending operations</p>
            <p className="text-xs">All changes are synced</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center">Retries</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOps.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(op.type)}>
                        {op.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{op.table}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(op.timestamp), 'MMM d, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={op.retryCount > 0 ? 'destructive' : 'secondary'} className="text-xs">
                        {op.retryCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeOperation(op.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
