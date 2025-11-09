
import React, { useEffect, useState } from 'react';
import type { Notification } from '../types';

interface NotificationItemProps {
    notification: Notification;
    onDismiss: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    const iconClass = notification.type === 'success' ? 'fa-check-circle text-green-500' : 'fa-info-circle text-blue-500';
    const borderClass = notification.type === 'success' ? 'border-green-500' : 'border-blue-500';

    return (
        <div
            className={`flex items-start p-4 rounded-lg shadow-lg bg-slate-800 border-l-4 ${borderClass} transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <i className={`fas ${iconClass} text-xl mr-4 mt-1`}></i>
            <div className="flex-1">
                <p className="font-bold text-slate-100">{notification.title}</p>
                <p className="text-sm text-slate-300">{notification.message}</p>
            </div>
            <button onClick={handleDismiss} className="ml-4 text-slate-400 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};