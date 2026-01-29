
import React, { useState, useMemo } from 'react';
import { XMarkIcon, CubeIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface DrywallCalculatorModalProps {
    onClose: () => void;
    onSearch: (searchTerm: string) => void;
}

const DrywallCalculatorModal: React.FC<DrywallCalculatorModalProps> = ({ onClose, onSearch }) => {
    const [length, setLength] = useState('');
    const [height, setHeight] = useState('');
    const [sides, setSides] = useState('1'); // 1 or 2 sides clad

    // Standard SA Gypsum Board: 1.2m x 2.7m (Common residential height)
    const BOARD_WIDTH = 1.2;
    const BOARD_HEIGHT = 2.7;
    const BOARD_AREA = BOARD_WIDTH * BOARD_HEIGHT;

    const { boards, studs, track, screws } = useMemo(() => {
        const l = parseFloat(length);
        const h = parseFloat(height);
        const s = parseInt(sides, 10);

        if (isNaN(l) || isNaN(h) || l <= 0 || h <= 0) {
            return { boards: 0, studs: 0, track: 0, screws: 0 };
        }

        const totalArea = l * h * s;
        // Add 10% wastage for boards
        const numBoards = Math.ceil((totalArea / BOARD_AREA) * 1.1); 
        
        // Studs every 600mm + 1 for end
        const numStuds = Math.ceil(l / 0.6) + 1;

        // Track: Top and Bottom
        const totalTrackMeters = Math.ceil(l * 2);
        const numTrackLengths = Math.ceil(totalTrackMeters / 3.0); // Assuming 3m lengths

        // Screws: Approx 30 per board
        const numScrews = Math.ceil(numBoards * 30);

        return { boards: numBoards, studs: numStuds, track: numTrackLengths, screws: numScrews };
    }, [length, height, sides]);

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
                    <CubeIcon className="h-8 w-8 text-primary"/>
                    <h2 className="text-2xl font-bold text-primary">Drywall Calc</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Wall Length (m)</label>
                            <input type="number" value={length} onChange={e => setLength(e.target.value)} className="mt-1 p-2 w-full border rounded-md focus:ring-primary focus:border-primary" placeholder="e.g. 5.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Ceiling Height (m)</label>
                            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="mt-1 p-2 w-full border rounded-md focus:ring-primary focus:border-primary" placeholder="e.g. 2.6" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Cladding Sides</label>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setSides('1')} className={`flex-1 py-2 border rounded-md ${sides === '1' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`}>One Side</button>
                            <button onClick={() => setSides('2')} className={`flex-1 py-2 border rounded-md ${sides === '2' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`}>Both Sides</button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Calculations based on 600mm stud spacing and standard 1.2m boards.</p>
                </div>

                {boards > 0 && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-center mb-3 text-gray-800">Materials Needed</h3>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <div className="flex justify-between border-b pb-1">
                                <span>Gypsum Boards</span>
                                <span className="font-bold text-primary">{boards}</span>
                            </div>
                             <div className="flex justify-between border-b pb-1 pl-2 border-l">
                                <span>Studs (2.7m)</span>
                                <span className="font-bold text-primary">{studs}</span>
                            </div>
                             <div className="flex justify-between border-b pb-1">
                                <span>Track (3m)</span>
                                <span className="font-bold text-primary">{track}</span>
                            </div>
                             <div className="flex justify-between border-b pb-1 pl-2 border-l">
                                <span>Screws</span>
                                <span className="font-bold text-primary">{screws}</span>
                            </div>
                        </div>
                        <button onClick={() => onSearch('Gypsum Board')} className="mt-4 w-full bg-secondary text-white py-2 rounded-lg font-bold hover:bg-emerald-600 transition-colors">
                            Find Drywall Supplies
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrywallCalculatorModal;
