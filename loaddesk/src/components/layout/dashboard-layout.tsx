'use client';

import { useState } from 'react';
import { TopBar } from './top-bar';
import { BottomNav } from './bottom-nav';
import { NotificationSheet } from '../notifications/notification-sheet';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar onNotificationClick={() => setShowNotifications(true)} />

      <main className="pb-20">
        {children}
      </main>

      <BottomNav />

      <NotificationSheet
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
