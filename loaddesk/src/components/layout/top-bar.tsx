'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onNotificationClick?: () => void;
}

export function TopBar({ onNotificationClick }: TopBarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread count
    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch {
        // Ignore errors
      }
    }

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          <span className="text-xl font-bold text-primary-600">LoadDesk</span>
        </div>

        <button
          onClick={onNotificationClick}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full touch-target"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute top-1 right-1 flex items-center justify-center',
                'min-w-[18px] h-[18px] px-1 text-xs font-bold',
                'bg-red-500 text-white rounded-full'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
