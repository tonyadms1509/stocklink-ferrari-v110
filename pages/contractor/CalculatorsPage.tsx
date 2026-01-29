
import React from 'react';
import { PaintBrushIcon, BeakerIcon, BuildingLibraryIcon, ArrowRightIcon, ArrowLeftIcon, ScissorsIcon, CubeIcon, HomeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import CuttingListModal from '../../components/calculators/CuttingListModal';
import DrywallCalculatorModal from '../../components/calculators/DrywallCalculatorModal';
import RoofingCalculatorModal from '../../components/calculators/RoofingCalculatorModal';
import PaintCalculatorModal from '../../components/calculators/PaintCalculatorModal';
import ConcreteCalculatorModal from '../../components/calculators/ConcreteCalculatorModal';
import BrickCalculatorModal from '../../components/calculators/BrickCalculatorModal';
import WasteCalculatorModal from '../../components/calculators/WasteCalculatorModal';

interface CalculatorCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
    gradient: string;
}

const CalculatorCard: React.FC<CalculatorCardProps> = ({ title, description, icon: Icon, onClick, gradient }) => (
    <button
        onClick={onClick}
        className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 text-left w-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col"
    >
        {/* Gradient Background for Icon */}
        <div className={`h-24 ${gradient} flex items-center justify-center relative`}>
             <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Icon className="h-12 w-12 text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-gray-500 mb-4 flex-grow leading-relaxed">{description}</p>
            <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wide pt-4 border-t border-gray-50 mt-auto">
                <span>Launch Tool</span>
                <ArrowRightIcon className="h-3 w-3 ml-auto transition-transform group-hover:translate-x-1"/>
            </div>
        </div>
    </button>
);

interface CalculatorsPageProps {
    onOpenCalculator: (calculator: string) => void;
    onBack?: () => void;
}

const CalculatorsPage: React.FC<CalculatorsPageProps> = ({ onOpenCalculator, onBack }) => {
    const { t } = useLocalization();
    const [activeModal, setActiveModal] = React.useState<string | null>(null);

    const handleOpen = (id: string) => {
        setActiveModal(id);
    };
    
    const calculators = [
        {
            id: 'paint',
            title: 'Paint Calculator',
            description: 'Estimate liters needed based on surface area and coats.',
            icon: PaintBrushIcon,
            gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600'
        },
        {
            id: 'concrete',
            title: 'Concrete Mix',
            description: 'Calculate cement, sand, and stone ratios for slabs.',
            icon: BeakerIcon,
            gradient: 'bg-gradient-to-br from-slate-500 to-gray-700'
        },
        {
            id: 'brick',
            title: 'Brick Estimator',
            description: 'Count standard bricks needed for single or double walls.',
            icon: BuildingLibraryIcon,
            gradient: 'bg-gradient-to-br from-orange-500 to-red-600'
        },
        {
            id: 'cutting',
            title: 'Cutting Optimizer',
            description: 'Minimize waste on linear materials like pipes or timber.',
            icon: ScissorsIcon,
            gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600'
        },
        {
            id: 'drywall',
            title: 'Drywall Calc',
            description: 'Estimate boards, studs, and track for partitioning.',
            icon: CubeIcon,
            gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600'
        },
        {
            id: 'roofing',
            title: 'Roofing Calc',
            description: 'Estimate roof area and sheets/tiles from floor plan.',
            icon: HomeIcon,
            gradient: 'bg-gradient-to-br from-red-500 to-rose-700'
        },
        {
            id: 'waste',
            title: 'Waste & Skips',
            description: 'Calculate rubble volume and required skip bins.',
            icon: TrashIcon,
            gradient: 'bg-gradient-to-br from-yellow-500 to-amber-700'
        },
    ];

    return (
        <div>
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-6 font-medium">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Project Calculators</h2>
                <p className="text-gray-600 mt-2">Professional estimation tools for on-site accuracy.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                {calculators.map((calc, index) => (
                    <div key={calc.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                        <CalculatorCard
                            title={calc.title}
                            description={calc.description}
                            icon={calc.icon}
                            onClick={() => handleOpen(calc.id)}
                            gradient={calc.gradient}
                        />
                    </div>
                ))}
            </div>
            
            {activeModal === 'cutting' && <CuttingListModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'drywall' && <DrywallCalculatorModal onClose={() => setActiveModal(null)} onSearch={() => {}} />}
            {activeModal === 'roofing' && <RoofingCalculatorModal onClose={() => setActiveModal(null)} onSearch={() => {}} />}
            {activeModal === 'paint' && <PaintCalculatorModal onClose={() => setActiveModal(null)} onSearch={() => {}} />}
            {activeModal === 'concrete' && <ConcreteCalculatorModal onClose={() => setActiveModal(null)} onSearch={() => {}} />}
            {activeModal === 'brick' && <BrickCalculatorModal onClose={() => setActiveModal(null)} onSearch={() => {}} />}
            {activeModal === 'waste' && <WasteCalculatorModal onClose={() => setActiveModal(null)} onSearch={() => {}} />}
        </div>
    );
};

export default CalculatorsPage;
