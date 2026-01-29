
import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div className="fixed bottom-28 right-6 z-40 sm:bottom-6">
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="bg-accent hover:bg-yellow-500 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-110"
                    aria-label="Go to top"
                >
                    <ArrowUpIcon className="h-6 w-6" />
                </button>
            )}
        </div>
    );
};

export default ScrollToTopButton;
