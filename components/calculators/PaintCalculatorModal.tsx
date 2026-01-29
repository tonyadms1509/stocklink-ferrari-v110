import React, { useState, useMemo } from 'react';
import { XMarkIcon, PaintBrushIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface PaintCalculatorModalProps {
    onClose: () => void;
    onSearch: (searchTerm: string) => void;
}

const PaintCalculatorModal: React.FC<PaintCalculatorModalProps> = ({ onClose, onSearch }) => {
    const [height, setHeight] = useState('');
    const [width, setWidth] = useState('');
    const [coats, setCoats] = useState('2');
    const COVERAGE_PER_LITRE = 9; // Assumes 9m² per litre

    const totalLitres = useMemo(() => {
        const h = parseFloat(height);
        const w = parseFloat(width);
        const c = parseInt(coats, 10);
        if (isNaN(h) || isNaN(w) || isNaN(c) || h <= 0 || w <= 0 || c <= 0) {
            return 0;
        }
        const area = h * w;
        const totalArea = area * c;
        return Math.ceil(totalArea / COVERAGE_PER_LITRE);
    }, [height, width, coats]);

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
                    <PaintBrushIcon className="h-8 w-8 text-primary"/>
                    <h2 className="text-2xl font-bold text-primary">Paint Calculator</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Wall Height (m)</label>
                            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Wall Width (m)</label>
                            <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Number of Coats</label>
                        <input type="number" value={coats} onChange={e => setCoats(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <p className="text-xs text-gray-500 text-center">Assumes coverage of {COVERAGE_PER_LITRE}m² per litre.</p>
                </div>

                {totalLitres > 0 && (
                    <div className="mt-6 text-center bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold">Total Litres Needed:</p>
                        <p className="text-4xl font-bold text-secondary">{totalLitres} L</p>
                        <button onClick={() => onSearch('Paint')} className="mt-2 text-sm text-primary font-semibold hover:underline">
                            Find Paint
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaintCalculatorModal;
