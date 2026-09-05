'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { UnreadNotificationsProvider } from '@/providers/UnreadNotificationsProvider';
import { ToastContainer } from '@/components/ui/Toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UnreadNotificationsProvider>
        <ToastContainer>
          {children}
        </ToastContainer>
      </UnreadNotificationsProvider>
    </AuthProvider>
  );
}
