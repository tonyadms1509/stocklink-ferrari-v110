import React, { useState, useMemo } from 'react';
import { XMarkIcon, BuildingLibraryIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface BrickCalculatorModalProps {
    onClose: () => void;
    onSearch: (searchTerm: string) => void;
}

const BrickCalculatorModal: React.FC<BrickCalculatorModalProps> = ({ onClose, onSearch }) => {
    const [area, setArea] = useState('');
    const [wallType, setWallType] = useState<'single' | 'double'>('single');
    
    const BRICKS_PER_M2_SINGLE = 55;
    const BRICKS_PER_M2_DOUBLE = 110;

    const totalBricks = useMemo(() => {
        const a = parseFloat(area);
        if (isNaN(a) || a <= 0) {
            return 0;
        }
        const bricksPerM2 = wallType === 'single' ? BRICKS_PER_M2_SINGLE : BRICKS_PER_M2_DOUBLE;
        return Math.ceil(a * bricksPerM2);
    }, [area, wallType]);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center justify-center gap-3 mb-4 pt-2">
                    <BuildingLibraryIcon className="h-8 w-8 text-primary"/>
                    <h2 className="text-2xl font-bold text-primary">Brick Calculator</h2>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Total Wall Area (m²)</label>
                        <input type="number" value={area} onChange={e => setArea(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Wall Type</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <button
                                type="button"
                                onClick={() => setWallType('single')}
                                className={`px-4 py-2 border rounded-l-md w-1/2 ${wallType === 'single' ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                            >
                                Single Brick
                            </button>
                            <button
                                type="button"
                                onClick={() => setWallType('double')}
                                className={`px-4 py-2 border rounded-r-md w-1/2 ${wallType === 'double' ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                            >
                                Double Brick
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Assumes standard SA stock brick (~222x106x73mm) with 10mm mortar joints.</p>
                </div>

                {totalBricks > 0 && (
                    <div className="mt-6 text-center bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold">Total Bricks Needed:</p>
                        <p className="text-4xl font-bold text-secondary">{totalBricks}</p>
                        <button onClick={() => onSearch('Stock Brick')} className="mt-2 text-sm text-primary font-semibold hover:underline">
                            Find Bricks
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrickCalculatorModal;
