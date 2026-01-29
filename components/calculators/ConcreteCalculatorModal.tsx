import React, { useState, useMemo } from 'react';
import { XMarkIcon, BeakerIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface ConcreteCalculatorModalProps {
    onClose: () => void;
    onSearch: (searchTerm: string) => void;
}

const ConcreteCalculatorModal: React.FC<ConcreteCalculatorModalProps> = ({ onClose, onSearch }) => {
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [thickness, setThickness] = useState('0.1'); // Default to 100mm

    // Constants for a 1:2:3 mix ratio per cubic meter
    const CEMENT_BAGS_PER_M3 = 7; // Approx. 7 x 50kg bags
    const SAND_KG_PER_M3 = 700; 
    const STONE_KG_PER_M3 = 1400; 

    const { volume, cement, sand, stone } = useMemo(() => {
        const l = parseFloat(length);
        const w = parseFloat(width);
        const t = parseFloat(thickness);
        if (isNaN(l) || isNaN(w) || isNaN(t) || l <= 0 || w <= 0 || t <= 0) {
            return { volume: 0, cement: 0, sand: 0, stone: 0 };
        }
        const vol = l * w * t;
        return {
            volume: vol.toFixed(2),
            cement: Math.ceil(vol * CEMENT_BAGS_PER_M3),
            sand: Math.ceil(vol * SAND_KG_PER_M3),
            stone: Math.ceil(vol * STONE_KG_PER_M3),
        };
    }, [length, width, thickness]);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center justify-center gap-3 mb-4 pt-2">
                    <BeakerIcon className="h-8 w-8 text-primary"/>
                    <h2 className="text-2xl font-bold text-primary">Concrete Calculator</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Length (m)</label>
                            <input type="number" value={length} onChange={e => setLength(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Width (m)</label>
                            <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Thickness (m)</label>
                            <input type="number" value={thickness} onChange={e => setThickness(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Based on a standard 1:2:3 cement:sand:stone mix ratio.</p>
                </div>

                {Number(volume) > 0 && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold text-center mb-2">Total Volume: <span className="text-xl font-bold text-primary">{volume} m³</span></p>
                        <div className="grid grid-cols-3 gap-2 text-center border-t pt-2">
                             <div>
                                <p className="font-semibold">Cement</p>
                                <p className="text-2xl font-bold text-secondary">{cement}</p>
                                <p className="text-xs text-gray-500">(50kg bags)</p>
                            </div>
                            <div>
                                <p className="font-semibold">Sand</p>
                                <p className="text-2xl font-bold text-secondary">{sand}</p>
                                <p className="text-xs text-gray-500">(kg)</p>
                            </div>
                             <div>
                                <p className="font-semibold">Stone</p>
                                <p className="text-2xl font-bold text-secondary">{stone}</p>
                                <p className="text-xs text-gray-500">(kg)</p>
                            </div>
                        </div>
                        <button onClick={() => onSearch('Cement')} className="mt-4 w-full text-sm text-primary font-semibold hover:underline">
                            Find Materials
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcreteCalculatorModal;