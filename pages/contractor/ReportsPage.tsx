
import React, { useState, useMemo, ElementType, ReactNode } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { ArrowLeftIcon, DocumentArrowDownIcon, BriefcaseIcon, BuildingStorefrontIcon, CubeIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { Project, OrderStatus, Product, Supplier, ProjectStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/EmptyState';
import AIProjectAnalyst from '../../components/AIProjectAnalyst';

// --- Reusable Components ---
const ReportCard: React.FC<{ 
    title: string; 
    icon: ElementType; 
    children: ReactNode; 
    className?: string; 
    /* Fix: Added style property */
    style?: React.CSSProperties; 
}> = ({ title, icon: Icon, children, className = '', style }) => {
    const { showToast } = useToast();
    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`} style={style}>
            <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            <Icon className="h-5 w-5" />
                        </div>
                        {title}
                    </h3>
                </div>
                <button onClick={() => showToast('Simulating CSV export...', 'info')} className="text-xs bg-white border border-gray-200 text-gray-600 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 hover:text-primary transition-colors">
                    <DocumentArrowDownIcon className="h-3 w-3" /> Export
                </button>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

const CircularProgress: React.FC<{ value: number; max: number; size?: number; strokeWidth?: number }> = ({ value, max, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const offset = circumference - (percentage / 100) * circumference;
    
    const isOverBudget = value > max;
    const color = isOverBudget ? 'text-red-500' : percentage > 80 ? 'text-yellow-500' : 'text-emerald-500';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-gray-100"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${color} transition-all duration-1000 ease-out`}
                />
            </svg>
            <div className="absolute text-center">
                <span className={`text-xs font-bold ${color}`}>
                    {max > 0 ? Math.round((value / max) * 100) : 0}%
                </span>
            </div>
        </div>
    );
};


// --- Report Sections ---

const ProjectCostAnalysis: React.FC = () => {
    const { projects, projectBudgets, projectExpenses } = useData();
    const { formatCurrency } = useCurrency();

    const analysisData = useMemo(() => {
        return projects
            .filter(p => p.status !== ProjectStatus.Planning)
            .map(project => {
                const budget = projectBudgets.find(b => b.projectId === project.id)?.totalBudget || 0;
                const spent = projectExpenses
                    .filter(e => e.projectId === project.id)
                    .reduce((sum, e) => sum + e.amount, 0);
                return { project, budget, spent };
            });
    }, [projects, projectBudgets, projectExpenses]);

    if (analysisData.length === 0) {
        return <p className="text-sm text-gray-500 italic p-4 text-center">No active or completed projects with budget data to analyze.</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-4 text-left">
            {analysisData.map(({ project, budget, spent }) => (
                <div key={project.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                    <div className="flex-grow pr-4">
                        <p className="font-bold text-gray-900">{project.projectName}</p>
                        <p className="text-xs text-gray-500 mb-2">{project.clientName}</p>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Spent</span>
                                <span className="font-semibold">{formatCurrency(spent)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Budget</span>
                                <span className="font-semibold">{budget > 0 ? formatCurrency(budget) : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 pl-4 border-l border-gray-200">
                        {budget > 0 ? (
                            <CircularProgress value={spent} max={budget} size={60} strokeWidth={6} />
                        ) : (
                            <div className="text-xs text-gray-400 text-center w-[60px]">No Limit</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const SupplierPerformanceReport: React.FC = () => {
    const { orders, suppliers } = useData();
    const { formatCurrency } = useCurrency();

    const supplierSpend = useMemo(() => {
        const spendMap = new Map<string, number>();
        orders
            .filter(o => o.status === OrderStatus.Completed)
            .forEach(order => {
                spendMap.set(order.supplierId, (spendMap.get(order.supplierId) || 0) + order.total);
            });
        
        return Array.from(spendMap.entries())
            .map(([supplierId, totalSpend]) => ({
                supplier: suppliers.find(s => s.id === supplierId),
                totalSpend,
            }))
            .filter((item): item is { supplier: Supplier; totalSpend: number } => !!item.supplier)
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 5); // Top 5
    }, [orders, suppliers]);

    if (supplierSpend.length === 0) {
        return <p className="text-sm text-gray-500 italic p-4 text-center">No completed orders to analyze supplier performance.</p>;
    }
    
    return (
         <div className="space-y-3 text-left">
            {supplierSpend.map(({ supplier, totalSpend }, index) => (
                <div key={supplier.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={supplier.logoUrl} className="w-6 h-6 rounded-full object-cover bg-gray-100" alt=""/>
                            <p className="font-medium text-sm text-gray-800">{supplier.name}</p>
                        </div>
                    </div>
                    <p className="font-bold text-sm text-gray-900">{formatCurrency(totalSpend)}</p>
                </div>
            ))}
        </div>
    )
};

const MaterialUsageReport: React.FC = () => {
    const { orders, products } = useData();

    const materialUsage = useMemo(() => {
        const usageMap = new Map<string, number>();
         orders
            .filter(o => o.status === OrderStatus.Completed)
            .flatMap(o => o.items)
            .forEach(item => {
                usageMap.set(item.id, (usageMap.get(item.id) || 0) + item.quantity);
            });
        
        return Array.from(usageMap.entries())
            .map(([productId, totalQuantity]) => ({
                product: products.find(p => p.id === productId),
                totalQuantity,
            }))
            .filter((item): item is { product: Product; totalQuantity: number } => !!item.product)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5);
    }, [orders, products]);
    
     if (materialUsage.length === 0) {
        return <p className="text-sm text-gray-500 italic p-4 text-center">No materials from completed orders to analyze.</p>;
    }

    return (
        <div className="space-y-3 text-left">
            {materialUsage.map(({ product, totalQuantity }) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                    <p className="font-medium text-sm text-gray-700 truncate">{product.name}</p>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{totalQuantity} units</span>
                </div>
            ))}
        </div>
    )
};

// --- Main Page Component ---
interface ReportsPageProps {
    onBack: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const { projects } = useData();

    return (
        <div className="pb-12 text-left">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-6 font-medium">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
                <div>
                    <h2 className="text-3xl font-extrabold flex items-center gap-3 text-gray-900"><ChartBarIcon className="h-8 w-8 text-primary" />{t('navReports')}</h2>
                    <p className="text-gray-600 mt-1">Turn your project data into actionable business insights.</p>
                </div>
            </div>

            {projects.length > 0 && (
                <div className="mb-8 animate-fade-in-up">
                    <AIProjectAnalyst project={projects[0]} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                     <ReportCard title="Project Cost Analysis" icon={BriefcaseIcon} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <ProjectCostAnalysis />
                    </ReportCard>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <ReportCard title="Top Suppliers" icon={BuildingStorefrontIcon} className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <SupplierPerformanceReport />
                    </ReportCard>
                     <ReportCard title="Top Materials" icon={CubeIcon} className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <MaterialUsageReport />
                    </ReportCard>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
