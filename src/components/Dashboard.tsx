import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined as Play,
  PlusCircleOutlined as Plus,
  TrophyOutlined as Trophy,
  TrendingUpOutlined as TrendingUp,
  UserOutlined as User,
  DownloadOutlined as Download,
  BookOpenOutlined as BookOpen,
  AppstoreOutlined as Appstore,
  SettingOutlined as Setting,
  NotificationOutlined as Notification,
  AwardOutlined as Award,
  UserOutlined,
  MapPinOutlined as MapPin,
  UsersOutlined as Users,
} from '@ant-design/icons';
import LiveScoring from './LiveScoring';
import CreateMatch from './CreateMatch';
import EnhancedCricketScoreboard from './EnhancedCricketScoreboard';
import AdvancedAnalytics from './AdvancedAnalytics';
import EnhancedExportReport from './EnhancedExportReport';
import Documentation from './Documentation';
import VenueManagement from './VenueManagement';
import TournamentManagement from './TournamentManagement';
import Teams from "./Teams";
import PlayerProfiles from "./PlayerProfiles";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('live-scoring');
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobileView) {
      setIsDrawerVisible(!isDrawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const hideDrawer = () => {
    setIsDrawerVisible(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'live-scoring':
        return <LiveScoring />;
      case 'matches':
        return <CreateMatch />;
      case 'scoreboard':
        return <EnhancedCricketScoreboard />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'tournaments':
        return <TournamentManagement />;
      case 'teams':
        return <Teams />;
      case 'players':
        return <PlayerProfiles />;
      case 'venues':
        return <VenueManagement />;
      case 'export':
        return <EnhancedExportReport />;
      case 'documentation':
        return <Documentation />;
      default:
        return <LiveScoring />;
    }
  };

  const handleMenuClick = (e) => {
    setActiveTab(e.key);
    if (isMobileView) {
      hideDrawer();
    }
  };

  const sidebarItems = [
    { id: 'live-scoring', label: 'Live Scoring', icon: Play },
    { id: 'matches', label: 'Create Match', icon: Plus },
    { id: 'scoreboard', label: 'Scoreboard', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'tournaments', label: 'Tournaments', icon: Award },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'players', label: 'Players', icon: User },
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
  ];

  const menuItems = sidebarItems.map(item => ({
    key: item.id,
    icon: React.createElement(item.icon),
    label: item.label,
  }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobileView ? (
        <Drawer
          title="Cricket Dashboard"
          placement="left"
          onClick={hideDrawer}
          onClose={hideDrawer}
          visible={isDrawerVisible}
          style={{
            textAlign: 'left',
          }}
        >
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={[activeTab]}
            selectedKeys={[activeTab]}
            inlineCollapsed={false}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" style={{ color: 'white', textAlign: 'center', padding: '16px', fontSize: '20px' }}>
            {!collapsed ? 'Cricket Dashboard' : 'CD'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[activeTab]}
            selectedKeys={[activeTab]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
      )}
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: '0 16px',
            background: '#fff',
          }}
        >
          {React.createElement(isMobileView ? (isDrawerVisible ? MenuUnfoldOutlined : MenuFoldOutlined) : (collapsed ? MenuUnfoldOutlined : MenuFoldOutlined), {
            className: 'trigger',
            onClick: toggleSidebar,
          })}
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
