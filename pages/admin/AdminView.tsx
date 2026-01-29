
import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminNodeRegistry from './AdminNodeRegistry';
import DashboardLayout from '../../components/DashboardLayout';
import DisputesPage from '../shared/DisputesPage';
import SettingsPage from '../shared/SettingsPage';
import { 
    LayoutGrid, Users, ShieldAlert, Settings,
    Terminal, Server, Globe, Activity
} from 'lucide-react';
import { AdminTab } from '../../types';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const navGroups = [
      {
          title: 'Sector Alpha: Command',
          items: [
              { id: 'dashboard', label: 'Grid Dashboard', icon: LayoutGrid },
              { id: 'registry', label: 'Node Registry', icon: Users },
          ]
      },
      {
          title: 'Infrastructure',
          items: [
              { id: 'disputes', label: 'Dispute Stack', icon: ShieldAlert },
              { id: 'settings', label: 'System Config', icon: Settings },
          ]
      }
  ];

  const mobileNavItems = [
      { id: 'dashboard', icon: LayoutGrid, label: 'Dash' },
      { id: 'registry', icon: Users, label: 'Nodes' },
      { id: 'menu', icon: Terminal, label: 'Menu', action: () => document.dispatchEvent(new CustomEvent('toggle-mobile-menu')) }, 
  ];

  const renderContent = () => {
      switch (activeTab) {
          case 'dashboard': 
              return <AdminDashboard />;
          case 'registry': 
              return <AdminNodeRegistry />;
          case 'disputes': 
              return <DisputesPage />;
          case 'settings': 
              return <SettingsPage onBack={() => setActiveTab('dashboard')} />;
          default: 
              return <AdminDashboard />;
      }
  };

  return (
    <DashboardLayout activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab as AdminTab)} navGroups={navGroups} mobileNavItems={mobileNavItems}>
        <div className="w-full relative">
            {renderContent()}
        </div>
    </DashboardLayout>
  );
};

export default AdminView;
