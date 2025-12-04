import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Trash2, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";

interface TeamAdmin {
  id: string;
  user_id: string;
  permission_type: string;
  profile_id?: string;
  full_name?: string;
}

interface TeamAdminManagerProps {
  teamId: string;
  teamName: string;
}

const TeamAdminManager = ({ teamId, teamName }: TeamAdminManagerProps) => {
  const [admins, setAdmins] = useState<TeamAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdminProfileId, setNewAdminProfileId] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string; profile_id: string; display_name: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const { isTeamOwner } = useIsTeamAdmin(teamId);

  useEffect(() => {
    if (isDialogOpen) {
      fetchAdmins();
    }
  }, [isDialogOpen, teamId]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_permissions')
        .select('id, user_id, permission_type')
        .eq('team_id', teamId);

      if (error) throw error;

      // Fetch profile info for each admin
      const adminsWithProfiles = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('profile_id, full_name')
            .eq('id', admin.user_id)
            .single();
          return {
            ...admin,
            profile_id: profile?.profile_id,
            full_name: profile?.full_name
          };
        })
      );

      setAdmins(adminsWithProfiles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team admins",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchProfile = async () => {
    if (!newAdminProfileId.trim()) return;

    try {
      setSearching(true);
      const { data, error } = await supabase.rpc('search_profiles_for_scorer', {
        search_term: newAdminProfileId.trim()
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setSearchResult(data[0]);
      } else {
        setSearchResult(null);
        toast({
          title: "Not Found",
          description: "No user found with this Profile ID",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search profile",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const addAdmin = async () => {
    if (!searchResult) return;

    // Check if already admin
    if (admins.some(a => a.user_id === searchResult.id)) {
      toast({
        title: "Already Admin",
        description: "This user is already a team admin",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('team_permissions')
        .insert({
          team_id: teamId,
          user_id: searchResult.id,
          permission_type: 'admin',
          granted_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${searchResult.display_name} is now a team admin`,
      });

      setNewAdminProfileId("");
      setSearchResult(null);
      fetchAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive"
      });
    }
  };

  const removeAdmin = async (admin: TeamAdmin) => {
    if (admin.permission_type === 'owner') {
      toast({
        title: "Cannot Remove",
        description: "Cannot remove team owner",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(`Remove ${admin.full_name || admin.profile_id} as admin?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('team_permissions')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Admin removed successfully",
      });

      fetchAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove admin",
        variant: "destructive"
      });
    }
  };

  if (!isTeamOwner) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-warning hover:bg-warning/10">
          <Shield className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="neon-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary neon-glow flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Manage {teamName} Admins
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Admins */}
          <div>
            <Label className="text-foreground mb-2 block">Current Admins</Label>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : admins.length === 0 ? (
              <p className="text-muted-foreground text-sm">No admins assigned</p>
            ) : (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                    <div className="flex items-center gap-2">
                      {admin.permission_type === 'owner' ? (
                        <Crown className="w-4 h-4 text-warning" />
                      ) : (
                        <Shield className="w-4 h-4 text-accent" />
                      )}
                      <span className="text-foreground">{admin.full_name || 'Unknown'}</span>
                      <Badge variant="outline" className="text-xs">
                        {admin.profile_id}
                      </Badge>
                      <Badge variant={admin.permission_type === 'owner' ? 'default' : 'secondary'} className="text-xs">
                        {admin.permission_type}
                      </Badge>
                    </div>
                    {admin.permission_type !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdmin(admin)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Admin */}
          <div className="border-t border-border pt-4">
            <Label className="text-foreground mb-2 block">Add New Admin</Label>
            <div className="flex gap-2">
              <Input
                value={newAdminProfileId}
                onChange={(e) => {
                  setNewAdminProfileId(e.target.value.toUpperCase());
                  setSearchResult(null);
                }}
                placeholder="Enter Profile ID"
                className="bg-input border-border text-foreground"
                maxLength={8}
              />
              <Button 
                onClick={searchProfile} 
                disabled={searching || !newAdminProfileId.trim()}
                variant="outline"
                className="border-border"
              >
                Search
              </Button>
            </div>

            {searchResult && (
              <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">{searchResult.display_name}</p>
                    <Badge variant="outline" className="text-xs">{searchResult.profile_id}</Badge>
                  </div>
                  <Button onClick={addAdmin} size="sm" className="cricket-success">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamAdminManager;
