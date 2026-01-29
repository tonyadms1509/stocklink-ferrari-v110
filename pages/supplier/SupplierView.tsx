import React, { useState, useEffect } from 'react';
import { HomeIcon, ChartPieIcon, CubeIcon, UserCircleIcon, ClipboardDocumentListIcon, TagIcon, ChatBubbleLeftRightIcon, CreditCardIcon, ChartBarIcon, DocumentMagnifyingGlassIcon, TruckIcon, DocumentTextIcon, StarIcon, LightBulbIcon, ShieldExclamationIcon, BuildingLibraryIcon, PresentationChartLineIcon, UsersIcon, MegaphoneIcon, UserPlusIcon, WrenchScrewdriverIcon, QuestionMarkCircleIcon, SparklesIcon, TrophyIcon, UserGroupIcon, Bars3Icon, Cog6ToothIcon, GlobeAmericasIcon, MapIcon, EyeIcon } from '@heroicons/react/24/outline';
import SupplierDashboard from './SupplierDashboard';
import SupplierHome from './SupplierHome';
import ProductManagement from './ProductManagement';
import SupplierProfile from './SupplierProfile';
import OrderManagement from './OrderManagement';
import PromotionsManagement from './PromotionsManagement';
import Messages from '../shared/Messages';
import BillingPage from '../shared/BillingPage';
import BusinessIntelligencePage from './BusinessIntelligence';
import ViewStockRequests from './ViewStockRequests';
import LogisticsPage from './LogisticsPage';
import QuoteRequestsPage from './QuoteRequestsPage';
import SupplierReviewsPage from './SupplierReviewsPage';
import AIInventoryAssistant from './AIInventoryAssistant';
import BOMAssistant from './BOMAssistant';
import DisputesPage from '../shared/DisputesPage';
import TenderBoardPage from './TenderBoardPage';
import SalesLeadsPage from './SalesLeadsPage';
import CustomersPage from './CustomersPage';
import MarketingAssistantPage from './MarketingAssistantPage';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { SupplierTab, CompanyUserRole } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import ManageRentalsPage from './ManageRentalsPage';
import HelpPage from '../shared/HelpPage';
import ReferralsPage from '../shared/ReferralsPage';
import MarketPulsePage from './MarketPulsePage';
import RewardsPage from './RewardsPage';
import TeamPage from '../shared/TeamPage';
import DashboardLayout from '../../components/DashboardLayout';
import SettingsPage from '../shared/SettingsPage';
import SupplierMissionControl from './SupplierMissionControl';
import SupplierDemandMatrix from './SupplierDemandMatrix';
import LaunchCelebration from '../../components/LaunchCelebration';
import LogisticsDirectory from '../shared/LogisticsDirectory';
import NationalPriceWatch from '../shared/NationalPriceWatch.tsx';
import VaultPage from '../shared/VaultPage';

