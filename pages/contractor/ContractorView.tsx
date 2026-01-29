
import React, { useState, useEffect } from 'react';
import { ContractorTab, Project, Jurisdiction, BuildingStandard, ProjectStatus } from '../../types.ts';
import DashboardLayout from '../../components/DashboardLayout.tsx';
import { 
    LayoutGrid, ShoppingCart, Briefcase, 
    Users, MessageSquare, Globe, Zap, 
    CreditCard, Search, 
    UserCircle, ShieldCheck, Banknote,
    Scale, UserPlus, Truck, SwatchBook, Layers, Flame, Activity, TrendingUp,
    Settings, Gift, Eye, FileSearch, Heart, Users2, BookOpen, Newspaper,
    ClipboardList, Mail, Radio, Plane,
    ShieldAlert, Inbox, Plus, Mic, Camera, FileCheck
} from 'lucide-react';

// Modules
import ContractorDashboard from './ContractorDashboard.tsx';
import { ContractorHome } from './ContractorHome.tsx';
import AISourcingPage from './AISourcingPage.tsx';
import MyProjects from './MyProjects.tsx';
import MyOrders from './MyOrders.tsx';
import MyQuotes from './MyQuotes.tsx';
import Messages from '../shared/Messages.tsx';
import { ProjectDetailsPage } from './ProjectDetailsPage.tsx';
import SiteReporterPage from './SiteReporterPage.tsx';
import AuthorityGateway from './AuthorityGateway.tsx';
import InvoicesPage from './InvoicesPage.tsx';
import ContractorProfilePage from './ContractorProfilePage.tsx';
import MyListings from './MyListings.tsx';
import SettingsPage from '../shared/SettingsPage.tsx';
import GridStrategyConsole from './GridStrategyConsole.tsx';
import VaultPage from '../shared/VaultPage.tsx';
import CommandBridge from '../shared/CommandBridge.tsx';
import RegulatoryPulse from './RegulatoryPulse.tsx';
import LaborMatrix from './LaborMatrix.tsx';
import StrikeModeSourcing from './StrikeModeSourcing.tsx';
import LaunchCelebration from '../../components/LaunchCelebration.tsx';
import OnboardingTour, { TourStep } from '../../components/OnboardingTour.tsx';
import LogisticsDirectory from '../shared/LogisticsDirectory.tsx';
import SafetyHubPage from './SafetyHubPage.tsx';
import AIDesignStudio from '../../components/AIDesignStudio.tsx';
import GridVitalsBar from '../../components/GridVitalsBar.tsx';
import BOMAnalyzer from './BOMAnalyzer.tsx';
import BOMReconciler from './BOMReconciler.tsx';
import StructuralDNAScanner from '../../components/StructuralDNAScanner.tsx';
import CapitalVelocity from '../../components/CapitalVelocity.tsx';
import ReferralsPage from '../shared/ReferralsPage.tsx';
import NationalPriceWatch from '../shared/NationalPriceWatch.tsx';
import TeamHealthAI from './TeamHealthAI.tsx';
import SyndicateHub from './SyndicateHub.tsx';
import BuildersHubPage from '../shared/BuildersHubPage.tsx';
import SiteDiaryPage from './SiteDiaryPage.tsx';
import OnSiteDashboard from './OnSiteDashboard.tsx';
import CommsTerminal from './CommsTerminal.tsx';
import BillingPage from '../shared/BillingPage.tsx';
import ContractorLedger from './ContractorLedger.tsx';
import ClientInbox from './ClientInbox.tsx';
import VariationOrdersPage from './VariationOrdersPage.tsx';
import DroneScoutPage from './DroneScoutPage.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import VoiceMemoModal from '../../components/VoiceMemoModal.tsx';

