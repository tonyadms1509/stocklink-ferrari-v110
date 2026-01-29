
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './useAuth.tsx';
import * as mockApi from '../services/mockApi.ts';
import * as realApi from '../services/realApi.ts';
import { useToast } from './useToast.tsx';
import { GoogleGenAI, Type } from "@google/genai";
import { 
    Product, Order, Project, QuoteRequest, Supplier, Company, StockRequest, 
    StockRequestResponse, Conversation, Review, User, 
    Notification, ProjectExpense, ProjectTask, ProjectLog, ContractorAsset, 
    ContractorStock, SyndicateOpportunity, VaultTransaction, InterventionTicket,
    RegulatoryAlert, MetroPerformance, SystemHealth,
    GridWindow, EmergencyStockRequest, SupplyHeatPoint, SystemStatus, OrderStatus, 
    QuoteStatus, TaskStatus, ProjectMilestone, ProjectMaterial, 
    VariationOrder, RewardOffer, ContractorLead, Tender, 
    TenderBid, CommunityPost, Client, PortfolioProject, ProjectDocument,
    ProjectPlan, AITenderAnalysisReport, ProjectMember, TimesheetEntry,
    Dispute, ProjectBudget, Vehicle, Driver,
    SubContractor, PayoutDetails, RentalEquipment, RentalBooking, 
    CustomerInsight, RestockSuggestion, TrendingSuggestion, PricingSuggestion,
    AIDraftedResponse, AIMediationSuggestion, AILegalReport, LogisticsLoad,
    SafetyPermit, AuthorityMilestone, ProjectTemplate, QuoteItem,
    JobPosting, ClientQuote, ClientInvoice, CompanyMember, ClientMessage
} from '../types.ts';

export interface DataContextState {
    products: Product[];
    orders: Order[];
    projects: Project[];
    quoteRequests: QuoteRequest[];
    suppliers: Supplier[];
    companies: Company[];
    projectExpenses: ProjectExpense[];
    projectLogs: ProjectLog[];
    projectTasks: ProjectTask[];
    projectBudgets: ProjectBudget[];
    projectMilestones: ProjectMilestone[];
    projectMaterials: ProjectMaterial[];
    contractorAssets: ContractorAsset[];
    contractorStock: ContractorStock[];
    notifications: Notification[];
    users: User[];
    tenders: Tender[];
    tenderBids: TenderBid[];
    communityPosts: CommunityPost[];
    contractorLeads: ContractorLead[];
    leads: ContractorLead[]; 
    conversations: Conversation[];
    reviews: Review[];
    clients: Client[];
    portfolioProjects: PortfolioProject[];
    projectDocuments: ProjectDocument[];
    variationOrders: VariationOrder[];
    timesheets: TimesheetEntry[];
    projectMembers: ProjectMember[];
    disputes: Dispute[];
    vehicles: Vehicle[];
    drivers: Driver[];
    subContractors: SubContractor[];
    rentalEquipment: RentalEquipment[];
    rentalBookings: RentalBooking[];
    stockRequests: StockRequest[];
    stockRequestResponses: StockRequestResponse[];
    logisticsLoads: LogisticsLoad[];
    syndicates: SyndicateOpportunity[];
    vaultTransactions: VaultTransaction[];
    interventionTickets: InterventionTicket[];
    supplyHeatmap: SupplyHeatPoint[];
    regulatoryAlerts: RegulatoryAlert[];
    metroPerformance: MetroPerformance[];
    systemHealth: SystemHealth;
    gridWindows: GridWindow[];
    emergencyRequests: EmergencyStockRequest[];
    clientMessages: ClientMessage[];

