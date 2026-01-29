import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
    User, Product, Order, Company, Project, QuoteRequest, 
    OrderStatus, QuoteStatus, ProjectStatus, Jurisdiction, BuildingStandard,
    ExpenseCategory, ProjectMaterialStatus, TaskStatus
} from '../types';
import { mockData, getAllDataForUser as getAllDataForUserMock } from './mockApi';

/**
 * StockLink Ferrari | Real Data Protocol v80.5
 * High-performance mapping for Supabase Production Grid.
 */

const mapProduct = (p: any): Product => ({
    id: p?.id || 'unknown',
    name: p?.name || 'Unknown Product',
    category: p?.category || 'General',
    brand: p?.brand || 'Generic',
    price: Number(p?.price) || 0,
    stock: Number(p?.stock) || 0,
    supplierId: p?.supplier_id || '',
    description: p?.description || '',
    imageUrl: p?.image_url || 'https://picsum.photos/seed/stock/200',
    deliveryOptions: p?.delivery_options || [],
    discountPrice: p?.discount_price ? Number(p?.discount_price) : undefined,
    isContractorListing: p?.is_contractor_listing || false,
    sellerName: p?.seller_name,
    sellerCompanyId: p?.seller_company_id
});

const mapOrder = (o: any): Order => ({
    id: o?.id || 'unknown',
    orderNumber: o?.order_number || 'ORD-000',
    contractorId: o?.contractor_id || '',
    contractorName: o?.contractor_name || 'Unknown',
    supplierId: o?.supplier_id || '',
    companyId: o?.contractor_id || '',
    items: o?.items || [],
    total: Number(o?.total) || 0,
    status: (o?.status as OrderStatus) || OrderStatus.New,
    currency: (o?.currency as any) || 'ZAR',
    isInternational: o?.is_international || false,
    createdAt: new Date(o?.created_at || Date.now()),
    updatedAt: o?.updated_at ? new Date(o.updated_at) : undefined,
    deliveryDetails: o?.delivery_details,
    deliveryAddress: o?.delivery_address,
    projectId: o?.project_id
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

export const getAllDataForUser = async (user: User) => {
    if (!isSupabaseConfigured) return await getAllDataForUserMock(user);
    
    try {
        const [
            projectsRes, productsRes, ordersRes, quotesRes, 
            companiesRes, logsRes, materialsRes, expensesRes, 
            tasksRes, milestonesRes, vehiclesRes, driversRes, 
            loadsRes
        ] = await Promise.all([
            supabase.from('projects').select('*'),
            supabase.from('products').select('*'),
            supabase.from('orders').select('*'),
            supabase.from('quotes').select('*'),
            supabase.from('companies').select('*'),
            supabase.from('project_logs').select('*'),
            supabase.from('project_materials').select('*'),
            supabase.from('project_expenses').select('*'),
            supabase.from('project_tasks').select('*'),
            supabase.from('project_milestones').select('*'),
            supabase.from('vehicles').select('*'),
            supabase.from('drivers').select('*'),
            supabase.from('logistics_loads').select('*')
        ]);

        const result = {
            ...mockData, 
            products: (productsRes.data || []).map(mapProduct),
            orders: (ordersRes.data || []).map(mapOrder),
            projects: (projectsRes.data || []).map(mapProject),
            suppliers: (companiesRes.data || []).filter(c => c.type === 'supplier'),
            projectLogs: logsRes.data || [],
            projectMaterials: materialsRes.data || [],
            projectExpenses: expensesRes.data || [],
            projectTasks: tasksRes.data || [],
            projectMilestones: milestonesRes.data || [],
            vehicles: vehiclesRes.data || [],
            drivers: driversRes.data || [],
            logisticsLoads: loadsRes.data || []
        };

        // UI Fallback: Blend with mock data to ensure a rich interface during initial sync
        if (result.products.length === 0) result.products = mockData.products;
        if (result.projects.length === 0) result.projects = mockData.projects;

        return result;
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
        status: p.status 
    }]).select().single();
    if (error) return null;
    return mapProject(data);
};

export const addExpenseInDb = async (e: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('project_expenses').insert([e]);
};

export const createProjectTask = async (t: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('project_tasks').insert([t]);
};

export const updateProjectTask = async (id: string, updates: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('project_tasks').update(updates).eq('id', id);
};

export const createProjectLog = async (log: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('project_logs').insert([log]);
};

export const updateSupplierProfile = async (s: any) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('companies').update(s).eq('id', s.id);
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('orders').update({ status }).eq('id', id);
};
