import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Users, MapPin } from "lucide-react";
import TeamAdminManager from "./TeamAdminManager";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";

interface Team {
  id: string;
  name: string;
  city?: string;
  created_at: string;
  playerCount?: number;
}

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onViewPlayers: (team: Team) => void;
}

const TeamCard = ({ team, onEdit, onDelete, onViewPlayers }: TeamCardProps) => {
  const { isTeamAdmin, isTeamOwner } = useIsTeamAdmin(team.id);

  return (
    <Card className="neon-card hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/20 text-primary font-bold neon-glow">
                {team.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-primary neon-glow">{team.name}</h3>
              {team.city && (
                <div className="flex items-center gap-1 text-sm text-accent">
                  <MapPin className="w-3 h-3" />
                  {team.city}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            {isTeamOwner && (
              <TeamAdminManager teamId={team.id} teamName={team.name} />
            )}
            {isTeamAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(team)}
                  className="text-accent hover:bg-accent/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(team)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div 
            className="flex justify-between items-center cursor-pointer hover:bg-muted/10 p-2 rounded transition-colors"
            onClick={() => onViewPlayers(team)}
          >
            <span className="text-muted-foreground">Players:</span>
            <Badge variant="outline" className="text-primary border-primary hover:bg-primary/10">
              <Users className="w-3 h-3 mr-1" />
              {team.playerCount || 0}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Created:</span>
            <span>{new Date(team.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
