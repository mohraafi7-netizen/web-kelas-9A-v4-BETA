'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { ToastContainer } from '@/components/ui/Toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastContainer>
        {children}
      </ToastContainer>
    </AuthProvider>
  );
}
