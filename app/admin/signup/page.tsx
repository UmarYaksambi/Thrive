import { Suspense } from 'react';
import AdminSignupClient from './AdminSignupClient';

export default function AdminSignupPage() {
  return (
    <Suspense fallback={null}>
      <AdminSignupClient />
    </Suspense>
  );
}