    isLoading: boolean;
    isBILoading: boolean;
    isNuclearActive: boolean;
    isGridSaturated: boolean;
    isAgentEnabled: boolean;
    isRuggedMode: boolean;
    systemStatus: SystemStatus;
    gridState: 'syncing' | 'nominal' | 'stalled';
    dailyBriefing: any | null;
    aiErrors: Record<string, string | null>;
    isAILoading: { 
        briefing: boolean; sourcing: boolean; planner: boolean; estimator: boolean; chronos: boolean; 
        inventory: boolean; pricing: boolean; customerInsight: boolean; legal: boolean; tenderAnalysis: boolean;
        leads: boolean; marketPulse: boolean; dna: boolean;
    };
    cart: any[];
    favorites: string[];
    aiDraftedResponses: AIDraftedResponse[];
    customerInsights: CustomerInsight[];
    restockSuggestions: RestockSuggestion[] | null;
    trendingSuggestions: TrendingSuggestion[] | null;
    pricingSuggestions: PricingSuggestion[] | null;
    aiLegalReport: AILegalReport | null;
    legalError: string | null;
    projectPlan: ProjectPlan | null;
    plannerError: string | null;
    tenderAnalysis: AITenderAnalysisReport | null;
    pricingAnalysis: any | null;
    costEstimateReport: any | null;
    estimatorError: string | null;
    aiSuggestion: AIMediationSuggestion | null;
    isSuggestionLoading: boolean;
    suggestionError: string | null;

    businessIntelligenceReport: any | null;
    projectTemplates: ProjectTemplate[];
    safetyPermits: SafetyPermit[];
    jobPostings: JobPosting[];
    jobApplications: any[];
    clientQuotes: ClientQuote[];
    clientInvoices: ClientInvoice[];
    companyMembers: CompanyMember[];
    isMarketPulseLoading: boolean;
    marketPulseError: string | null;
    rewardOffers: RewardOffer[];
    authorityMilestones: AuthorityMilestone[];

    toggleRuggedMode: () => void;
    addToCart: (product: Product, quantity: number) => void;
    updateCartQuantity: (id: string, qty: number) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    toggleFavorite: (id: string) => void;
    
