import { 
    UserRole, OrderStatus, ProjectStatus, QuoteStatus, RequestStatus, 
    DeliveryOption, PostType, DisputeStatus, TenderStatus, InvoiceStatus,
    Supplier, LogisticsLoad
} from '../types';

class EventEmitter {
  private events: { [key: string]: Function[] } = {};
  on(event: string, listener: Function) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    this.events[event].filter(l => l !== listener);
  }
  emit(event: string, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => {
        try { listener(data); } catch(e) {}
    });
  }
}

export const emitter = new EventEmitter();

export const mockData: any = {
    users: [
        { id: 'user-master-777', name: 'Fleet Commander', email: 'elite@stocklink.io', role: UserRole.Contractor, activeCompanyId: 'comp-777-ferrari', subscriptionStatus: 'active', walletBalance: 142500, verificationStatus: 'verified' }
    ],
    companies: [
        { id: 'comp-777-ferrari', name: 'Ferrari Redline Construction', type: 'contractor', ownerId: 'user-master-777', subscriptionStatus: 'active', verificationStatus: 'verified', location: 'Sandton, GP' },
        { id: 'supplier-1', name: 'BuildIt Pro', type: 'supplier', ownerId: 'user-supplier-1', subscriptionStatus: 'active', verificationStatus: 'verified', location: 'Sandton, GP', logoUrl: 'https://ui-avatars.com/api/?name=BuildIt+Pro', rating: 4.8, reviews_count: 120, deliveryZones: ['Sandton', 'Midrand'], businessHours: { weekdays: '08:00 - 17:00' } },
        { id: 'logistics-node-1', name: 'G7 Logistics Node', type: 'logistics', ownerId: 'user-logistics-1', subscriptionStatus: 'active', verificationStatus: 'verified', location: 'Germiston, GP' }
    ],
    products: [
        { id: 'p1', supplierId: 'supplier-1', name: 'Cement 50kg 42.5N', category: 'Building Materials', brand: 'PPC', price: 95, stock: 500, description: 'Structural grade cement.', imageUrl: 'https://picsum.photos/seed/cement/400/300', deliveryOptions: [DeliveryOption.Delivery] }
    ],
    projects: [
        { id: 'proj-1', contractorId: 'comp-777-ferrari', projectName: 'Site Sector Alpha', clientName: 'High-Netwood Assets', address: '42 Redline Drive, Sandton', status: ProjectStatus.InProgress, createdAt: new Date() }
    ],
    projectBudgets: [{ projectId: 'proj-1', totalBudget: 2450000 }],
    projectExpenses: [],
    projectLogs: [{ id: 'l1', projectId: 'proj-1', type: 'System', content: 'Grid uplink established. Structural phase initialized.', date: new Date() }],
    projectTasks: [
        { id: 't1', projectId: 'proj-1', description: 'Foundation Pour (Grid Dependent)', status: 'In Progress', priority: 'High', dueDate: new Date(), powerIntensive: true }
    ],
    projectMilestones: [
        { id: 'm1', projectId: 'proj-1', title: 'Ground Floor Slab', amount: 450000, status: 'Awaiting Proof', description: 'Complete floor slab pour verified via neural vision.', verificationType: 'Photo' }
    ],
    vaultTransactions: [
        { id: 'tx1', type: 'Escrow', amount: 450000, status: 'Pending', reference: 'ALPH-PHASE-1', date: new Date() }
    ],
    interventionTickets: [
        { id: 'it1', projectId: 'proj-1', type: 'Power', severity: 'High', title: 'Grid Outage Forecast', insight: 'Stage 4 lockout detected. Neural core recommends rescheduling pour.', actionLabel: 'Authorize Shift', status: 'Pending', draftContent: 'Move task to 04:00 AM window.' }
    ],
    gridWindows: [
        { id: 'g1', stage: 4, status: 'Upcoming', startTime: new Date(Date.now() + 3600000), endTime: new Date(Date.now() + 10800000), impactLevel: 'High' }
    ],
    supplyHeatmap: [
        { lat: -26.1, lon: 28.0, intensity: 0.9, label: 'Sandton Demand Peak', type: 'Demand' }
    ],
    metroPerformance: [
        { city: 'Cape Town', avgApprovalDays: 14, trend: 'Improving', currentBacklog: 124 },
        { city: 'Johannesburg', avgApprovalDays: 22, trend: 'Stagnant', currentBacklog: 842 }
    ],
    syndicates: [
        { id: 'syn-1', productName: 'PPC Cement 50kg', category: 'Building Materials', region: 'Gauteng Central', targetQuantity: 1000, currentQuantity: 450, basePrice: 115, discountPrice: 88, expiryDate: new Date(Date.now() + 86400000 * 5), status: 'Open', participants: [] }
    ],
    systemHealth: { aiCore: 'Stable', latency: 22, dbStatus: 'Connected', regionalNodes: 14, activeUsers: 2420 },
    orders: [],
    quoteRequests: [],
    suppliers: [],
    projectMaterials: [],
    contractorAssets: [],
    contractorStock: [],
    notifications: [],
    logisticsLoads: [] as LogisticsLoad[],
    vehicles: [],
    drivers: [],
    dispatches: [],
    tenders: [],
    tenderBids: [],
    communityPosts: [
        { id: 'post-1', authorId: 'user-master-777', authorName: 'Fleet Commander', content: 'Grid performance optimization successful. Launching Redline v80.5.', type: PostType.Showcase, tags: ['System', 'Ferrari'], timestamp: new Date(), likes: 42, comments: [] }
    ],
    contractorLeads: [],
    clientQuotes: [],
    clientInvoices: [],
    subContractors: [
        { id: 'sub-1', name: 'Sipho Tilers', trade: 'Finishes', skills: ['Porcelain', 'Mosaic'], location: 'Midrand', hourlyRate: 350, rating: 4.9, verified: true }
    ],
    safetyPermits: [],
    rewardOffers: [],
    emergencyRequests: [],
    variationOrders: [],
    portfolioProjects: [],
    conversations: [],
    reviews: [],
    clients: [],
    projectDocuments: [],
    timesheets: [],
    projectMembers: [],
    disputes: [],
    clientMessages: [],
    stockRequests: [],
    stockRequestResponses: [],
    rentalBookings: [],
    rentalEquipment: []
};

