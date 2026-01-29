
export enum UserRole {
  Contractor = 'contractor',
  Supplier = 'supplier',
  Admin = 'admin',
  Driver = 'driver',
  Logistics = 'logistics',
  Marketer = 'marketer'
}

export enum CompanyUserRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
  Sales = 'sales',
  Warehouse = 'warehouse',
  Driver = 'driver'
}

export enum SystemStatus {
  Staging = 'Staging',
  Production = 'Production'
}

export type ContractorTab = 'dashboard' | 'command-bridge' | 'grid-strategy' | 'strike-mode' | 'home' | 'ai-sourcing' | 'projects' | 'project-details' | 'orders' | 'quotes' | 'messages' | 'site_reporter' | 'safety-ai' | 'regulatory-pulse' | 'profile' | 'billing' | 'vault' | 'referrals' | 'ledger' | 'comms-terminal' | 'client-inbox' | 'variations' | 'on-site' | 'structural-dna' | 'team-health' | 'labor-matrix' | 'bom-analyzer' | 'price-watch' | 'design-studio' | 'drone-scout' | 'subscription' | 'site-diary' | 'builders-hub' | 'bom-intercept' | 'capital-velocity' | 'authority-gateway';

export type SupplierTab = 'home' | 'mission-control' | 'demand-matrix' | 'dashboard' | 'intelligence' | 'market-pulse' | 'price-watch' | 'ai-assistant' | 'bom-assistant' | 'leads' | 'products' | 'manage-rentals' | 'profile' | 'orders' | 'promotions' | 'logistics' | 'fleet-hub' | 'stock-requests' | 'quotes' | 'tenders' | 'reviews' | 'customers' | 'rewards' | 'marketing-ai' | 'disputes' | 'vault' | 'messages' | 'billing' | 'team' | 'referrals' | 'help' | 'settings';

export type AdminTab = 'dashboard' | 'registry' | 'disputes' | 'settings';

export type LogisticsTab = 'dashboard' | 'load-board' | 'fleet' | 'workshop' | 'profile' | 'fleet-hub' | 'referrals' | 'messages' | 'billing' | 'settings';

export enum Jurisdiction {
  SouthAfrica = 'ZA',
  EuropeanUnion = 'EU',
  UnitedStates = 'US',
  UnitedKingdom = 'UK',
  Australia = 'AU',
  UAE = 'AE',
  China = 'CN'
}

export enum BuildingStandard {
  SANS10400 = 'SANS 10400',
  Eurocode = 'Eurocode',
  ASTM = 'ASTM',
  BuildingRegsUK = 'UK Building Regs',
  BCA_Australia = 'BCA Australia',
  GB_Standard = 'GB Standard (CN)'
}

export enum CarbonGrade {
  A = 'A - Net Zero Prime',
  B = 'B - High Efficiency',
  C = 'C - Standard Grid',
  D = 'D - High Carbon',
  F = 'F - Critical Friction'
}

export enum Currency {
  ZAR = 'ZAR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CNY = 'CNY',
  AED = 'AED'
}

export enum OrderStatus {
  New = 'New',
  Processing = 'Processing',
  ReadyForPickup = 'Ready for Pickup',
  OutForDelivery = 'Out for Delivery',
  InTransit_International = 'Trans-Oceanic Transit',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Disputed = 'Disputed'
}

export enum ProjectStatus {
  Planning = 'Planning',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold'
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed'
}

export enum QuoteStatus {
  Pending = 'Pending',
  Responded = 'Responded',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Expired = 'Expired'
}

export enum RequestStatus {
  Open = 'Open',
  Responded = 'Responded',
  Closed = 'Closed'
}

export enum PostType {
  Question = 'Question',
  Showcase = 'Showcase',
  Marketplace = 'Marketplace'
}

export enum NotificationType {
  NewOrder = 'NewOrder',
  OrderStatusUpdate = 'OrderStatusUpdate',
  NewMessage = 'NewMessage',
  ItemOnSale = 'ItemOnSale',
  LowStock = 'LowStock',
  NewStockRequestResponse = 'NewStockRequestResponse',
  NewPublicStockRequest = 'NewPublicStockRequest'
}

export enum ExpenseCategory {
  Materials = 'Materials',
  Labor = 'Labor',
  EquipmentRental = 'Equipment Rental',
  Permits = 'Permits',
  Other = 'Other'
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

export enum ClientQuoteStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Accepted = 'Accepted',
  Declined = 'Declined'
}

