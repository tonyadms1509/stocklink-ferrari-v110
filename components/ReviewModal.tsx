
import React, { useState } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Order, Supplier } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';

interface ReviewModalProps {
    order: Order;
    supplier: Supplier;
    onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ order, supplier, onClose }) => {
    const { t } = useLocalization();
    const { submitReview } = useData();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0) {
            submitReview({
                orderId: order.id,
                contractorId: order.contractorId,
                supplierId: supplier.id,
                rating,
                comment
            });
            onClose();
        } else {
            alert('Please select a star rating.');
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative animate-fade-in-scale">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                <h2 className="text-2xl font-bold text-primary mb-2">{t('reviewModalTitle', { orderNumber: order.orderNumber })}</h2>
                <p className="text-gray-500 mb-6">How was your experience with <strong>{supplier.name}</strong>?</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="flex justify-center items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none"
                                >
                                    <StarIcon
                                        className={`h-10 w-10 cursor-pointer transition-colors ${
                                            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('reviewModalCommentPlaceholder')}
                            className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary"
                            rows={4}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                            disabled={rating === 0}
                        >
                            {t('reviewModalSubmit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReviewModal;
