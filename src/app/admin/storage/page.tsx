import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminStorageClient from './AdminStorageClient';

export default function AdminStoragePage() {
  return (
    <AdminLayout title="Storage Manager" activeTab="storage">
      <AdminStorageClient />
    </AdminLayout>
  );
}
