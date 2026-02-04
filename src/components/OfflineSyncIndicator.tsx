import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Cloud, CloudOff, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OfflineSyncIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const OfflineSyncIndicator = ({ 
  className,
  showDetails = false 
}: OfflineSyncIndicatorProps) => {
  const { 
    isOnline, 
    pendingCount, 
    lastSyncTime, 
    isSyncing,
    syncNow 
  } = useOfflineSync();

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (!isOnline) {
      return <CloudOff className="h-4 w-4 text-orange-500" />;
    }
    if (pendingCount === 0) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return <Cloud className="h-4 w-4 text-blue-500" />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Synced';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-orange-500/10 border-orange-500/20 text-orange-600';
    if (pendingCount > 0) return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
    return 'bg-green-500/10 border-green-500/20 text-green-600';
  };

  if (!showDetails) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium cursor-default',
              getStatusColor(),
              className
            )}
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">{getStatusText()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>{isOnline ? 'Connected' : 'Offline mode'}</p>
            {pendingCount > 0 && (
              <p>{pendingCount} changes waiting to sync</p>
            )}
            {lastSyncTime && (
              <p className="text-muted-foreground">
                Last synced: {format(new Date(lastSyncTime), 'HH:mm:ss')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      getStatusColor(),
      className
    )}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="text-sm">
          <p className="font-medium">{getStatusText()}</p>
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground">
              Last synced: {format(new Date(lastSyncTime), 'HH:mm:ss')}
            </p>
          )}
        </div>
      </div>
      
      {isOnline && pendingCount > 0 && !isSyncing && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={syncNow}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
};
