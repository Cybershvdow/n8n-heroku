'use client';

import { useEffect, useState } from 'react';
import { X, Check, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSheet({ isOpen, onClose }: NotificationSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch {
      // Ignore errors
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl sheet-enter max-h-[80vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Mark All <Check className="inline h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'LOAD_CREATED':
        return '📦';
      case 'REPLY_SEND_FAILED':
        return '⚠️';
      case 'EMAIL_INTEGRATION_ERROR':
      case 'EMAIL_DISCONNECTED':
      case 'EMAIL_TOKEN_EXPIRED':
        return '📧';
      case 'TRIP_ENDED':
        return '📍';
      default:
        return '🔔';
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
        !notification.isRead && 'bg-blue-50/50'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{getIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
            <p className="font-medium text-gray-900 truncate">
              {notification.title}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