// --- DATA ACCESS PROTOCOLS ---

export const getAllDataForUser = async (user: any) => {
    await new Promise(r => setTimeout(r, 400));
    return { ...mockData };
};

export const createProject = async (p: any) => {
    const newProj = { ...p, id: `p-${Date.now()}`, createdAt: new Date(), status: ProjectStatus.Planning };
    mockData.projects.push(newProj);
    emitter.emit('data-changed');
    return newProj;
};

export const addExpenseInDb = async (e: any) => {
    mockData.projectExpenses.push({ ...e, id: `exp-${Date.now()}` });
    emitter.emit('data-changed');
};

export const createProjectTask = async (t: any) => {
    const newTask = { ...t, id: `t-${Date.now()}` };
    mockData.projectTasks.push(newTask);
    emitter.emit('data-changed');
    return newTask;
};

export const updateProjectTask = async (id: string, data: any) => {
    const idx = mockData.projectTasks.findIndex((t:any) => t.id === id);
    if(idx !== -1) mockData.projectTasks[idx] = { ...mockData.projectTasks[idx], ...data };
    emitter.emit('data-changed');
};

export const createProjectLog = async (log: any) => {
    mockData.projectLogs.unshift({ ...log, id: `log-${Date.now()}`, date: new Date() });
    emitter.emit('data-changed');
};

export const submitReviewInDb = (review: any) => {
    mockData.reviews.push({ ...review, id: `rev-${Date.now()}`, createdAt: new Date() });
    emitter.emit('data-changed');
};

export const updateSupplierProfile = async (s: any) => {
    const idx = mockData.companies.findIndex((c:any) => c.id === s.id);
    if(idx !== -1) mockData.companies[idx] = s;
    emitter.emit('data-changed');
};

export const seedLogisticsRegistryInDb = async (cid: string) => {
    mockData.vehicles.push({ id: 'v1', supplierId: cid, makeModel: 'Toyota Hilux 2.4 GD-6', registration: 'SL-777-GP', status: 'Available' });
    mockData.drivers.push({ id: 'd1', supplierId: cid, name: 'Sipho Ndlovu', contactNumber: '072 000 0000' });
    emitter.emit('data-changed');
};

export const addClientInDb = async (c: any) => {
    mockData.clients.push({ ...c, id: `cl-${Date.now()}`, createdAt: new Date() });
    emitter.emit('data-changed');
};