const SupplierView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SupplierTab>('home');
  const { conversations } = useData();
  const { user, currentCompany } = useAuth();
  const { t } = useLocalization();
  const [showLaunch, setShowLaunch] = useState(false);

  useEffect(() => {
    const hasLaunched = localStorage.getItem('ferrari_v80_sup_launched');
    if (!hasLaunched) {
        setShowLaunch(true);
        localStorage.setItem('ferrari_v80_sup_launched', 'true');
    }
  }, []);

  const unreadMessagesCount = currentCompany ? conversations.filter(c => c.unreadBy === currentCompany.id).length : 0;

  const renderContent = () => {
    if (!user) return null;
    switch (activeTab) {
      case 'home': return <SupplierHome onNavigate={(t) => setActiveTab(t as SupplierTab)} />;
      case 'mission-control': return <SupplierMissionControl />;
      case 'demand-matrix': return <SupplierDemandMatrix />;
      case 'dashboard': return <SupplierDashboard />;
      case 'intelligence': return <BusinessIntelligencePage onBack={() => setActiveTab('home')} />;
      case 'market-pulse': return <MarketPulsePage />;
      case 'price-watch': return <NationalPriceWatch />;
      case 'ai-assistant': return <AIInventoryAssistant onNavigate={(t) => setActiveTab(t as SupplierTab)} />;
      case 'bom-assistant': return <BOMAssistant onNavigate={(t) => setActiveTab(t as SupplierTab)} />;
      case 'leads': return <SalesLeadsPage onNavigate={(t) => setActiveTab(t as SupplierTab)} />;
      case 'products': return <ProductManagement onNavigate={(t) => setActiveTab(t as SupplierTab)} />;
      case 'manage-rentals': return <ManageRentalsPage />;
      case 'profile': return <SupplierProfile />;
      case 'orders': return <OrderManagement />
      case 'promotions': return <PromotionsManagement />;
      case 'logistics': return <LogisticsPage />;
      case 'fleet-hub': return <LogisticsDirectory />;
      case 'stock-requests': return <ViewStockRequests onStartChat={() => setActiveTab('messages')} />;
      case 'quotes': return <QuoteRequestsPage />;
      case 'tenders': return <TenderBoardPage />;
      case 'reviews': return <SupplierReviewsPage />;
      case 'customers': return <CustomersPage />;
      case 'rewards': return <RewardsPage />;
      case 'marketing-ai': return <MarketingAssistantPage />;
      case 'disputes': return <DisputesPage />;
      case 'vault': return <VaultPage />;
      case 'messages': return <Messages onNavigate={(t) => setActiveTab(t as SupplierTab)} onBack={() => setActiveTab('home')} />;
      case 'billing': return <BillingPage />;
      case 'team': return <TeamPage />;
      case 'referrals': return <ReferralsPage />;
      case 'help': return <HelpPage />;
      case 'settings': return <SettingsPage onBack={() => setActiveTab('home')} />;
      default: return <SupplierHome onNavigate={(t) => setActiveTab(t as SupplierTab)} />;
    }
  };

   const navGroups = [
    { title: 'Operational Command', items: [
        { id: 'home', label: 'Mission Overview', icon: HomeIcon },
        { id: 'mission-control', label: 'National HUD', icon: GlobeAmericasIcon },
        { id: 'demand-matrix', label: 'Demand Matrix', icon: MapIcon },
        { id: 'logistics', label: 'Local Fleet', icon: TruckIcon }
    ] },
    {
      title: 'Neural Intel',
      items: [
        { id: 'intelligence', label: 'Strategic Intel', icon: SparklesIcon },
        { id: 'market-pulse', label: 'Market Pulse', icon: PresentationChartLineIcon },
        { id: 'price-watch', label: 'Price Audit', icon: EyeIcon },
        { id: 'ai-assistant', label: 'Inventory AI', icon: LightBulbIcon },
      ],
    },
    {
      title: 'Pipeline & Settlement',
      items: [
        { id: 'orders', label: 'Active Payloads', icon: ClipboardDocumentListIcon },
        { id: 'quotes', label: 'Mandate Desk', icon: DocumentTextIcon },
        { id: 'tenders', label: 'Tender Board', icon: BuildingLibraryIcon },
        { id: 'vault', label: 'Assurance Vault', icon: CreditCardIcon },
      ],
    },
    {
      title: 'Merchant Hub',
      items: [
        { id: 'products', label: 'Unit Registry', icon: CubeIcon },
        { id: 'profile', label: 'Node Profile', icon: UserCircleIcon },
        { id: 'messages', label: 'Comms Uplink', icon: ChatBubbleLeftRightIcon, badge: unreadMessagesCount },
        { id: 'billing', label: 'Registry Ledger', icon: CreditCardIcon },
        { id: 'settings', label: 'Config', icon: Cog6ToothIcon },
      ],
    },
  ];
  
  const mobileNavItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'mission-control', icon: GlobeAmericasIcon, label: 'HUD' },
    { id: 'orders', icon: ClipboardDocumentListIcon, label: 'Orders' },
    { id: 'menu', icon: Bars3Icon, label: 'Menu', action: () => document.dispatchEvent(new CustomEvent('toggle-mobile-menu')) }, 
  ];

  return (
    <DashboardLayout
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab as SupplierTab)}
        navGroups={navGroups}
        mobileNavItems={mobileNavItems}
    >
        <div className="w-full relative">
            {renderContent()}
            <div className="ferrari-watermark">FERRARI OPS</div>
        </div>
        {showLaunch && <LaunchCelebration onClose={() => setShowLaunch(false)} />}
    </DashboardLayout>
  );
};

export default SupplierView;