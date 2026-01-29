
import React, { useState, useMemo } from 'react';
import { XMarkIcon, TrashIcon, ArrowLeftIcon, CalculatorIcon } from '@heroicons/react/24/solid';

interface WasteCalculatorModalProps {
    onClose: () => void;
    onSearch: (searchTerm: string) => void;
}

const WasteCalculatorModal: React.FC<WasteCalculatorModalProps> = ({ onClose, onSearch }) => {
    const [rubbleType, setRubbleType] = useState('loose'); // loose or solid
    const [volume, setVolume] = useState('');
    const [area, setArea] = useState('');
    const [depth, setDepth] = useState('');
    const [calcMode, setCalcMode] = useState<'volume' | 'dimensions'>('dimensions');

    // Bulking factors (expansion when broken up)
    const FACTOR_CONCRETE = 1.5;
    const FACTOR_SOIL = 1.3;
    const FACTOR_BRICK = 1.4;

    const [material, setMaterial] = useState('brick');
    const SKIP_SIZE = 6; // Standard 6 cubic meter skip

    const { totalVolume, skipsNeeded } = useMemo(() => {
        let baseVol = 0;
        
        if (calcMode === 'volume') {
            baseVol = parseFloat(volume);
        } else {
            const a = parseFloat(area);
            const d = parseFloat(depth);
            if (!isNaN(a) && !isNaN(d)) {
                baseVol = a * d;
            }
        }

        if (isNaN(baseVol) || baseVol <= 0) return { totalVolume: 0, skipsNeeded: 0 };

        let factor = 1;
        if (rubbleType === 'solid') {
            if (material === 'concrete') factor = FACTOR_CONCRETE;
            if (material === 'soil') factor = FACTOR_SOIL;
            if (material === 'brick') factor = FACTOR_BRICK;
        }

        const expandedVol = baseVol * factor;
        const skips = Math.ceil(expandedVol / SKIP_SIZE);

        return { totalVolume: expandedVol.toFixed(1), skipsNeeded: skips };
    }, [volume, area, depth, calcMode, rubbleType, material]);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center justify-center gap-3 mb-4 pt-2">
                    <TrashIcon className="h-8 w-8 text-primary"/>
                    <h2 className="text-2xl font-bold text-primary">Waste Estimator</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setCalcMode('dimensions')} className={`flex-1 py-1.5 text-sm font-bold rounded-md ${calcMode === 'dimensions' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>By Dimensions</button>
                        <button onClick={() => setCalcMode('volume')} className={`flex-1 py-1.5 text-sm font-bold rounded-md ${calcMode === 'volume' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>By Volume</button>
                    </div>

                    {calcMode === 'dimensions' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Area (m²)</label>
                                <input type="number" value={area} onChange={e => setArea(e.target.value)} className="mt-1 p-2 w-full border rounded-md" placeholder="e.g. 50"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Depth/Thickness (m)</label>
                                <input type="number" value={depth} onChange={e => setDepth(e.target.value)} className="mt-1 p-2 w-full border rounded-md" placeholder="e.g. 0.15"/>
                            </div>
                        </div>
                    ) : (
                         <div>
                            <label className="block text-sm font-medium">Known Volume (m³)</label>
                            <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="mt-1 p-2 w-full border rounded-md" placeholder="e.g. 10"/>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium">Material State</label>
                        <div className="flex gap-2 mt-1">
                             <button onClick={() => setRubbleType('solid')} className={`flex-1 py-2 border rounded-md text-sm ${rubbleType === 'solid' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`}>Solid (To be broken)</button>
                             <button onClick={() => setRubbleType('loose')} className={`flex-1 py-2 border rounded-md text-sm ${rubbleType === 'loose' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`}>Already Loose</button>
                        </div>
                    </div>

                    {rubbleType === 'solid' && (
                        <div>
                            <label className="block text-sm font-medium">Material Type</label>
                            <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white">
                                <option value="brick">Brick/Rubble (x1.4)</option>
                                <option value="concrete">Concrete (x1.5)</option>
                                <option value="soil">Soil/Sand (x1.3)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Expansion factor applied for broken material.</p>
                        </div>
                    )}
                </div>

                {Number(totalVolume) > 0 && (
                    <div className="mt-6 bg-red-50 p-4 rounded-lg text-center border border-red-100">
                        <p className="text-sm text-gray-600">Total Waste Volume</p>
                        <p className="text-2xl font-bold text-gray-800 mb-3">{totalVolume} m³</p>
                        
                        <div className="border-t border-red-200 pt-3 flex justify-between items-center px-4">
                            <span className="font-bold text-red-800">Rec. Skips (6m³)</span>
                            <span className="text-3xl font-extrabold text-red-600 bg-white px-3 py-1 rounded-lg shadow-sm border border-red-200">{skipsNeeded}</span>
                        </div>
                        
                        <button onClick={() => onSearch('Skip Hire')} className="mt-4 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                            Find Skip Hire
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WasteCalculatorModal;
