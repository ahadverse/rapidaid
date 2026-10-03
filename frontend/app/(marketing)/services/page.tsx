import type { Metadata } from 'next';
import Link from 'next/link';
import { Bell, CreditCard, MapPinned, Siren, Truck, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const title = 'Services';
const description =
  'Emergency dispatch, live trip tracking and online payment for patients, drivers and hospitals.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title: `${title} | RapidAid`, description, url: '/services' },
};

const services: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Siren,
    title: 'Emergency dispatch',
    text: 'Request an ambulance with a priority level and have the nearest suitable vehicle assigned automatically.',
  },
  {
    icon: MapPinned,
    title: 'Live trip tracking',
    text: 'Follow a trip from dispatch through pickup and transport to arrival at the hospital.',
  },
  {
    icon: Truck,
    title: 'Ambulance fleet',
    text: 'BASIC, AC, ICU and FREEZER vehicles, each with its own availability and maintenance status.',
  },
  {
    icon: UserCog,
    title: 'Driver tools',
    text: 'Drivers set their availability, accept dispatches and update the trip as it progresses.',
  },
  {
    icon: CreditCard,
    title: 'Online payment',
    text: 'Fares are calculated from distance and paid securely online after the trip completes.',
  },
  {
    icon: Bell,
    title: 'Instant notifications',
    text: 'Patients and drivers are notified the moment a dispatch, status change or payment happens.',
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-12 sm:px-6">
      <PageHeader
        title="Our services"
        description={description}
        actions={
          <Button asChild>
            <Link href="/contact">Talk to us</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title: serviceTitle, text }) => (
          <Card key={serviceTitle} className="h-full">
            <CardHeader className="gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>{serviceTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{text}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
