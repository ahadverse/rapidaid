import type { Metadata } from 'next';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'Profile' };

export default function PatientProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your details and sign-in password." />
      <ProfileSettings />
    </div>
  );
}