export enum JobStatus {
  Open = 'Open',
  Closed = 'Closed'
}

export enum ProjectMaterialStatus {
  ToOrder = 'To Order',
  PendingQuote = 'Pending Quote',
  Ordered = 'Ordered',
  Delivered = 'Delivered'
}

export enum DisputeStatus {
  New = 'New',
  SupplierResponded = 'Supplier Responded',
  ContractorResponded = 'Contractor Responded',
  UnderAdminReview = 'Under Admin Review',
  Resolved = 'Resolved'
}

export enum TenderStatus {
  Open = 'Open',
  Closed = 'Closed',
  Awarded = 'Awarded'
}

export enum DeliveryOption {
  Pickup = 'Pickup',
  Delivery = 'Delivery'
}

export enum ContractorLeadType {
  PublicTender = 'PublicTender',
  MunicipalPlanning = 'MunicipalPlanning',
  PrivateDevelopment = 'PrivateDevelopment',
  Recommendation = 'Recommendation'
}

export enum CustomerSegment {
  HighValue = 'High Value',
  New = 'New',
  AtRisk = 'At Risk',
  Occasional = 'Occasional'
}

export enum LeadType {
  TrendingProduct = 'TrendingProduct',
  NewProject = 'NewProject',
  DirectOpportunity = 'DirectOpportunity'
}

export enum PowerIntensity {
  High = 'High - Grid Critical',
  Medium = 'Medium - Hybrid Support',
  Low = 'Low - Off-Grid Capable'
}

export interface BusinessDetails {
  registrationNumber: string;
  vatNumber?: string;
}

export interface PayoutDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  activeCompanyId: string;
  companyLogoUrl?: string;
  company?: string;
  bio?: string;
  address?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  specialties?: string[];
  serviceAreas?: {
    country: string;
    stateOrProvince: string;
    cities: string[];
  }[];
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  subscriptionStatus?: 'trial' | 'active' | 'expired' | 'none';
  walletBalance?: number;
  currencyPreference?: Currency;
  created_at?: Date;
  createdAt?: Date;
  referralCode?: string;
  businessDetails?: BusinessDetails;
  loyaltyPoints?: number;
  loyaltyTier?: string;
}

// Fixed: Added missing Company interface
export interface Company {
  id: string;
  name: string;
  type: 'contractor' | 'supplier' | 'admin' | 'logistics';
  ownerId: string;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'none';
  verificationStatus: 'unverified' | 'pending' | 'verified';
  location: string;
  coordinates: { lat: number; lon: number };
  contact: { phone: string; email: string; website?: string; whatsapp?: string };
  businessHours: { weekdays: string; saturday: string; sunday: string };
  logoUrl?: string;
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  deliveryZones?: string[];
  loyaltyPoints?: number;
  loyaltyTier?: string;
  payoutDetails?: PayoutDetails;
  compliance?: any;
  trialEndDate?: string;
}

// Fixed: Added missing Supplier type alias
export type Supplier = Company;

export interface Project {
  id: string;
  contractorId: string;
  projectName: string;
  clientName: string;
  address: string;
  jurisdiction: Jurisdiction;
  standard: BuildingStandard;
  status: ProjectStatus;
  createdAt: Date;
  carbonAudit?: {
    totalKg: number;
    grade: CarbonGrade;
    lastAuditDate: Date;
  };
}

// Fixed: Added missing Product interface
export interface Product {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  currency?: Currency;
  carbonFootprintKg?: number;
  stock: number;
  description: string;
  imageUrl: string;
  isInternational?: boolean;
  originCountry?: string;
  deliveryOptions: DeliveryOption[];
  discountPrice?: number;
  isContractorListing?: boolean;
  sellerName?: string;
  sellerCompanyId?: string;
  weightKg?: number;
}

// Fixed: Added missing CartItem interface
export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  contractorId: string;
  contractorName: string;
  supplierId: string;
  companyId: string;
  items: any[];
  total: number;
  currency: Currency;
  status: OrderStatus;
  isInternational: boolean;
  originCountry?: string;
  createdAt: Date;
  updatedAt?: Date;
  projectId?: string;
  deliveryAddress?: string;
  deliveryDetails?: {
    driverId?: string;
    driverName?: string;
    vehicleId?: string;
    vehicleReg?: string;
    eta: string;
    startLocation: { lat: number; lon: number };
    destinationLocation: { lat: number; lon: number };
  };
  proofOfDelivery?: {
    imageUrl: string;
    signatureUrl: string;
    timestamp: Date;
  };
}

