
import React, { useState } from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="bg-base-100 min-h-screen flex flex-col text-text-main">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <a href="#/" className="flex items-center gap-4">
                        <Logo className="h-8 w-auto text-primary" />
                        <h1 className="text-2xl font-bold text-primary">StockLink</h1>
                    </a>
                    <a href="#/" className="text-sm font-semibold text-primary hover:underline flex items-center gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Home
                    </a>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheckIcon className="h-10 w-10 text-green-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Effective Date: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Introduction and Scope</h2>
                            <p>StockLink ("we", "us", "our") is committed to protecting your privacy and ensuring that your personal information is collected and processed in compliance with the <strong>Protection of Personal Information Act 4 of 2013 (POPIA)</strong> and the <strong>Promotion of Access to Information Act 2 of 2000 (PAIA)</strong> of South Africa.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Information We Collect</h2>
                            <p>We collect personal information to provide our construction management and procurement services. This includes:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
                                <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone numbers.</li>
                                <li><strong>Business Data:</strong> Company registration number, VAT number, and trade references (where applicable).</li>
                                <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products and services you have purchased from us.</li>
                                <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">3. How We Use Your Information</h2>
                            <p>We use your personal data only as permitted by law. Most commonly, we will use your personal data:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>To perform the contract we are about to enter into or have entered into with you (e.g., facilitating orders between Contractors and Suppliers).</li>
                                <li>To manage payments, fees, and charges.</li>
                                <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
                                <li>To enable AI features (e.g., sourcing assistance, project estimation) which process anonymized data patterns.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Data Security</h2>
                            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Your Legal Rights (POPIA)</h2>
                            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Request access to your personal data.</li>
                                <li>Request correction of your personal data.</li>
                                <li>Request erasure of your personal data.</li>
                                <li>Object to processing of your personal data.</li>
                                <li>Request restriction of processing your personal data.</li>
                            </ul>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">6. Information Officer Contact</h2>
                            <p>If you have any questions about this Privacy Policy or our privacy practices, please contact our Information Officer:</p>
                            <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p><strong>Email:</strong> privacy@stocklinksa.co.za</p>
                                <p><strong>Address:</strong> Fred Davey Street, Silverton, Pretoria, South Africa</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
