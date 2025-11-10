import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface Scorer {
  id: string;
  user_id: string;
  permission_type: string;
  profiles: Profile;
}

interface MatchScorerManagementProps {
  matchId: string;
  isOwner: boolean;
}

const MatchScorerManagement = ({ matchId, isOwner }: MatchScorerManagementProps) => {
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchScorers();
    fetchProfiles();
  }, [matchId]);

  const fetchScorers = async () => {
    try {
      const { data, error } = await supabase
        .from('match_permissions')
        .select(`
          id,
          user_id,
          permission_type
        `)
        .eq('match_id', matchId)
        .in('permission_type', ['owner', 'scorer']);

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(d => d.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const scorersWithProfiles = data.map(permission => {
          const profile = profilesData?.find(p => p.id === permission.user_id);
          return {
            ...permission,
            profiles: profile || { id: permission.user_id, full_name: null, email: null }
          };
        });

        setScorers(scorersWithProfiles);
      } else {
        setScorers([]);
      }
    } catch (error) {
      console.error('Error fetching scorers:', error);
      toast.error('Failed to load scorers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleAddScorer = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    // Check if user already has permission
    const existingScorer = scorers.find(s => s.user_id === selectedUserId);
    if (existingScorer) {
      toast.error('This user already has access to this match');
      return;
    }

    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('match_permissions')
        .insert({
          match_id: matchId,
          user_id: selectedUserId,
          permission_type: 'scorer',
          granted_by: user?.id
        });

      if (error) throw error;

      toast.success('Scorer added successfully');
      setSelectedUserId("");
      fetchScorers();
    } catch (error) {
      console.error('Error adding scorer:', error);
      toast.error('Failed to add scorer');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveScorer = async (permissionId: string, permissionType: string) => {
    if (permissionType === 'owner') {
      toast.error('Cannot remove match owner');
      return;
    }

    try {
      const { error } = await supabase
        .from('match_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      toast.success('Scorer removed successfully');
      fetchScorers();
    } catch (error) {
      console.error('Error removing scorer:', error);
      toast.error('Failed to remove scorer');
    }
  };

  if (!isOwner) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading permissions...</div>
        </CardContent>
      </Card>
    );
  }

  // Filter out users who already have permissions
  const availableProfiles = profiles.filter(
    profile => !scorers.some(scorer => scorer.user_id === profile.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Scorer Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Scorer Section */}
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a user to add as scorer" />
            </SelectTrigger>
            <SelectContent>
              {availableProfiles.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No available users
                </div>
              ) : (
                availableProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email || 'Unknown User'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddScorer}
            disabled={adding || !selectedUserId}
            size="sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Current Scorers List */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Current Access</div>
          {scorers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No scorers assigned</div>
          ) : (
            <div className="space-y-2">
              {scorers.map((scorer) => (
                <div
                  key={scorer.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {scorer.profiles.full_name || scorer.profiles.email || 'Unknown User'}
                    </span>
                    <Badge variant={scorer.permission_type === 'owner' ? 'default' : 'secondary'}>
                      {scorer.permission_type}
                    </Badge>
                  </div>
                  {scorer.permission_type !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveScorer(scorer.id, scorer.permission_type)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchScorerManagement;