export interface ProjectMaterial {
  id: string;
  projectId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  currency: Currency;
  status: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: Date;
  startDate?: Date;
  createdAt?: Date;
  powerIntensity?: PowerIntensity;
  powerIntensive?: boolean;
  assignee?: string;
}

export interface ProjectLog {
  id: string;
  projectId: string;
  type: string;
  content: string;
  date: Date;
  images?: string[];
}

export interface ProjectBudget {
  projectId: string;
  totalBudget: number;
  currency: Currency;
}

export interface ContractorAsset {
  id: string;
  contractorId: string;
  name: string;
  category: string;
  status: string;
  locationName: string;
  imageUrl?: string;
  description: string;
  locationType: 'Yard' | 'Project';
  locationId: string;
}

export interface ContractorStock {
  id: string;
  contractorId: string;
  itemName: string;
  quantity: number;
  unit: string;
  locationName: string;
}

export interface SyndicateOpportunity {
  id: string;
  productName: string;
  region: string;
  targetQuantity: number;
  currentQuantity: number;
  basePrice: number;
  discountPrice: number;
  currency: Currency;
  expiryDate: Date;
  status: 'Open' | 'Locked' | 'Completed';
}

export interface VaultTransaction {
  id: string;
  type: string;
  amount: number;
  currency: Currency;
  status: string;
  reference: string;
  date: Date;
}

export interface InterventionTicket {
  id: string;
  projectId: string;
  type: string;
  severity: string;
  title: string;
  insight: string;
  actionLabel: string;
  draftContent?: string;
  status: 'Pending' | 'Resolved' | 'Ignored';
}

export interface RegulatoryAlert {
  id: string;
  source: string;
  title: string;
  summary: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  date: Date;
}

export interface MetroPerformance {
  city: string;
  avgApprovalDays: number;
  trend: 'Improving' | 'Stagnant' | 'Degrading';
}

export interface SystemHealth {
  aiCore: 'Stable' | 'High Load' | 'Degraded';
  latency: number;
  dbStatus: string;
}

export interface GridWindow {
  id: string;
  stage: number;
  startTime: Date;
  endTime: Date;
  status: string;
  impactLevel: string;
}

export interface EmergencyStockRequest {
  id: string;
  productName: string;
  quantity: number;
  deadlineMins: number;
  location: { lat: number; lon: number };
  status: string;
}

export interface SupplyHeatPoint {
  lat: number;
  lon: number;
  intensity: number;
  label: string;
  type: 'Demand' | 'Supply';
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  currency: Currency;
  status: 'Locked' | 'Awaiting Proof' | 'In Verification' | 'Released';
  description: string;
  verificationType: 'Photo' | 'Manual';
}

export interface VariationOrder {
  id: string;
  projectId: string;
  number: string;
  title: string;
  description: string;
  justification: string;
  costImpact: number;
  timeImpactDays: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
  createdAt: Date;
}

export interface RewardOffer {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  description: string;
  pointsRequired: number;
}

export interface ContractorLead {
  id: string;
  type: ContractorLeadType;
  title: string;
  location: string;
  estimatedValue?: number;
  summary: string;
  source: string;
  createdAt: Date;
  action: { label: string; target: any };
}

export interface Tender {
  id: string;
  tenderNumber: string;
  contractorId: string;
  projectId: string;
  projectName: string;
  materials: { materialId: string; productName: string; quantity: number }[];
  deadline: Date;
  status: TenderStatus;
  createdAt: Date;
  bidsCount: number;
}

export interface TenderBid {
  id: string;
  tenderId: string;
  supplierId: string;
  supplierName: string;
  items: TenderBidItem[];
  totalBidAmount: number;
  notes: string;
  createdAt: Date;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorLogo?: string;
  content: string;
  type: PostType;
  tags: string[];
  imageUrl?: string;
  timestamp: Date;
  likes: number;
  comments: any[];
}

export interface Client {
  id: string;
  contractorId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  notes?: string;
  tags?: string[];
}

