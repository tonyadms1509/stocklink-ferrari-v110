
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
    User, Product, Order, Company, Project, QuoteRequest, 
    OrderStatus, QuoteStatus, ProjectStatus, Jurisdiction, BuildingStandard,
    ExpenseCategory, ProjectMaterialStatus, TaskStatus,
    Conversation, Message, StockRequest, StockRequestResponse,
    Tender, TenderBid, CompanyMember
} from '../types';
import { mockData, getAllDataForUser as getAllDataForUserMock, emitter } from './mockApi';

/**
 * StockLink Ferrari | Real Data Protocol v110.2
 * Resilient Grid Architecture
 */

export { emitter };

const mapProduct = (p: any): Product => ({
    id: p?.id || 'unknown',
    supplierId: p?.supplier_id || '',
    name: p?.name || 'Unknown Product',
    category: p?.category || 'General',
    brand: p?.brand || 'Generic',
    price: Number(p?.price) || 0,
    stock: Number(p?.stock) || 0,
    description: p?.description || '',
    imageUrl: p?.image_url || 'https://picsum.photos/seed/stock/200',
    deliveryOptions: p?.delivery_options || [],
    discountPrice: p?.discount_price ? Number(p?.discount_price) : undefined,
    isContractorListing: p?.is_contractor_listing || false,
    sellerName: p?.seller_name,
    sellerCompanyId: p?.seller_company_id,
    weightKg: p?.weight_kg
});

const mapProject = (p: any): Project => ({
    id: p?.id || 'unknown',
    contractorId: p?.contractor_id || '',
    projectName: p?.project_name || 'Untitled Project',
    clientName: p?.client_name || '',
    address: p?.address || '',
    jurisdiction: (p?.jurisdiction as Jurisdiction) || Jurisdiction.SouthAfrica,
    standard: (p?.standard as BuildingStandard) || BuildingStandard.SANS10400,
    status: (p?.status as ProjectStatus) || ProjectStatus.Planning,
    createdAt: new Date(p?.created_at || Date.now())
});

/**
 * Safe Fetch Wrapper
 * Ensures one missing table doesn't crash the grid.
 */
const safeFetch = async (table: string, query: any = '*') => {
    try {
        const { data, error } = await supabase.from(table).select(query);
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.warn(`Grid Table [${table}] Isolated:`, e);
        return [];
    }
};

export const getAllDataForUser = async (user: User) => {
    if (!isSupabaseConfigured) return await getAllDataForUserMock(user);
    
    try {
        // Parallel Telemetry Pull
        const [
            projectsRaw, productsRaw, orders, quotes, 
            companies, logs, materials, expenses, 
            tasks, milestones, vehicles, drivers, 
            loads, requests, responses, convos, members
        ] = await Promise.all([
            safeFetch('projects'),
            safeFetch('products'),
            safeFetch('orders'),
            safeFetch('quotes'),
            safeFetch('companies'),
            safeFetch('project_logs'),
            safeFetch('project_materials'),
            safeFetch('project_expenses'),
            safeFetch('project_tasks'),
            safeFetch('project_milestones'),
            safeFetch('vehicles'),
            safeFetch('drivers'),
            safeFetch('logistics_loads'),
            safeFetch('stock_requests'),
            safeFetch('stock_request_responses'),
            safeFetch('conversations', '*, messages(*)'),
            safeFetch('company_members')
        ]);

        return {
            ...mockData, 
            projects: projectsRaw.map(mapProject),
            products: productsRaw.map(mapProduct),
            orders: orders || [],
            quoteRequests: quotes || [],
            companies: companies || [],
            suppliers: (companies || []).filter((c: any) => c.type === 'supplier'),
            projectLogs: logs || [],
            projectMaterials: materials || [],
            projectExpenses: expenses || [],
            projectTasks: tasks || [],
            projectMilestones: milestones || [],
            vehicles: vehicles || [],
            drivers: drivers || [],
            logisticsLoads: loads || [],
            stockRequests: requests || [],
            stockRequestResponses: responses || [],
            conversations: convos || [],
            companyMembers: members || []
        };
    } catch (e) {
        console.error("Critical Grid Failure:", e);
        return await getAllDataForUserMock(user);
    }
};

export const createProject = async (p: any) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('projects').insert([{ 
        contractor_id: p.contractorId, 
        project_name: p.projectName, 
        client_name: p.clientName, 
        address: p.address, 
        status: p.status || ProjectStatus.Planning 
    }]).select().single();
    if (error) return null;
    emitter.emit('data-changed');
    return mapProject(data);
};

export const addExpenseInDb = async (e: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('project_expenses').insert([e]);
    emitter.emit('data-changed');
};

export const createProjectTask = async (t: any) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from('project_tasks').insert([t]).select().single();
    emitter.emit('data-changed');
    return data;
};

export const updateProjectTask = async (id: string, updates: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('project_tasks').update(updates).eq('id', id);
    emitter.emit('data-changed');
};

export const createProjectLog = async (log: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('project_logs').insert([log]);
    emitter.emit('data-changed');
};

export const updateSupplierProfile = async (s: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('companies').update(s).eq('id', s.id);
    emitter.emit('data-changed');
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('orders').update({ status }).eq('id', id);
    emitter.emit('data-changed');
};

export const createStockRequest = async (data: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('stock_requests').insert([data]);
    emitter.emit('data-changed');
};

export const respondToStockRequest = async (data: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('stock_request_responses').insert([data]);
    emitter.emit('data-changed');
};

export const addAsset = async (asset: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('contractor_assets').insert([asset]);
    emitter.emit('data-changed');
};

export const updateAsset = async (id: string, data: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('contractor_assets').update(data).eq('id', id);
    emitter.emit('data-changed');
};

export const seedLogisticsRegistryInDb = async (cid: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('vehicles').insert([{ supplier_id: cid, make_model: 'Toyota Hilux 2.4 GD-6', registration: 'SL-777-GP', status: 'Available' }]);
    await supabase.from('drivers').insert([{ supplier_id: cid, name: 'Sipho Ndlovu', contact_number: '072 000 0000' }]);
    emitter.emit('data-changed');
};