export const updateClientInDb = async (id: string, c: any) => {
    const idx = mockData.clients.findIndex((cl:any) => cl.id === id);
    if(idx !== -1) mockData.clients[idx] = { ...mockData.clients[idx], ...c };
    emitter.emit('data-changed');
};

export const deleteClientInDb = async (id: string) => {
    mockData.clients = mockData.clients.filter((cl:any) => cl.id !== id);
    emitter.emit('data-changed');
};

export const addPortfolioProject = async (p: any) => {
    mockData.portfolioProjects.push({ ...p, id: `pp-${Date.now()}` });
    emitter.emit('data-changed');
};

export const addDocument = async (d: any) => {
    mockData.projectDocuments.push({ ...d, id: `doc-${Date.now()}`, uploadedAt: new Date() });
    emitter.emit('data-changed');
};

export const addVariationOrderInDb = async (v: any) => {
    mockData.variationOrders.push({ ...v, id: `vo-${Date.now()}`, createdAt: new Date() });
    emitter.emit('data-changed');
};

export const addTimesheetEntry = async (e: any) => {
    mockData.timesheets.push({ ...e, id: `ts-${Date.now()}` });
    emitter.emit('data-changed');
};

export const deleteTimesheetEntry = async (id: string) => {
    mockData.timesheets = mockData.timesheets.filter((t:any) => t.id !== id);
    emitter.emit('data-changed');
};

export const joinSyndicate = async (sid: string, qty: number) => {
    const s = mockData.syndicates.find((x:any) => x.id === sid);
    if (s) s.currentQuantity += qty;
    emitter.emit('data-changed');
};

export const getUserProfile = async (id: string) => {
    await new Promise(r => setTimeout(r, 200));
    return mockData.users.find((u: any) => u.id === id) || null;
};

export const getPortfolioForUser = async (id: string) => {
    await new Promise(r => setTimeout(r, 200));
    return mockData.portfolioProjects.filter((p: any) => p.contractorId === id);
};

export const createCommunityPostInDb = async (post: any) => {
    const newPost = { ...post, id: `post-${Date.now()}`, timestamp: new Date(), likes: 0, comments: [] };
    mockData.communityPosts.unshift(newPost);
    emitter.emit('data-changed');
    return newPost;
};

export const likePostInDb = async (id: string) => {
    const post = mockData.communityPosts.find((p: any) => p.id === id);
    if (post) post.likes += 1;
    emitter.emit('data-changed');
};

export const addCommentToPostInDb = async (postId: string, comment: any) => {
    const post = mockData.communityPosts.find((p: any) => p.id === postId);
    if (post) {
        const newComment = { ...comment, id: `c-${Date.now()}`, timestamp: new Date() };
        post.comments.push(newComment);
        emitter.emit('data-changed');
    }
};

export const verifyUserNode = async (id: string, status: string) => {
    const u = mockData.users.find((x:any) => x.id === id);
    if (u) u.verificationStatus = status;
    emitter.emit('data-changed');
};

export const getCompanies = async () => {
    await new Promise(r => setTimeout(r, 200));
    return mockData.companies;
};

export const getPublicProjectData = async (projectId: string) => {
    await new Promise(r => setTimeout(r, 200));
    const project = mockData.projects.find((p: any) => p.id === projectId);
    if (!project) return null;
    const contractor = mockData.users.find((u: any) => u.id === project.contractorId);
    return {
        project,
        contractor,
        invoices: mockData.clientInvoices.filter((i: any) => i.contractorId === project.contractorId && i.clientName === project.clientName),
        logs: mockData.projectLogs.filter((l: any) => l.projectId === projectId),
        photos: mockData.projectDocuments.filter((d: any) => d.projectId === projectId && d.fileType === 'image').map((d: any) => d.url),
        variations: mockData.variationOrders.filter((v: any) => v.projectId === projectId)
    };
};

export const updateVariationOrderInDb = async (id: string, data: any) => {
    await new Promise(r => setTimeout(r, 200));
    const vo = mockData.variationOrders.find((v: any) => v.id === id);
    if (vo) Object.assign(vo, data);
    emitter.emit('data-changed');
};

export const sendClientInquiry = async (data: any) => {
    mockData.clientMessages.unshift({ ...data, id: `msg-${Date.now()}`, timestamp: new Date(), isRead: false });
    emitter.emit('data-changed');
};

export const markClientInquiryRead = async (id: string) => {
    const msg = mockData.clientMessages.find((m: any) => m.id === id);
    if (msg) msg.isRead = true;
    emitter.emit('data-changed');
};