export interface PortfolioProject {
  id: string;
  contractorId: string;
  title: string;
  description: string;
  imageUrls: string[];
  completionDate: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  url: string;
  fileType: 'image' | 'text' | 'pdf';
  uploadedAt: Date;
  textContent?: string;
  base64Data?: string;
}

export interface ProjectPlan {
  phases: any[];
  safetyChecklist: string[];
  disclaimer: string;
}

export interface AITenderAnalysisReport {
  summary: string;
  bestPricePerItem: any[];
  bestCaseTotal: number;
  recommendation: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  status: string;
  email: string;
  type: 'Internal' | 'External';
}

export interface TimesheetEntry {
  id: string;
  contractorId: string;
  workerName: string;
  date: Date;
  hours: number;
  description: string;
  projectId?: string;
  projectName?: string;
  hourlyRate?: number;
  status: 'Pending' | 'Approved' | 'Paid';
}

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  contractorId: string;
  supplierId: string;
  reason: string;
  status: DisputeStatus;
  createdAt: Date;
  messages: any[];
  participantIds: string[];
}

export interface Vehicle {
  id: string;
  supplierId: string;
  makeModel: string;
  registration: string;
  status: 'Available' | 'On Delivery' | 'Maintenance' | 'In Use';
}

export interface Driver {
  id: string;
  supplierId: string;
  name: string;
  contactNumber: string;
}

export interface SubContractor {
  id: string;
  name: string;
  trade: string;
  skills: string[];
  location: string;
  hourlyRate: number;
  rating: number;
  verified: boolean;
}

export interface RentalEquipment {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  specifications: Record<string, string>;
  rates: {
    perDay: number;
    perWeek: number;
    perMonth: number;
  };
  location: string;
}

export interface RentalBooking {
  id: string;
  equipmentId: string;
  ownerId: string;
  renterId: string;
  renterName: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  bookingStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface CustomerInsight {
  customerId: string;
  segment: CustomerSegment;
  suggestion: string;
  action: { type: 'draft_message' | 'draft_quote' | 'create_reward'; label: string };
}

export interface RestockSuggestion {
  productName: string;
  currentStock: number;
  reason: string;
}

export interface TrendingSuggestion {
  productName: string;
  reason: string;
}

export interface PricingSuggestion {
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
}

// Fixed: Added missing StockRequest interface
export interface StockRequest {
  id: string;
  contractorId: string;
  contractorName: string;
  itemName: string;
  description: string;
  category: string;
  quantity: number;
  requiredBy: Date;
  location: string;
  status: RequestStatus;
  createdAt: Date;
  responses: number;
}

// Fixed: Added missing StockRequestResponse interface
export interface StockRequestResponse {
  id: string;
  requestId: string;
  supplierId: string;
  supplierName: string;
  pricePerUnit: number;
  leadTime: string;
  message: string;
  createdAt: Date;
}

export interface AIDraftedResponse {
  draftId: string;
  stockRequest: StockRequest;
  pricePerUnit: number;
  leadTime: string;
  message: string;
}

export interface AIMediationSuggestion {
  summary: string;
  suggestion: string;
}

export interface AILegalReport {
  summary: string;
  risks: { risk: string; recommendation: string }[];
  suggestions: string[];
  disclaimer: string;
}

export interface SafetyPermit {
  id: string;
  projectId: string;
  type: 'Hot Work' | 'Height' | 'Confined Space' | 'Electrical';
  description: string;
  validFrom: Date;
  validTo: Date;
  checklist: { item: string; checked: boolean }[];
  authorizedBy: string;
  status: 'Active' | 'Expired';
}

export interface AuthorityMilestone {
  id: string;
  title: string;
  authorityName: string;
  status: 'Not Started' | 'In Progress' | 'Awaiting Decision' | 'Approved' | 'Blocked';
  estimatedLeadDays: number;
  submittedAt?: Date;
  requiredDocuments?: string[];
}

export interface ProjectTemplate {
  id: string;
  contractorId: string;
  name: string;
  description: string;
  materials: { itemName: string; quantity: number }[];
}

export interface JobPosting {
  id: string;
  contractorId: string;
  contractorName: string;
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
  startDate: Date;
  duration: string;
  payRate: string;
  status: JobStatus;
  createdAt: Date;
}

export interface ClientQuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  isStockLinkItem: boolean;
  costPrice?: number;
  stockLinkProductId?: string;
}

