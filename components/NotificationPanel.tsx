
import React, { useEffect, useRef } from 'react';
import { useData } from '../hooks/useDataContext';
import { NotificationType } from '../types';
import { 
    BellIcon, ShoppingCartIcon, ChatBubbleLeftRightIcon, 
    TagIcon, ExclamationTriangleIcon, DocumentMagnifyingGlassIcon, 
    CheckIcon, XMarkIcon 
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    switch(type) {
        case NotificationType.NewOrder:
        case NotificationType.OrderStatusUpdate:
            return <ShoppingCartIcon className="h-6 w-6 text-red-600"/>
        case NotificationType.NewMessage:
            return <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500"/>
        case NotificationType.ItemOnSale:
            return <TagIcon className="h-6 w-6 text-amber-500"/>
        case NotificationType.LowStock:
             return <ExclamationTriangleIcon className="h-6 w-6 text-red-500"/>
        case NotificationType.NewStockRequestResponse:
             return <DocumentMagnifyingGlassIcon className="h-6 w-6 text-purple-500"/>
        default:
            return <BellIcon className="h-6 w-6 text-slate-400"/>
    }
}

const NotificationPanel: React.FC<{ companyId: string; onClose: () => void }> = ({ companyId, onClose }) => {
    const { notifications, markNotificationsAsRead } = useData();
    const { showToast } = useToast();
    
    const userNotifications = (notifications || [])
        .filter(n => n.recipientId === companyId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await markNotificationsAsRead();
        showToast("Grid Notifications Read", "success");
    };

    return (
        <div className="absolute right-0 mt-3 w-96 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] py-6 z-[150] animate-fade-in-scale backdrop-blur-3xl overflow-hidden flex flex-col max-h-[500px]">
            <div className="absolute inset-0 bg-carbon opacity-5"></div>
            
            <div className="px-6 mb-4 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Registry <span className="text-red-600">Events</span></h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_red]">
                            {unreadCount} NEW
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-emerald-500 transition-all border border-white/5"
                            title="Clear All"
                        >
                            <CheckIcon className="h-4 w-4"/>
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="p-2 bg-white/5 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                    >
                        <XMarkIcon className="h-4 w-4"/>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                {userNotifications.length > 0 ? (
                    <div className="space-y-1 px-3">
                        {userNotifications.map(notification => (
                            <div 
                                key={notification.id} 
                                className={`p-4 rounded-[1.5rem] flex items-start gap-4 transition-all group relative ${!notification.isRead ? 'bg-white/5 border border-white/5' : 'opacity-40 hover:opacity-100 hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className={`flex-shrink-0 mt-1 p-2 rounded-xl ${!notification.isRead ? 'bg-black/20 shadow-inner' : ''}`}>
                                    <NotificationIcon type={notification.type} />
                                </div>
                                <div className="flex-grow text-left">
                                    <p className={`text-xs leading-relaxed ${!notification.isRead ? 'font-bold text-white italic' : 'text-slate-400 font-medium'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-[9px] font-black text-slate-600 uppercase mt-2 tracking-widest">
                                        {new Date(notification.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_red]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center text-slate-700">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <BellIcon className="h-8 w-8 opacity-20"/>
                        </div>
                        <p className="font-black uppercase tracking-[0.4em] text-[10px]">Grid State Nominal</p>
                        <p className="text-[9px] mt-2 font-bold opacity-30">NO PENDING EVENTS</p>
                    </div>
                )}
            </div>
            
            <div className="px-6 pt-4 border-t border-white/5 mt-auto relative z-10">
                 <button 
                    onClick={onClose}
                    className="w-full py-3 text-[10px] font-black uppercase text-slate-500 hover:text-white tracking-[0.5em] transition-colors"
                 >
                    Deactivate Overlay
                 </button>
            </div>
        </div>
    )
}

export default NotificationPanel;
