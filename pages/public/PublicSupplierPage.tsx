
import React, { useState, useEffect, useMemo } from 'react';
import { Supplier, Product, Review } from '../../types';
import { getCompanies, getAllDataForUser } from '../../services/mockApi';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, StarIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { useToast } from '../../hooks/useToast';

const PublicSupplierPage: React.FC<{ supplierId: string }> = ({ supplierId }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // This is a bit hacky since we are using the mock API designed for authenticated context
                // In a real app, there would be public endpoints.
                // We will simulate fetching by getting all data and filtering.
                // Assuming 'getAllDataForUser' with an admin mock user gets us most things we need for simulation.
                
                // Simulating a fetch
                const companies = await getCompanies();
                const targetCompany = companies.find(c => c.id === supplierId && c.type === 'supplier');
                
                if (targetCompany) {
                     // Mock fetching products/reviews
                     // In real implementation, would call specific endpoints
                     // Here we reuse the big data fetcher but filtered
                     const dummyUser = { id: 'public_viewer', role: 'admin' } as any;
                     const allData: any = await getAllDataForUser(dummyUser);

                     const sup = allData.suppliers.find((s: any) => s.id === supplierId);
                     if(sup) {
                         setSupplier(sup);
                         setProducts(allData.products.filter((p: any) => p.supplierId === supplierId));
                         setReviews(allData.reviews.filter((r: any) => r.supplierId === supplierId));
                     }
                }
            } catch (error) {
                console.error("Failed to load supplier data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [supplierId]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const handleContact = (e: React.FormEvent) => {
        e.preventDefault();
        showToast("Inquiry sent! The supplier will contact you shortly.", "success");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-primary animate-pulse font-bold">Loading Storefront...</p></div>;
    if (!supplier) return <div className="min-h-screen flex items-center justify-center text-gray-500">Supplier not found.</div>;

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                     <a href="#/" className="flex items-center gap-3">
                         <Logo className="h-8 w-auto text-primary" />
                         <span className="font-bold text-xl text-primary hidden sm:inline">StockLink</span>
                    </a>
                    <div className="text-sm text-gray-500">Supplier Storefront</div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                {/* Hero Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                            <img src={supplier.logoUrl} alt={supplier.name} className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-white object-cover" />
                            <div className="flex-grow">
                                <h1 className="text-3xl font-extrabold text-gray-900">{supplier.name}</h1>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4"/> {supplier.location}</span>
                                    <span className="flex items-center gap-1"><StarIcon className="h-4 w-4 text-yellow-400"/> {supplier.rating} ({supplier.reviews} reviews)</span>
                                </div>
                            </div>
                             <div className="flex gap-2 mt-4 md:mt-0">
                                {supplier.contact.phone && (
                                    <a href={`tel:${supplier.contact.phone}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <PhoneIcon className="h-4 w-4"/> Call
                                    </a>
                                )}
                                {supplier.contact.whatsapp && (
                                     <a href={`https://wa.me/${supplier.contact.whatsapp}`} target="_blank" rel="noreferrer" className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
                                        <ChatBubbleLeftRightIcon className="h-4 w-4"/> WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">About Us</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        We are a trusted supplier of quality building materials in {supplier.location}. 
                                        Serving contractors and DIY enthusiasts with competitive prices and reliable delivery.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Product Catalog</h3>
                                    <div className="mb-4 relative">
                                        <input 
                                            type="text" 
                                            placeholder="Search products..." 
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                        />
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredProducts.slice(0, 6).map(product => (
                                            <div key={product.id} className="border rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow bg-white">
                                                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md bg-gray-100"/>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                                                    <p className="font-bold text-primary">{formatCurrency(product.discountPrice || product.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {products.length > 6 && (
                                        <div className="text-center mt-4">
                                            <button className="text-primary font-semibold hover:underline">View All Products</button>
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Reviews</h3>
                                    <div className="space-y-4">
                                        {reviews.length > 0 ? reviews.map(review => (
                                            <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-bold">{review.contractorName}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                                            </div>
                                        )) : <p className="text-gray-500 italic">No reviews yet.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="font-bold text-gray-800 mb-4">Business Hours</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between"><span>Mon - Fri</span> <span className="font-medium">{supplier.businessHours.weekdays}</span></div>
                                        <div className="flex justify-between"><span>Saturday</span> <span className="font-medium">{supplier.businessHours.saturday}</span></div>
                                        <div className="flex justify-between"><span>Sunday</span> <span className="font-medium">{supplier.businessHours.sunday}</span></div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                    <h3 className="font-bold text-blue-900 mb-2">Request a Quote</h3>
                                    <p className="text-sm text-blue-700 mb-4">Looking for bulk materials? Send us a message.</p>
                                    <form onSubmit={handleContact} className="space-y-3">
                                        <input type="text" placeholder="Your Name" required className="w-full p-2 rounded border-gray-200 text-sm"/>
                                        <input type="email" placeholder="Your Email" required className="w-full p-2 rounded border-gray-200 text-sm"/>
                                        <textarea placeholder="What do you need?" rows={3} required className="w-full p-2 rounded border-gray-200 text-sm"></textarea>
                                        <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">Send Request</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublicSupplierPage;
