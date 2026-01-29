
import React, { useState, useMemo } from 'react';
import { XMarkIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface RoofingCalculatorModalProps {
    onClose: () => void;
    onSearch: (searchTerm: string) => void;
}

const RoofingCalculatorModal: React.FC<RoofingCalculatorModalProps> = ({ onClose, onSearch }) => {
    const [floorArea, setFloorArea] = useState('');
    const [pitch, setPitch] = useState('26'); // Standard pitch
    const [material, setMaterial] = useState<'Tiles' | 'Sheeting'>('Tiles');

    // Estimations
    // Tiles: ~11 per m2 (concrete tiles)
    // Sheeting: Effective width ~0.762m (IBR) or ~0.686m (Corrugated)
    
    const { roofArea, estimatedMaterial } = useMemo(() => {
        const area = parseFloat(floorArea);
        const angle = parseFloat(pitch);
        
        if (isNaN(area) || area <= 0) return { roofArea: 0, estimatedMaterial: 0 };

        // Roof Area = Floor Area / cos(pitch) * overhang factor (approx 1.15)
        const rad = (angle * Math.PI) / 180;
        const estimatedRoofArea = (area / Math.cos(rad)) * 1.15;

        let materialCount = 0;
        if (material === 'Tiles') {
            materialCount = Math.ceil(estimatedRoofArea * 11); // ~11 tiles per m2
        } else {
            // Sheets (assuming avg sheet area coverage of 3m2 per sheet for simplicity in quick calc)
            materialCount = Math.ceil(estimatedRoofArea / 3); 
        }

        return { roofArea: estimatedRoofArea.toFixed(1), estimatedMaterial: materialCount };
    }, [floorArea, pitch, material]);

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
                    <HomeIcon className="h-8 w-8 text-primary"/>
                    <h2 className="text-2xl font-bold text-primary">Roof Estimator</h2>
                </div>

                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">Floor Area (m²)</label>
                        <input type="number" value={floorArea} onChange={e => setFloorArea(e.target.value)} className="mt-1 p-2 w-full border rounded-md focus:ring-primary focus:border-primary" placeholder="e.g. 120" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Roof Pitch (Degrees)</label>
                        <div className="flex gap-2 mt-1">
                             {[15, 26, 35, 45].map(deg => (
                                 <button 
                                    key={deg}
                                    onClick={() => setPitch(deg.toString())}
                                    className={`flex-1 py-2 border rounded-md text-sm font-medium ${pitch === deg.toString() ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`}
                                >
                                    {deg}°
                                </button>
                             ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Material Type</label>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setMaterial('Tiles')} className={`flex-1 py-2 border rounded-md ${material === 'Tiles' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`}>Concrete Tiles</button>
                            <button onClick={() => setMaterial('Sheeting')} className={`flex-1 py-2 border rounded-md ${material === 'Sheeting' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`}>IBR Sheeting</button>
                        </div>
                    </div>
                </div>

                {Number(roofArea) > 0 && (
                     <div className="mt-6 bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Estimated Roof Surface Area</p>
                        <p className="text-2xl font-bold text-gray-800 mb-3">{roofArea} m²</p>
                        
                        <div className="border-t border-blue-200 pt-3">
                            <p className="text-sm text-gray-600">Estimated Quantity</p>
                            <p className="text-3xl font-extrabold text-secondary">{estimatedMaterial} {material === 'Tiles' ? 'Tiles' : 'Sheets (3m)'}</p>
                        </div>
                        
                        <button onClick={() => onSearch(material === 'Tiles' ? 'Roof Tiles' : 'Roof Sheeting')} className="mt-4 text-sm font-bold text-primary hover:underline">
                            Check Prices for {material}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoofingCalculatorModal;
