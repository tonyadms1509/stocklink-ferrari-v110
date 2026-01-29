
import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

const TermsOfServicePage: React.FC = () => {
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
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms of Service</h1>
                    <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-4 text-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 mt-6">1. Introduction</h2>
                        <p>Welcome to StockLink ("we", "us", "our"). These Terms of Service govern your use of our web application and form a binding contractual agreement between you, the user of the Site, and us. By using the Site, you agree to be bound by these Terms.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6">2. User Accounts</h2>
                        <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6">3. Content</h2>
                        <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6">4. Prohibited Activities</h2>
                        <p>You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium; (ii) using any automated system to access the Service; (iii) transmitting spam or other unsolicited email; (iv) attempting to interfere with the server.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6">5. Termination</h2>
                        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6">6. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law provisions.</p>
                        
                        <h2 className="text-xl font-bold text-gray-900 mt-6">7. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at admin@stocklinksa.co.za.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfServicePage;
