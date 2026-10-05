import type { Metadata } from 'next';
import { AvailabilityToggle } from '@/components/driver/availability-toggle';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'Driver profile' };

export default function DriverProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Control your availability and manage your account details."
      />
      <AvailabilityToggle />
      <ProfileSettings />
    </div>
  );
}
