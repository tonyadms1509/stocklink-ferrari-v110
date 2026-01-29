
import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { Product, DeliveryOption } from '../../types';
import { ArrowLeft, Plus, Pencil, Trash2, X, Sparkles, Package } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/EmptyState';

const ListingForm: React.FC<{ product?: Product; onSave: (product: any) => void; onCancel: () => void }> = ({ product, onSave, onCancel }) => {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Building Materials',
    brand: product?.brand || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || `https://picsum.photos/seed/cprod${Date.now()}/400/300`,
    deliveryOptions: [DeliveryOption.Pickup], 
  });

  const handleGenerateDetails = async () => {
    if (!formData.name || !process.env.API_KEY) return;
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a professional 2-sentence description and a suggested price in ZAR for a contractor selling surplus "${formData.name}". Respond in JSON format with "description" and "price" keys.`
        });
        const data = JSON.parse(response.text || '{}');
        setFormData(prev => ({ ...prev, description: data.description, price: data.price.toString() }));
        showToast("AI details generated!", "success");
    } catch (err) {
        showToast("AI generation failed.", "error");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{product ? 'Edit Surplus Item' : 'List Surplus Stock'}</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6"/></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <button type="button" onClick={handleGenerateDetails} disabled={isGenerating || !formData.name} className="flex items-center gap-1 text-sm text-blue-600 font-bold hover:text-blue-800">
                    <Sparkles className="h-4 w-4" /> AI Assist
                </button>
            </div>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="p-3 border rounded-xl w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (ZAR)</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="p-3 border rounded-xl w-full" required />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="p-3 border rounded-xl w-full" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Condition / Note</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="p-3 border rounded-xl w-full" rows={3}/>
          </div>
          <div className="flex justify-end md:col-span-2 gap-4 mt-4">
            <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg">Save Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyListings: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { products, addContractorProduct, updateContractorProduct, deleteContractorProduct } = useData();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const contractorProducts = products.filter(p => p.isContractorListing);

    const handleSave = async (productData: any) => {
        if (editingProduct) {
            await updateContractorProduct({ ...editingProduct, ...productData });
        } else {
            await addContractorProduct(productData);
        }
        setIsModalOpen(false);
        setEditingProduct(undefined);
    };

    return (
        <div className="animate-fade-in-up">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-blue-600 hover:underline mb-6 font-bold">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </button>
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Contractor Exchange</h2>
                    <p className="text-gray-500 mt-1">Recoup costs by selling surplus materials to other local contractors.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all">
                    <Plus className="h-5 w-5" /> List Surplus Stock
                </button>
            </div>

            {contractorProducts.length === 0 ? (
                <EmptyState icon={Package} title="No active listings" message="Have leftover cement, timber, or tiles? List them here for the community to buy." />
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contractorProducts.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                            <img src={p.imageUrl} alt={p.name} className="h-40 w-full object-cover rounded-xl mb-4" />
                            <h4 className="font-bold text-lg text-gray-900">{p.name}</h4>
                            <p className="text-sm text-gray-500 mb-4 flex-grow">{p.description}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="font-bold text-lg text-blue-600">{formatCurrency(p.price)}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"><Pencil className="h-4 w-4"/></button>
                                    <button onClick={() => deleteContractorProduct(p.id)} className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {isModalOpen && <ListingForm product={editingProduct} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default MyListings;