export interface ClientQuote {
  id: string;
  quoteNumber: string;
  contractorId: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: ClientQuoteItem[];
  vatRate: number;
  total: number;
  status: ClientQuoteStatus;
  createdAt: Date;
  expiresAt?: Date;
  notes?: string;
}

// Fixed: Added missing ProjectExpense interface
export interface ProjectExpense {
  id: string;
  projectId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  date: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  contractorId: string;
  clientName: string;
  clientEmail?: string;
  items: ClientQuoteItem[];
  subtotal: number;
  vatRate: number;
  total: number;
  status: InvoiceStatus;
  createdAt: Date;
  dueDate: Date;
  fromQuoteId?: string;
  notes?: string;
}

export interface CompanyMember {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: CompanyUserRole;
  status: 'Active' | 'Invited' | 'Inactive';
}

export interface SafetyAuditIssue {
  hazard: string;
  severity: 'Low' | 'Medium' | 'High';
  recommendation: string;
  coordinates?: { x: number; y: number };
}

export type SafetyAuditReport = SafetyAuditIssue[];

export interface SnagItem {
  issue: string;
  recommendation: string;
  coordinates?: { x: number; y: number };
}

export type SnagListReport = SnagItem[];

export interface BusinessNameSuggestion {
  name: string;
  tagline: string;
}

// Fixed: Added missing Referral interface
export interface Referral {
    id: string;
    referrerId: string;
    refereeName: string;
    refereeEmail: string;
    status: 'Invited' | 'Signed Up' | 'Subscribed';
    invitedAt: Date;
    commission?: number;
}

export interface Lead {
  id: string;
  type: LeadType;
  title: string;
  summary: string;
  action: { label: string; target: any };
}

export interface ComplianceReport {
  summary: string;
  issues: { issue: string; recommendation: string }[];
  references: string[];
  disclaimer: string;
}

// Fixed: Added missing QuoteItem interface
export interface QuoteItem {
  product: Product;
  quantity: number;
  originalPrice: number;
  quotedPrice?: number;
}

// Fixed: Added missing QuoteRequest interface
export interface QuoteRequest {
  id: string;
  quoteNumber: string;
  contractorId: string;
  contractorName: string;
  supplierId: string;
  items: QuoteItem[];
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
  total: number;
  quotedTotal?: number;
  supplierNotes?: string;
  participantIds: string[];
  projectId?: string;
  initiatedBy: UserRole;
  notes?: string;
}

export interface TenderBidItem {
  materialId: string;
  pricePerUnit?: number;
  productId?: string;
}

export interface LogisticsLoad {
  id: string;
  orderNumber: string;
  supplierName: string;
  payout: number;
  pickupLocation: string;
  dropoffLocation: string;
  requiredVehicleType: string;
  status: 'Available' | 'Assigned' | 'In Transit' | 'Completed';
}

export interface CommissionRecord {
  id: string;
  nodeName: string;
  nodeType: 'contractor' | 'supplier';
  status: 'Pending' | 'Settled' | 'Delinquent';
  amount: number;
  residual: number;
  timestamp: Date;
}

export interface ClientMessage {
  id: string;
  contractorId: string;
  clientName: string;
  clientEmail: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface SafetyBriefing {
  topic: string;
  risks: string[];
  procedures: string[];
  closingStatement: string;
}

// Fixed: Added missing Message interface
export interface Message {
  id: string;
  senderId: string;
  text: string;
  translatedText?: string;
  originalLanguage?: string;
  timestamp: Date;
}

// Fixed: Added missing Conversation interface
export interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    contractorId: string;
    supplierId: string;
    contractorName: string;
    supplierName: string;
    contractorImage?: string;
    supplierImage?: string;
  };
  messages: Message[];
  lastMessage: Message | null;
  unreadBy: string | null;
}

// Fixed: Added missing Review interface
export interface Review {
  id: string;
  orderId: string;
  contractorId: string;
  contractorName: string;
  supplierId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Fixed: Added missing Notification interface
export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// Fixed: Added missing GridConflict interface
export interface GridConflict {
  taskId: string;
  type: 'Power' | 'Weather' | 'Resource';
  severity: 'Critical' | 'Warning';
  reason: string;
}
