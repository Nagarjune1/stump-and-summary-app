import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useIsTeamAdmin = (teamId: string | null) => {
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);
  const [isTeamOwner, setIsTeamOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTeamPermission = async () => {
      if (!teamId) {
        setIsTeamAdmin(false);
        setIsTeamOwner(false);
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsTeamAdmin(false);
          setIsTeamOwner(false);
          setLoading(false);
          return;
        }

        // Check for owner permission
        const { data: ownerData } = await supabase.rpc('user_has_team_permission', {
          _team_id: teamId,
          _user_id: user.id,
          _permission_types: ['owner']
        });

        // Check for admin permission (includes owner)
        const { data: adminData } = await supabase.rpc('user_has_team_permission', {
          _team_id: teamId,
          _user_id: user.id,
          _permission_types: ['owner', 'admin']
        });

        // Also check global admin
        const { data: globalAdmin } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        setIsTeamOwner(ownerData === true || globalAdmin === true);
        setIsTeamAdmin(adminData === true || globalAdmin === true);
      } catch {
        setIsTeamAdmin(false);
        setIsTeamOwner(false);
      } finally {
        setLoading(false);
      }
    };

    checkTeamPermission();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkTeamPermission();
    });

    return () => subscription.unsubscribe();
  }, [teamId]);

  return { isTeamAdmin, isTeamOwner, loading };
};
