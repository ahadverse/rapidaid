import type { Metadata } from 'next';
import { RequestWizard } from '@/components/patient/request-wizard';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'New emergency request' };

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New emergency request"
        description="Three quick steps. An admin dispatches the nearest suitable ambulance once you confirm."
      />
      <RequestWizard />
    </div>
  );
}
