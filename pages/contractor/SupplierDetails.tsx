
import React from 'react';
import { Supplier } from '../../types';
import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon, ClockIcon, MapPinIcon, StarIcon, ChatBubbleLeftRightIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';

interface SupplierDetailsProps {
  supplier: Supplier;
  onBack: () => void;
  onStartChat: (supplierId: string, context?: { productId: string }) => void;
}

const SupplierDetails: React.FC<SupplierDetailsProps> = ({ supplier, onBack, onStartChat }) => {
  const { t } = useLocalization();
  return (
    <div>
        <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-6 font-semibold px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('backToHome')}
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="md:w-1/3 text-center flex-shrink-0">
                    <img src={supplier.logoUrl} alt={`${supplier.name} logo`} className="w-40 h-40 object-cover rounded-full mx-auto mb-4 border-4 border-gray-100 shadow-md"/>
                    <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                    <p className="text-gray-500">{supplier.location}</p>
                    {supplier.reviews > 0 ? (
                        <div className="flex justify-center items-center mt-2">
                            <StarIcon className="h-5 w-5 text-yellow-400" />
                            <span className="ml-1 font-bold text-gray-900">{supplier.rating}</span>
                            <span className="ml-2 text-gray-500">({supplier.reviews} reviews)</span>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center mt-2 text-sm text-gray-500">
                            No reviews yet
                        </div>
                    )}
                    <button 
                        onClick={() => onStartChat(supplier.id)} 
                        className="mt-6 w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                    >
                        <ChatBubbleLeftRightIcon className="h-5 w-5"/>
                        Chat with Supplier
                    </button>
                </div>
                
                <div className="md:w-2/3 space-y-8 w-full">
                    <div>
                        <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4 text-gray-800">Contact Information</h2>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-center gap-3"><PhoneIcon className="h-5 w-5 text-gray-400"/> {supplier.contact.phone}</li>
                            <li className="flex items-center gap-3"><EnvelopeIcon className="h-5 w-5 text-gray-400"/> {supplier.contact.email}</li>
                            {supplier.contact.website && (
                                <li className="flex items-center gap-3">
                                    <GlobeAltIcon className="h-5 w-5 text-gray-400"/>
                                    <a href={`//${supplier.contact.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                        {supplier.contact.website}
                                    </a>
                                </li>
                            )}
                            <li className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.31 3.4 16.78L2.03 21.96L7.33 20.61C8.75 21.36 10.35 21.81 12.04 21.81C17.5 21.81 21.95 17.36 21.95 11.9C21.95 6.45 17.5 2 12.04 2ZM17.94 15.11C17.75 15.62 16.59 16.21 16.03 16.26C15.48 16.31 14.88 16.34 14.53 16.16C14.18 15.98 13.3 15.51 12.28 14.58C11.02 13.42 10.26 12.11 10.08 11.76C9.9 11.41 10.16 11.19 10.33 11.01C10.48 10.86 10.65 10.64 10.83 10.44C11.01 10.23 11.08 10.09 11.23 9.81C11.38 9.53 11.31 9.3 11.22 9.12C11.13 8.94 10.56 7.53 10.33 6.96C10.1 6.39 9.87 6.48 9.7 6.47C9.54 6.46 9.34 6.46 9.15 6.46C8.96 6.46 8.68 6.53 8.44 6.75C8.2 6.97 7.55 7.55 7.55 8.71C7.55 9.87 8.45 10.99 8.59 11.17C8.73 11.35 10.03 13.52 12.19 14.41C14.34 15.29 14.88 15.06 15.26 15.01C15.64 14.96 16.75 14.36 16.97 13.8C17.19 13.23 17.19 12.78 17.1 12.65C17.01 12.51 16.82 12.42 16.57 12.33C16.32 12.24 15.14 11.67 14.91 11.59C14.68 11.51 14.53 11.47 14.38 11.72C14.23 11.96 13.84 12.43 13.7 12.58C13.56 12.72 13.41 12.76 13.17 12.67C12.92 12.58 12.01 12.26 10.9 11.28C10.01 10.51 9.42 9.61 9.27 9.36C9.12 9.12 9.26 8.96 9.4 8.83C9.53 8.71 9.68 8.52 9.82 8.35C9.97 8.18 10.04 8.06 10.13 7.9C10.22 7.74 10.18 7.6 10.11 7.51C10.04 7.42 9.49 6.07 9.29 5.58C9.09 5.09 8.89 5.16 8.73 5.15H8.73Z"></path></svg>
                                <a href={`https://wa.me/${supplier.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-green-700">
                                Chat on WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4 text-gray-800">Business Hours</h2>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-center gap-3"><ClockIcon className="h-5 w-5 text-gray-400"/> <strong>Weekdays:</strong> &nbsp;{supplier.businessHours.weekdays}</li>
                            <li className="flex items-center gap-3"><ClockIcon className="h-5 w-5 text-gray-400"/> <strong>Saturday:</strong> &nbsp;{supplier.businessHours.saturday}</li>
                            <li className="flex items-center gap-3"><ClockIcon className="h-5 w-5 text-gray-400"/> <strong>Sunday:</strong> &nbsp;{supplier.businessHours.sunday}</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4 text-gray-800">Delivery Zones</h2>
                        <div className="flex flex-wrap gap-2">
                            {supplier.deliveryZones.map(zone => (
                                <span key={zone} className="bg-blue-100 text-primary text-sm font-medium px-3 py-1 rounded-full">{zone}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SupplierDetails;