export const createStockRequest = async (data: any) => {
    mockData.stockRequests.push({ ...data, id: `sr-${Date.now()}`, createdAt: new Date(), status: RequestStatus.Open, responses: 0 });
    emitter.emit('data-changed');
};

export const respondToStockRequest = async (data: any) => {
    mockData.stockRequestResponses.push({ ...data, id: `srr-${Date.now()}`, createdAt: new Date() });
    emitter.emit('data-changed');
};

export const updateBookingStatus = async (id: string, status: string) => {
    const b = mockData.rentalBookings.find((x: any) => x.id === id);
    if (b) b.bookingStatus = status;
    emitter.emit('data-changed');
};

export const addRentalEquipment = async (data: any) => {
    mockData.rentalEquipment.push({ ...data, id: `re-${Date.now()}` });
    emitter.emit('data-changed');
};

export const deleteRentalEquipment = async (id: string) => {
    mockData.rentalEquipment = mockData.rentalEquipment.filter((x: any) => x.id !== id);
    emitter.emit('data-changed');
};

export const submitTenderBid = async (bid: any) => {
    mockData.tenderBids.push({ ...bid, id: `bid-${Date.now()}`, createdAt: new Date() });
    emitter.emit('data-changed');
};

export const inviteUser = async (email: string, role: any) => {
    emitter.emit('data-changed');
};

export const addProduct = async (p: any) => {
    mockData.products.push({ ...p, id: `p-${Date.now()}` });
    emitter.emit('data-changed');
};

export const updateProduct = async (p: any) => {
    const idx = mockData.products.findIndex((x: any) => x.id === p.id);
    if (idx !== -1) mockData.products[idx] = p;
    emitter.emit('data-changed');
};

export const deleteProduct = async (id: string) => {
    mockData.products = mockData.products.filter((x: any) => x.id !== id);
    emitter.emit('data-changed');
};

export const addContractorProduct = async (p: any) => {
    mockData.products.push({ ...p, id: `cp-${Date.now()}`, isContractorListing: true });
    emitter.emit('data-changed');
};

export const updateContractorProduct = async (p: any) => {
    const idx = mockData.products.findIndex((x: any) => x.id === p.id);
    if (idx !== -1) mockData.products[idx] = p;
    emitter.emit('data-changed');
};

export const deleteContractorProduct = async (id: string) => {
    mockData.products = mockData.products.filter((x: any) => x.id !== id);
    emitter.emit('data-changed');
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const o = mockData.orders.find((x: any) => x.id === id);
    if (o) o.status = status;
    emitter.emit('data-changed');
};

export const assignDriverToOrder = async (orderId: string, driverId: string, vehicleId: string) => {
    const o = mockData.orders.find((x: any) => x.id === orderId);
    const d = mockData.drivers.find((x: any) => x.id === driverId);
    const v = mockData.vehicles.find((x: any) => x.id === vehicleId);
    if (o && d && v) {
        o.deliveryDetails = {
            driverId,
            driverName: d.name,
            vehicleId,
            vehicleReg: v.registration,
            eta: '15:00',
            startLocation: { lat: -26.1, lon: 28.0 },
            destinationLocation: { lat: -26.2, lon: 28.1 }
        };
    }
    emitter.emit('data-changed');
};

export const completeDelivery = async (orderId: string, pod: any) => {
    const o = mockData.orders.find((x: any) => x.id === orderId);
    if (o) {
        o.status = OrderStatus.Completed;
        o.proofOfDelivery = pod;
    }
    emitter.emit('data-changed');
};

export const createDisputeInDb = async (data: any) => {
    const newDispute = { ...data, id: `disp-${Date.now()}`, createdAt: new Date(), messages: [], participantIds: [data.contractorId, data.supplierId] };
    mockData.disputes.push(newDispute);
    emitter.emit('data-changed');
    return newDispute;
};

export const addAsset = async (asset: any) => {
    mockData.contractorAssets.push({ ...asset, id: `asset-${Date.now()}` });
    emitter.emit('data-changed');
};

export const updateAsset = async (id: string, data: any) => {
    const idx = mockData.contractorAssets.findIndex((a: any) => a.id === id);
    if (idx !== -1) mockData.contractorAssets[idx] = { ...mockData.contractorAssets[idx], ...data };
    emitter.emit('data-changed');
};