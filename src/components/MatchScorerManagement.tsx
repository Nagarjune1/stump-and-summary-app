import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Profile {
  id: string;
  profile_id: string;
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchScorers();
  }, [matchId]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchProfiles();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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
          .select('id, profile_id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const scorersWithProfiles = data.map(permission => {
          const profile = profilesData?.find(p => p.id === permission.user_id);
          return {
            ...permission,
            profiles: profile || { id: permission.user_id, profile_id: '', full_name: null, email: null }
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

  const searchProfiles = async () => {
    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, profile_id, full_name, email')
        .ilike('profile_id', `%${searchQuery}%`)
        .limit(5);

      if (error) throw error;
      
      // Filter out users who already have permissions
      const filtered = (data || []).filter(
        profile => !scorers.some(scorer => scorer.user_id === profile.id)
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast.error('Failed to search profiles');
    } finally {
      setSearching(false);
    }
  };

  const handleAddScorer = async (profile: Profile) => {
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('match_permissions')
        .insert({
          match_id: matchId,
          user_id: profile.id,
          permission_type: 'scorer',
          granted_by: user?.id
        });

      if (error) throw error;

      toast.success('Scorer added successfully');
      setSearchQuery("");
      setSearchResults([]);
      setSelectedProfile(null);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Scorer Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Scorer Section */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Profile ID (e.g., ABC123)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {searching && (
            <div className="text-sm text-muted-foreground">Searching...</div>
          )}
          
          {searchResults.length > 0 && (
            <div className="border rounded-lg divide-y bg-card">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{profile.full_name || profile.email || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">ID: {profile.profile_id}</p>
                  </div>
                  <Button
                    onClick={() => handleAddScorer(profile)}
                    disabled={adding}
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <div className="text-sm text-muted-foreground">No profiles found</div>
          )}
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