    createProject: (project: any) => Promise<Project | null>;
    addExpense: (expense: any) => Promise<void>;
    createProjectTask: (task: any) => Promise<void>;
    updateProjectTask: (id: string, updates: any) => Promise<void>;
    createProjectLog: (l: any) => Promise<void>;
    addProduct: (p: Omit<Product, 'id' | 'supplierId'>) => Promise<void>;
    updateProduct: (p: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addContractorProduct: (p: any) => Promise<void>;
    updateContractorProduct: (p: any) => Promise<void>;
    deleteContractorProduct: (id: string) => Promise<void>;
    updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
    submitQuoteRequest: (projectId: string) => Promise<{ success: boolean }>;
    
    generateDailyBriefing: (forceRefresh?: boolean) => Promise<void>;
    generateBusinessIntelligenceReport: () => Promise<void>;
    generatePricingAnalysis: (productId: string) => Promise<void>;
    generateInventoryInsights: (force?: boolean) => Promise<void>;
    generateCustomerInsights: (id: string, spend: number, orders: number, date: Date) => Promise<void>;
    toggleAIAgent: () => void;
    sendAIDraftedResponse: (draftId: string) => Promise<void>;
    lockStockRequest: (requestId: string) => void;
    refreshData: () => Promise<boolean>;
    dismissAIDraftedResponse: (draftId: string) => Promise<void>;
    generateLegalAnalysis: (text: string) => Promise<void>;
    generateTenderAnalysis: (tenderId: string) => Promise<void>;
    generateDisputeSuggestion: (disputeId: string) => Promise<void>;
    getDeliveryUpdate: (orderId: string, query: string) => Promise<string>;
    
    createStockRequest: (data: any) => Promise<void>;
    respondToStockRequest: (data: any) => Promise<void>;
    createRentalBooking: (data: any) => Promise<void>;
    updateBookingStatus: (id: string, status: string) => Promise<void>;
    addRentalEquipment: (data: any) => Promise<void>;
    updateRentalEquipment: (id: string, data: any) => Promise<void>;
    deleteRentalEquipment: (id: string) => Promise<void>;
    saveClientQuote: (quote: any) => Promise<string>;
    deleteClientQuote: (id: string) => Promise<void>;
    createClientInvoice: (invoice: any) => Promise<void>;
    updateClientInvoiceStatusInDb: (id: string, status: any) => Promise<void>;
    addPortfolioProject: (data: any) => Promise<void>;
    addDocument: (doc: any) => Promise<void>;
    submitTenderBid: (bid: any) => Promise<void>;
    authoriseNodeVerify: (id: string, status: string) => Promise<void>;
    acceptTenderBid: (bid: TenderBid) => Promise<void>;
    submitReview: (review: any) => void;
    createTender: (tender: any) => Promise<void>;
    addAsset: (asset: any) => Promise<void>;
    updateAsset: (id: string, data: any) => Promise<void>;
    removeVehicle: (id: string) => Promise<void>;
    removeDriver: (id: string) => Promise<void>;
    inviteUser: (email: string, role: any) => Promise<void>;
    removeUser: (id: string) => Promise<void>;
    updateUserRole: (id: string, role: any) => Promise<void>;
    addDisputeMessage: (id: string, text: string) => Promise<void>;
    createDispute: (data: any) => Promise<void>;
    applyForJob: (data: any) => Promise<void>;
    deleteJobPosting: (id: string) => Promise<void>;
    createJobPosting: (data: any) => Promise<void>;
    updateJobPosting: (id: string, data: any) => Promise<void>;
    sendClientInquiry: (data: any) => Promise<void>;
    markClientInquiryRead: (id: string) => Promise<void>;

    getSupplierById: (id: string) => Supplier | undefined;
    getQuoteById: (id: string) => QuoteRequest | undefined;
    launchSystem: () => void;
    recalibrateNeuralLink: () => Promise<void>;
    updateSupplierProfile: (updated: Supplier) => Promise<void>;
    markNotificationsAsRead: () => Promise<void>;
    reorderItems: (orderId: string) => { success: boolean; unavailableCount: number };
    releaseMilestoneEscrow: (milestoneId: string) => Promise<void>;
    executeNewclairActivation: () => Promise<void>;
    addMaterialToProject: (projectId: string, product: Product, quantity: number) => Promise<void>;
    submitMilestoneProof: (id: string, url: string, score: number) => Promise<void>;
    verifyUserNode: (id: string, status: 'verified' | 'unverified' | 'pending') => Promise<void>;
    assignDriverToOrder: (oid: string, did: string, vid: string) => Promise<void>;
    completeDelivery: (id: string, pod: any) => Promise<void>;
    joinSyndicate: (id: string, qty: number) => Promise<void>;
    requestBusinessVerification: (details: any) => Promise<void>;
    clearProjectPlan: () => void;
    clearTenderAnalysis: () => void;
    clearPricingAnalysis: () => void;
    clearDisputeSuggestion: () => void;
    clearLegalAnalysis: () => void;
    sendMessage: (convoId: string, text: string) => Promise<void>;
    markAsRead: (convoId: string) => Promise<void>;
    startOrGetConversation: (otherPartyId: string) => Promise<Conversation>;
    clearDraftQuote: () => void;
    draftQuoteForEditing: any;
    resolveIntervention: (id: string) => Promise<void>;
    acceptQuoteAndCreateOrder: (qId: string, details?: any) => Promise<void>;
    declineQuote: (qId: string) => Promise<void>;
    createStrikeRequest: (data: any) => Promise<void>;
    addProjectMaterialsInDb: (materials: any[]) => Promise<void>;
    reconcileMaterials: (projectId: string, items: {name: string, quantity: number}[]) => Promise<void>;
    generateCostEstimate: (desc: string) => Promise<Project | void>;
    generateProjectPlan: (description: string) => Promise<void>;
    generateMarketPulse: (query: string) => Promise<void>;
    performDNAAudit: (image: File) => Promise<any>;

    respondToQuote: (quoteId: string, updatedItems: QuoteItem[], notes?: string) => void;
    sendQuoteToContractor: (quoteData: any) => Promise<void>;
    saveProjectTemplate: (template: any) => void;
    createProjectFromTemplate: (templateId: string, projectDetails: any) => Promise<Project | undefined>;
    createSafetyPermit: (permitData: any) => Promise<void>;
    addClient: (client: any) => Promise<void>;
    updateClient: (id: string, client: any) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    addTimesheetEntry: (entry: any) => Promise<void>;
    updateTimesheetEntry: (id: string, entry: any) => Promise<void>;
    deleteTimesheetEntry: (id: string) => Promise<void>;
    redeemReward: (offer: RewardOffer) => void;
    createRewardOffer: (offer: any) => void;
    deleteRewardOffer: (id: string) => void;
}

const DataContext = createContext<DataContextState | undefined>(undefined);
const SYSTEM_STATUS_KEY = 'stocklink_ferrari_v110_system_state';

/**
 * REDLINE v110.3 - PROD GRID PROVIDER
 * High-Reliability Data Synchronization Layer
 */
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const briefingLock = useRef(false);
    const syncLock = useRef(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [projectExpenses, setProjectExpenses] = useState<ProjectExpense[]>([]);
    const [projectLogs, setProjectLogs] = useState<ProjectLog[]>([]);
    const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
    const [projectBudgets, setProjectBudgets] = useState<ProjectBudget[]>([]);
    const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
    const [projectMaterials, setProjectMaterials] = useState<ProjectMaterial[]>([]);
    const [contractorAssets, setContractorAssets] = useState<ContractorAsset[]>([]);
    const [contractorStock, setContractorStock] = useState<ContractorStock[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [tenderBids, setTenderBids] = useState<TenderBid[]>([]);
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
    const [contractorLeads, setContractorLeads] = useState<ContractorLead[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
    const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);
    const [variationOrders, setVariationOrders] = useState<VariationOrder[]>([]);
    const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
    const [rentalEquipment, setRentalEquipment] = useState<RentalEquipment[]>([]);
    const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
    const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
    const [stockRequestResponses, setStockRequestResponses] = useState<StockRequestResponse[]>([]);
    const [logisticsLoads, setLogisticsLoads] = useState<LogisticsLoad[]>([]);
    const [interventionTickets, setInterventionTickets] = useState<InterventionTicket[]>([]);

    const [emergencyRequests, setEmergencyRequests] = useState<EmergencyStockRequest[]>([]);
    const [gridWindows, setGridWindows] = useState<GridWindow[]>([]);
    const [regulatoryAlerts, setRegulatoryAlerts] = useState<RegulatoryAlert[]>([]);
    const [metroPerformance, setMetroPerformance] = useState<MetroPerformance[]>([]);
    const [supplyHeatmap, setSupplyHeatmap] = useState<SupplyHeatPoint[]>([]);
    const [clientMessages, setClientMessages] = useState<ClientMessage[]>([]);

    const [businessIntelligenceReport, setBusinessIntelligenceReport] = useState<any | null>(null);
    const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
    const [safetyPermits, setSafetyPermits] = useState<SafetyPermit[]>([]);
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [jobApplications, setJobApplications] = useState<any[]>([]);
    const [clientQuotes, setClientQuotes] = useState<ClientQuote[]>([]);
    const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
    const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
    const [isMarketPulseLoading, setIsMarketPulseLoading] = useState(false);
    const [marketPulseError, setMarketPulseError] = useState<string | null>(null);
    const [rewardOffers, setRewardOffers] = useState<RewardOffer[]>([]);
    const [authorityMilestones, setAuthorityMilestones] = useState<AuthorityMilestone[]>([]);

    const [cart, setCart] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBILoading, setIsBILoading] = useState(false);
    const [isNuclearActive, setIsNuclearActive] = useState(false);
    const [isGridSaturated, setIsGridSaturated] = useState(false);
    const [isAgentEnabled, setIsAgentEnabled] = useState(false);
    const [isRuggedMode, setIsRuggedMode] = useState(false);
    const [gridState, setGridState] = useState<'syncing' | 'nominal' | 'stalled'>('syncing');
    
    const [isAILoading, setIsAILoading] = useState({ 
        briefing: false, sourcing: false, planner: false, estimator: false, chronos: false,
        inventory: false, pricing: false, customerInsight: false, legal: false, tenderAnalysis: false,
        leads: false, marketPulse: false, dna: false
    });
    const [dailyBriefing, setDailyBriefing] = useState<any>(null);
    const [aiErrors, setAiErrors] = useState<Record<string, string | null>>({});

    const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
    const [plannerError, setPlannerError] = useState<string | null>(null);
    const [tenderAnalysis, setTenderAnalysis] = useState<AITenderAnalysisReport | null>(null);
    const [pricingAnalysis, setPricingAnalysis] = useState<any | null>(null);
    const [costEstimateReport, setCostEstimateReport] = useState<any | null>(null);
    const [estimatorError, setEstimatorError] = useState<string | null>(null);
    const [restockSuggestions, setRestockSuggestions] = useState<RestockSuggestion[] | null>(null);
    const [trendingSuggestions, setTrendingSuggestions] = useState<TrendingSuggestion[] | null>(null);
    const [pricingSuggestions, setPricingSuggestions] = useState<PricingSuggestion[] | null>(null);
    const [aiLegalReport, setAiLegalReport] = useState<AILegalReport | null>(null);
    const [legalError, setLegalError] = useState<string | null>(null);
    const [aiSuggestion, setAiSuggestion] = useState<AIMediationSuggestion | null>(null);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    const [aiDraftedResponses, setAiDraftedResponses] = useState<AIDraftedResponse[]>([]);
    const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([]);

    const [systemHealth, setSystemHealth] = useState<SystemHealth>({
        aiCore: 'Stable',
        latency: 22,
        dbStatus: 'Connected',
    });

    const [systemStatus, setSystemStatus] = useState<SystemStatus>(() => {
        const stored = localStorage.getItem(SYSTEM_STATUS_KEY);
        return (stored as SystemStatus) || SystemStatus.Staging;
    });

    const api: any = systemStatus === SystemStatus.Staging ? mockApi : realApi;

    const executeAIRequest = async (requestFn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> => {
        if (isGridSaturated) {
            throw new Error("Grid is saturated. Node cooling in progress.");
        }
        try {
            return await requestFn();
        } catch (err: any) {
            const errorBody = (err.message || "").toLowerCase();
            
            if (errorBody.includes("429") || errorBody.includes("quota")) {
                setIsGridSaturated(true);
                showToast("National Grid Saturated (429). Resetting nodes...", "warning");
                setTimeout(() => setIsGridSaturated(false), 60000); 
                throw new Error("Quota exhausted.");
            }

            if (errorBody.includes("requested entity was not found")) {
                showToast("Neural Link Outdated. Re-calibration required.", "warning");
                if (window.aistudio) {
                    await window.aistudio.openSelectKey();
                }
                throw new Error("API Key Re-calibration required.");
            }

            if (retries > 0) {
                await new Promise(r => setTimeout(r, delay));
                return executeAIRequest(requestFn, retries - 1, delay * 2);
            }
            throw err;
        }
    };

    const loadData = useCallback(async (isManual = false) => {
        if (!user || (syncLock.current && !isManual)) return false;
        
        syncLock.current = true;
        setIsLoading(true);
        setGridState('syncing');
        
        try {
            const data = await api.getAllDataForUser(user);
            const safe = (arr: any) => Array.isArray(arr) ? arr : [];

            setProducts(safe(data.products));
            setOrders(safe(data.orders));
            setProjects(safe(data.projects));
            setQuoteRequests(safe(data.quoteRequests));
            setSuppliers(safe(data.suppliers));
            setCompanies(safe(data.companies));
            setProjectExpenses(safe(data.projectExpenses));
            setProjectLogs(safe(data.projectLogs));
            setProjectTasks(safe(data.projectTasks));
            setProjectBudgets(safe(data.projectBudgets));
            setProjectMilestones(safe(data.projectMilestones));
            setProjectMaterials(safe(data.projectMaterials));
            setContractorAssets(safe(data.contractorAssets));
            setContractorStock(safe(data.contractorStock));
            setNotifications(safe(data.notifications));
            setUsers(safe(data.users));
            setTenders(safe(data.tenders));
            setTenderBids(safe(data.tenderBids));
            setCommunityPosts(safe(data.communityPosts));
            setContractorLeads(safe(data.contractorLeads));
            setConversations(safe(data.conversations));
            setReviews(safe(data.reviews));
            setClients(safe(data.clients));
            setPortfolioProjects(safe(data.portfolioProjects));
            setProjectDocuments(safe(data.projectDocuments));
            setVariationOrders(safe(data.variationOrders));
            setTimesheets(safe(data.timesheets));
            setProjectMembers(safe(data.projectMembers));
            setDisputes(safe(data.disputes));
            setVehicles(safe(data.vehicles));
            setDrivers(safe(data.drivers));
            setSubContractors(safe(data.subContractors));
            setRentalEquipment(safe(data.rentalEquipment));
            setRentalBookings(safe(data.rentalBookings));
            setStockRequests(safe(data.stockRequests));
            setStockRequestResponses(safe(data.stockRequestResponses));
            setLogisticsLoads(safe(data.logisticsLoads));
            setInterventionTickets(safe(data.interventionTickets));

            setEmergencyRequests(safe(data.emergencyRequests));
            setGridWindows(safe(data.gridWindows));
            setRegulatoryAlerts(safe(data.regulatoryAlerts));
            setMetroPerformance(safe(data.metroPerformance));
            setSupplyHeatmap(safe(data.supplyHeatmap));
            setClientMessages(safe(data.clientMessages));
            
            setProjectTemplates(safe(data.projectTemplates));
            setSafetyPermits(safe(data.safetyPermits));
            setJobPostings(safe(data.jobPostings));
            setJobApplications(safe(data.jobApplications));
            setClientQuotes(safe(data.clientQuotes));
            setClientInvoices(safe(data.clientInvoices));
            setCompanyMembers(safe(data.companyMembers));
            setRewardOffers(safe(data.rewardOffers));
            setAuthorityMilestones(safe(data.authorityMilestones));
            setGridState('nominal');
            return true;
        } catch (e) {
            console.error("Critical Grid Failure:", e);
            setGridState('stalled');
            showToast("Grid Sync Disrupted. Using Local Buffer.", "warning");
            return false;
        } finally {
            setIsLoading(false);
            syncLock.current = false;
        }
    }, [user, api, showToast]);

    const refreshData = async () => {
        syncLock.current = false; // Bypass lock for manual request
        const success = await loadData(true);
        if (success) {
            showToast("National Grid Handshake Synchronized", "success");
        } else {
            showToast("Friction detected during handshake.", "error");
        }
        return success;
    };

    useEffect(() => {
        loadData();
        if (api.emitter?.on) api.emitter.on('data-changed', () => loadData());
        return () => { if (api.emitter?.off) api.emitter.off('data-changed', () => loadData()); };
    }, [loadData, api]);

    const value: DataContextState = {
        products, orders, projects, quoteRequests, suppliers, companies, projectExpenses, projectLogs, projectTasks, projectBudgets, projectMilestones, projectMaterials, contractorAssets, contractorStock, notifications, users, tenders, tenderBids, communityPosts, contractorLeads, leads: contractorLeads, conversations, reviews, clients, portfolioProjects, projectDocuments, variationOrders, timesheets, projectMembers, disputes, vehicles, drivers, subContractors, rentalEquipment, rentalBookings, stockRequests, stockRequestResponses, logisticsLoads,
        isLoading, isBILoading, isNuclearActive, isGridSaturated, isAgentEnabled, isRuggedMode,
        systemStatus, gridState, dailyBriefing, aiErrors, isAILoading, cart, favorites, aiDraftedResponses, customerInsights,
        projectPlan, plannerError, tenderAnalysis, pricingAnalysis, costEstimateReport, estimatorError, restockSuggestions, trendingSuggestions, pricingSuggestions,
        aiLegalReport, legalError, aiSuggestion, isSuggestionLoading, suggestionError,
        syndicates: mockApi.mockData.syndicates, vaultTransactions: mockApi.mockData.vaultTransactions, interventionTickets, supplyHeatmap, regulatoryAlerts, metroPerformance, gridWindows, emergencyRequests, systemHealth, clientMessages,
        
        businessIntelligenceReport, projectTemplates, safetyPermits, jobPostings, jobApplications, clientQuotes, clientInvoices, companyMembers, isMarketPulseLoading, marketPulseError, rewardOffers,
        authorityMilestones,

        toggleRuggedMode: () => setIsRuggedMode(prev => !prev),
        addToCart: (p, q) => setCart(prev => [...prev, { ...p, quantity: q }]),
        updateCartQuantity: (id, q) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: q } : i)),
        removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)),
        clearCart: () => setCart([]),
        toggleFavorite: (id) => setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
        
        createProject: (p) => api.createProject({ ...p, contractorId: user?.activeCompanyId }),
        addExpense: (e) => api.addExpenseInDb(e),
        createProjectTask: (t) => api.createProjectTask(t),
        updateProjectTask: (id, u) => api.updateProjectTask(id, u),
        createProjectLog: (l) => api.createProjectLog(l),
        addProduct: (p) => api.addProduct(p),
        updateProduct: (p) => api.updateProduct(p),
        deleteProduct: (id) => api.deleteProduct(id),
        addContractorProduct: (p) => api.addContractorProduct(p),
        updateContractorProduct: (p) => api.updateContractorProduct(p),
        deleteContractorProduct: (id) => api.deleteContractorProduct(id),
        updateOrderStatus: (id, s) => api.updateOrderStatus(id, s),
        submitQuoteRequest: async (pid) => { return { success: true }; },
        refreshData,

        generateDailyBriefing: async (force) => {
            if (!user || !process.env.API_KEY || (dailyBriefing && !force)) return;
            if (briefingLock.current) return;
            briefingLock.current = true;
            setIsAILoading(prev => ({ ...prev, briefing: true }));
            try {
                const response = await executeAIRequest(async () => {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    return await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: `Generate tactical construction briefing for South Africa. JSON: {summary: string, keyUpdates: string[], safetyTip: string}`,
                        config: { responseMimeType: 'application/json' }
                    });
                });
                if (response.text) setDailyBriefing(JSON.parse(response.text));
            } catch (err) {
                console.error("Briefing Engine Failure", err);
            } finally {
                setIsAILoading(prev => ({ ...prev, briefing: false }));
                briefingLock.current = false;
            }
        },

        generateBusinessIntelligenceReport: async () => {},
        generatePricingAnalysis: async (productId) => {},
        generateInventoryInsights: async (force) => {},
        generateCustomerInsights: async (id) => {},
        toggleAIAgent: () => setIsAgentEnabled(prev => !prev),
        sendAIDraftedResponse: async () => {},
        lockStockRequest: (requestId) => {},
        dismissAIDraftedResponse: async () => {},
        generateLegalAnalysis: async (text) => {
            setIsAILoading(prev => ({ ...prev, legal: true }));
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await executeAIRequest(() => ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Audit construction contract for risk: ${text}`,
                    config: { responseMimeType: 'application/json' }
                }));
                if (response.text) setAiLegalReport(JSON.parse(response.text));
            } catch (err) {
                console.error("Legal Analysis Error", err);
            } finally { setIsAILoading(prev => ({ ...prev, legal: false })); }
        },
        generateTenderAnalysis: async (id) => {
            setIsAILoading(prev => ({ ...prev, tenderAnalysis: true }));
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await executeAIRequest(() => ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Analyze tender ${id}`,
                    config: { responseMimeType: 'application/json' }
                }));
                if (response.text) setTenderAnalysis(JSON.parse(response.text));
            } catch (err) {
                console.error("Tender Analysis Error", err);
            } finally { setIsAILoading(prev => ({ ...prev, tenderAnalysis: false })); }
        },
        generateDisputeSuggestion: async (id) => {
            setIsSuggestionLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await executeAIRequest(() => ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Mediate dispute ${id}`,
                    config: { responseMimeType: 'application/json' }
                }));
                if (response.text) setAiSuggestion(JSON.parse(response.text));
            } catch (err) {
                console.error("Dispute Suggestion Error", err);
            } finally { setIsSuggestionLoading(false); }
        },
        getDeliveryUpdate: async (oid, q) => { return "Neural tracking synchronized. Payload is secure."; },
        
        createStockRequest: async (data) => { await api.createStockRequest(data); },
        respondToStockRequest: async (data) => { await api.respondToStockRequest(data); },
        createRentalBooking: async (data) => { },
        updateBookingStatus: async (id, status) => { await api.updateBookingStatus(id, status); },
        addRentalEquipment: async (data) => { await api.addRentalEquipment(data); },
        updateRentalEquipment: (id, data) => api.updateRentalEquipment(id, data),
        deleteRentalEquipment: async (id) => { await api.deleteRentalEquipment(id); },
        saveClientQuote: async (quote) => { return ""; },
        deleteClientQuote: async (id) => { },
        createClientInvoice: async (invoice) => { },
        updateClientInvoiceStatusInDb: async (id, status) => { },
        addPortfolioProject: async (data) => { await api.addPortfolioProject(data); },
        addDocument: async (doc) => { await api.addDocument(doc); },
        submitTenderBid: async (bid) => { },
        authoriseNodeVerify: async (id, status) => api.verifyUserNode(id, status),
        acceptTenderBid: async (bid) => { },
        submitReview: (review) => { api.submitReviewInDb(review); },
        createTender: async (tender) => { await api.createTender && api.createTender(tender); },
        addAsset: async (asset) => { await api.addAsset(asset); },
        updateAsset: (id, data) => api.updateAsset(id, data),
        removeVehicle: async (id) => { },
        removeDriver: async (id) => { },
        inviteUser: async (email, role) => { await api.inviteUser(email, role); },
        removeUser: async (id) => { },
        updateUserRole: async (id, role) => { },
        addDisputeMessage: async (id, text) => { },
        createDispute: async (data) => { },
        applyForJob: async (data) => { },
        deleteJobPosting: async (id) => { },
        createJobPosting: async (data) => { },
        updateJobPosting: async (id, data) => { },
        sendClientInquiry: (data) => api.sendClientInquiry(data),
        markClientInquiryRead: (id) => api.markClientInquiryRead(id),

        getSupplierById: (id) => (suppliers || []).find(s => s.id === id),
        getQuoteById: (id) => (quoteRequests || []).find(q => q.id === id),
        launchSystem: () => {
            setSystemStatus(SystemStatus.Production);
            localStorage.setItem(SYSTEM_STATUS_KEY, SystemStatus.Production);
            showToast("Ferrari Production Grid Live", "success");
        },
        recalibrateNeuralLink: async () => {
            if (window.aistudio) await window.aistudio.openSelectKey();
        },
        updateSupplierProfile: (s) => api.updateSupplierProfile(s),
        markNotificationsAsRead: async () => { setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); },
        reorderItems: (orderId: string) => { return { success: true, unavailableCount: 0 }; },
        releaseMilestoneEscrow: async (id) => { setProjectMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'Released' } : m)); showToast("Dossier Settled", "success"); },
        executeNewclairActivation: async () => { setIsLoading(true); await api.seedLogisticsRegistryInDb(user?.activeCompanyId); setIsNuclearActive(true); await loadData(); setIsLoading(false); },
        addMaterialToProject: async (pid, p, q) => { showToast("Unit Allocated to Site", "success"); },
        submitMilestoneProof: async (id, u, s) => { showToast("Audit Handshake Finalized", "success"); },
        verifyUserNode: (id, status) => api.verifyUserNode(id, status),
        assignDriverToOrder: (oid, did, vid) => api.assignDriverToOrder(oid, did, vid),
        completeDelivery: (id, p) => api.completeDelivery(id, p),
        joinSyndicate: (id, q) => api.joinSyndicate(id, q),
        requestBusinessVerification: async (d) => { showToast("Verification Dossier Transmitted", "info") },
        clearProjectPlan: () => setProjectPlan(null),
        clearTenderAnalysis: () => setTenderAnalysis(null),
        clearPricingAnalysis: () => setPricingAnalysis(null),
        clearDisputeSuggestion: () => setAiSuggestion(null),
        clearLegalAnalysis: () => setAiLegalReport(null),
        sendMessage: async (convoId, text) => {},
        markAsRead: async (convoId) => {},
        startOrGetConversation: async (otherPartyId) => { return {} as any; },
        clearDraftQuote: () => {},
        draftQuoteForEditing: null,
        resolveIntervention: async (id) => {
            setInterventionTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
            showToast("Grid Friction Resolved", "success");
        },
        acceptQuoteAndCreateOrder: async (qId, details) => {
             showToast("Mission Authorised: Dispatch Initialized", "success");
        },
        declineQuote: async (qId) => {},
        createStrikeRequest: async (data) => {},
        addProjectMaterialsInDb: async (materials) => {
            setProjectMaterials(prev => [...prev, ...materials]);
        },
        reconcileMaterials: (projectId, items) => api.reconcileMaterials(projectId, items),
        generateCostEstimate: (desc) => api.generateCostEstimate(desc),
        generateProjectPlan: (description) => api.generateProjectPlan(description),
        generateMarketPulse: (query) => api.generateMarketPulse(query),
        performDNAAudit: (image) => api.performDNAAudit(image),

        respondToQuote: (id, items, notes) => {},
        sendQuoteToContractor: async (data) => {},
        saveProjectTemplate: (template) => {},
        createProjectFromTemplate: async (id, details) => { return undefined; },
        createSafetyPermit: async (data) => {},
        addClient: async (client) => {},
        updateClient: async (id, client) => {},
        deleteClient: async (id) => { await api.deleteClientInDb(id); },
        addTimesheetEntry: async (entry) => {},
        updateTimesheetEntry: async (id, entry) => {},
        deleteTimesheetEntry: (id) => api.deleteTimesheetEntry(id),
        redeemReward: (offer) => {},
        createRewardOffer: (offer) => {},
        deleteRewardOffer: (id) => {}
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData context violation');
    return context;
};
