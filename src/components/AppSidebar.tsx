import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Plus,
  Target,
  Users,
  FileText,
  Trophy,
  Settings,
  MapPin,
  Download,
  BookOpen,
  Award,
  User,
  Play,
  PieChart,
  UserCircle
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const navigationItems = [
  { id: 'dashboard', title: 'Dashboard', url: '/', icon: BarChart3 },
  { id: 'create', title: 'Create Match', url: '/create', icon: Plus },
  { id: 'scoring', title: 'Live Scoring', url: '/scoring', icon: Target },
  { id: 'scoreboard', title: 'Scoreboard', url: '/scoreboard', icon: Play },
  { id: 'analytics', title: 'Analytics', url: '/analytics', icon: PieChart },
  { id: 'players', title: 'Players', url: '/players', icon: Users },
  { id: 'teams', title: 'Teams', url: '/teams', icon: User },
  { id: 'tournaments', title: 'Tournaments', url: '/tournaments', icon: Trophy },
  { id: 'venues', title: 'Venues', url: '/venues', icon: MapPin },
  { id: 'summary', title: 'Match Summary', url: '/summary', icon: FileText },
  { id: 'statistics', title: 'Statistics', url: '/statistics', icon: BarChart3 },
  { id: 'export', title: 'Export Reports', url: '/export', icon: Download },
  { id: 'help', title: 'Documentation', url: '/help', icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchProfileId = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('profile_id')
          .eq('id', user.id)
          .single();
        if (data?.profile_id) {
          setProfileId(data.profile_id);
        }
      }
    };
    fetchProfileId();
  }, [user]);

  const isActive = (url: string) => {
    if (url === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(url);
  };

  const isCollapsed = state === 'collapsed';

  const handleProfileClick = () => {
    if (profileId) {
      navigate(`/profile/${profileId}`);
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border neon-border">
      <SidebarHeader className="cricket-header p-4 neon-glow">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary neon-glow" />
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-primary neon-glow">Wickets</h2>
              <p className="text-sm text-accent">Cricket Scoring App</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-accent">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`
                        w-full justify-start gap-3 px-3 py-2 rounded-md transition-all duration-300
                        ${active 
                          ? 'cricket-primary font-semibold shadow-lg neon-border neon-glow' 
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md'
                        }
                      `}
                    >
                      <NavLink to={item.url}>
                        <Icon className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* My Profile Section */}
        {profileId && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-accent">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleProfileClick}
                    className={`
                      w-full justify-start gap-3 px-3 py-2 rounded-md transition-all duration-300
                      ${currentPath.startsWith('/profile') 
                        ? 'cricket-primary font-semibold shadow-lg neon-border neon-glow' 
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md'
                      }
                    `}
                  >
                    <UserCircle className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>My Profile</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