const ContractorView: React.FC = () => {
    const { projects = [], clientMessages = [], isRuggedMode } = useData();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ContractorTab>('dashboard');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showLaunch, setShowLaunch] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    useEffect(() => {
        const hasLaunched = localStorage.getItem('ferrari_v110_launched');
        if (!hasLaunched) {
            setShowLaunch(true);
            localStorage.setItem('ferrari_v110_launched', 'true');
        }
    }, []);

    const handleNavigate = (tab: ContractorTab, projectToView: Project | null = null) => {
        if (projectToView) {
            setSelectedProject(projectToView);
        } else if (tab !== 'project-details' && tab !== 'on-site') {
            setSelectedProject(null);
        }
        setActiveTab(tab);
    };

    const handleViewProject = (project: Project) => {
        handleNavigate('project-details', project);
    };

    if (activeTab === 'on-site') {
        return (
            <OnSiteDashboard 
                onExit={() => handleNavigate('dashboard')} 
                onNavigate={(tab) => handleNavigate(tab as ContractorTab, selectedProject)} 
                onOpenAssistant={() => setIsVoiceOpen(true)} 
            />
        );
    }

    const unreadClientMsgs = clientMessages.filter(m => !m.isRead).length;

    const tourSteps: TourStep[] = [
        { targetId: 'ignition-btn', title: 'Tactical Ignition', content: 'Engage the Cockpit HUD for simplified, ruggedized access to critical project tools in the field.' },
        { targetId: 'briefing-card', title: 'Neural Pulse', content: 'Monitor real-time material trends, grid stability, and site-specific AI briefings.' }
    ];

    const navGroups = [
        {
            title: 'Sector Alpha: Command',
            items: [
                { id: 'dashboard', label: 'Mission HUD', icon: LayoutGrid },
                { id: 'command-bridge', label: 'National Bridge', icon: Globe },
                { id: 'grid-strategy', label: 'Power Strategy', icon: Zap },
                { id: 'strike-mode', label: 'Strike Mode', icon: Flame },
            ]
        },
        {
            title: 'Sector Beta: Comms',
            items: [
                { id: 'client-inbox', label: 'Stakeholder Comms', icon: Inbox, badge: unreadClientMsgs },
                { id: 'comms-terminal', label: 'Email Forge', icon: Mail },
                { id: 'messages', label: 'Live Grid Chat', icon: MessageSquare },
            ]
        },
        {
            title: 'Sector Gamma: Intel',
            items: [
                { id: 'regulatory-pulse', label: 'SANS Protocol', icon: Scale },
                { id: 'structural-dna', label: 'Structural DNA', icon: Layers },
                { id: 'team-health', label: 'Team Pulse', icon: Heart },
                { id: 'labor-matrix', label: 'Labor Matrix', icon: UserPlus },
            ]
        },
        {
            title: 'Sector Delta: Market',
            items: [
                { id: 'home', label: 'Global Store', icon: ShoppingCart },
                { id: 'ai-sourcing', label: 'Neural Sourcing', icon: Search },
                { id: 'price-watch', label: 'Price Watch', icon: Eye },
                { id: 'fleet-hub', label: 'Verified Carriers', icon: Truck },
                { id: 'syndicate-hub', label: 'Syndicate Hub', icon: Users },
            ]
        },
        {
            title: 'Sector Epsilon: Ops',
            items: [
                { id: 'projects', label: 'Site Registry', icon: Briefcase },
                { id: 'drone-scout', label: 'Drone Recon', icon: Plane },
                { id: 'variations', label: 'Variation Orders', icon: FileCheck },
                { id: 'site-diary', label: 'Daily Dossier', icon: BookOpen },
                { id: 'bom-analyzer', label: 'BOM Intercept', icon: FileSearch },
                { id: 'safety-ai', label: 'Safety Shield', icon: ShieldCheck },
            ]
        },
        {
            title: 'Settlement Desk',
            items: [
                { id: 'ledger', label: 'Master Ledger', icon: Banknote },
                { id: 'billing', label: 'Invoice Ledger', icon: ClipboardList },
                { id: 'vault', label: 'Assurance Vault', icon: ShieldCheck },
                { id: 'orders', label: 'Active Payloads', icon: Truck },
                { id: 'quotes', label: 'Mandate Desk', icon: Banknote },
            ]
        },
        {
            title: 'Registry Hub',
            items: [
                { id: 'profile', label: 'Node Profile', icon: UserCircle },
                { id: 'referrals', label: 'Expansion (R50)', icon: Gift },
                { id: 'settings', label: 'System Config', icon: Settings },
            ]
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <ContractorDashboard onNavigate={(tab) => handleNavigate(tab as ContractorTab)} onEnterOnSiteMode={() => handleNavigate('on-site')} />;
            case 'client-inbox': return <ClientInbox />;
            case 'variations': return <VariationOrdersPage />;
            case 'drone-scout': return <DroneScoutPage />;
            case 'ledger': return <ContractorLedger />;
            case 'billing': return <InvoicesPage onBack={() => handleNavigate('dashboard')} />;
            case 'comms-terminal': return <CommsTerminal />;
            case 'builders-hub': return <BuildersHubPage onBack={() => handleNavigate('dashboard')} />;
            case 'site-diary': return <SiteDiaryPage onBack={() => handleNavigate('dashboard')} />;
            case 'command-bridge': return <CommandBridge />;
            case 'grid-strategy': return <GridStrategyConsole />;
            case 'strike-mode': return <StrikeModeSourcing onBack={() => handleNavigate('dashboard')} />;
            case 'regulatory-pulse': return <RegulatoryPulse />;
            case 'syndicate-hub': return <SyndicateHub />;
            case 'team-health': return <TeamHealthAI />;
            case 'structural-dna': 
                const defaultProject: Project = projects[0] || { 
                    id: 'temp', 
                    projectName: 'Active Site', 
                    contractorId: 'none', 
                    clientName: 'N/A', 
                    address: 'Pending', 
                    jurisdiction: Jurisdiction.SouthAfrica, 
                    standard: BuildingStandard.SANS10400, 
                    status: ProjectStatus.Planning, 
                    createdAt: new Date() 
                };
                return <StructuralDNAScanner project={defaultProject} />;
            case 'capital-velocity': return <CapitalVelocity />;
            case 'labor-matrix': return <LaborMatrix />;
            case 'bom-analyzer': return <BOMAnalyzer />;
            case 'bom-intercept': return <BOMReconciler onBack={() => handleNavigate('dashboard')} />;
            case 'price-watch': return <NationalPriceWatch />;
            case 'design-studio': return <AIDesignStudio />;
            case 'vault': return <VaultPage />;
            case 'fleet-hub': return <LogisticsDirectory />;
            case 'referrals': return <ReferralsPage />;
            case 'ai-sourcing': return <AISourcingPage onNavigateToCart={() => handleNavigate('quotes')} onBack={() => handleNavigate('dashboard')} />;
            case 'projects': return <MyProjects onViewProject={handleViewProject} onBack={() => handleNavigate('dashboard')} />;
            case 'project-details': return selectedProject ? <ProjectDetailsPage project={selectedProject} onBack={() => handleNavigate('projects')} onNavigate={(tab) => handleNavigate(tab as ContractorTab, selectedProject)} /> : <MyProjects onViewProject={handleViewProject} onBack={() => handleNavigate('dashboard')} />;
            case 'home': return <ContractorHome onViewSupplier={() => {}} onStartChat={() => handleNavigate('messages')} />;
            case 'quotes': return <MyQuotes onNavigateToOrders={() => handleNavigate('orders')} onStartNegotiation={() => handleNavigate('messages')} onBack={() => handleNavigate('dashboard')} />;
            case 'orders': return <MyOrders onNavigateToCart={() => handleNavigate('quotes')} onBack={() => handleNavigate('dashboard')} />;
            case 'messages': return <Messages onNavigate={(tab) => handleNavigate(tab as ContractorTab)} onBack={() => handleNavigate('dashboard')} />;
            case 'site_reporter': return <SiteReporterPage onBack={() => handleNavigate('dashboard')} />;
            case 'safety-ai': return <SafetyHubPage onBack={() => handleNavigate('dashboard')} />;
            case 'authority-gateway': return <AuthorityGateway />;
            case 'profile': return <ContractorProfilePage onBack={() => handleNavigate('dashboard')} />;
            case 'settings': return <SettingsPage onBack={() => handleNavigate('dashboard')} />;
            default: return <ContractorDashboard onNavigate={(tab) => handleNavigate(tab as ContractorTab)} onEnterOnSiteMode={() => handleNavigate('on-site')} />;
        }
    };

    const mobileNavItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dash' },
        { id: 'projects', icon: Briefcase, label: 'Sites' },
        { id: 'ai-sourcing', icon: Search, label: 'Source' },
        { id: 'menu', icon: Users, label: 'Menu', action: () => document.dispatchEvent(new CustomEvent('toggle-mobile-menu')) }, 
    ];

    return (
        <DashboardLayout activeTab={activeTab} onNavigate={(tab) => handleNavigate(tab as ContractorTab)} navGroups={navGroups} mobileNavItems={mobileNavItems}>
            <div className="w-full relative">
                <GridVitalsBar />
                <div className="p-8">
                    {renderContent()}
                </div>
                <div className="ferrari-watermark"></div>
            </div>
            {showLaunch && <LaunchCelebration onClose={() => { setShowLaunch(false); setShowTour(true); }} />}
            {showTour && <OnboardingTour steps={tourSteps} isOpen={showTour} onComplete={() => setShowTour(false)} onSkip={() => setShowTour(false)} />}
            {isVoiceOpen && <VoiceMemoModal projectId={selectedProject?.id || 'main'} onClose={() => setIsVoiceOpen(false)} onApply={() => setIsVoiceOpen(false)} />}
        </DashboardLayout>
    );
};

export default ContractorView;
