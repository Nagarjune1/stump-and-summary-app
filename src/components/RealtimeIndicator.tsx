import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface RealtimeIndicatorProps {
  activeUsers: number;
  isConnected: boolean;
}

const RealtimeIndicator = ({ activeUsers, isConnected }: RealtimeIndicatorProps) => {
  if (!isConnected) {
    return (
      <Badge variant="outline" className="bg-muted">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
        </span>
        Offline
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Live
      </Badge>
      {activeUsers > 0 && (
        <Badge variant="outline" className="bg-primary/10">
          <Users className="h-3 w-3 mr-1" />
          {activeUsers}
        </Badge>
      )}
    </div>
  );
};

export default RealtimeIndicator;
