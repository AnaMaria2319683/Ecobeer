
import React from 'react';
import type { Notification } from '../types';
import { NotificationItem } from './NotificationItem';

interface NotificationContainerProps {
    notifications: Notification[];
    removeNotification: (id: number) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, removeNotification }) => {
    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
};