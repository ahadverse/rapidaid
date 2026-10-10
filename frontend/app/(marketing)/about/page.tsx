import type { Metadata } from 'next';
import { HeartPulse, Scale, ShieldCheck, Timer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const title = 'About';
const description =
  'RapidAid exists to put the right ambulance on the road faster, with critical patients served first.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title: `${title} | RapidAid`, description, url: '/about' },
};

const values: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Timer,
    title: 'Speed first',
    text: 'Every second between a call and a dispatch counts, so assignment is automatic and never waits on a phone queue.',
  },
  {
    icon: Scale,
    title: 'Priority over order',
    text: 'A critical case is served before a routine transfer, no matter who asked first.',
  },
  {
    icon: ShieldCheck,
    title: 'Accountable trips',
    text: 'Every status change, fare and payment is recorded so patients, drivers and hospitals can trust the record.',
  },
  {
    icon: HeartPulse,
    title: 'Care on board',
    text: 'Vehicles are matched to the patient, from basic transport to fully equipped ICU units.',
  },
];

export default function AboutPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-4 py-12 sm:px-6"
    >
      <PageHeader title="About RapidAid" description={description} />
      <section className="max-w-3xl space-y-4 text-muted-foreground">
        <p>
          In an emergency, families often spend the first critical minutes calling around for an
          ambulance that may not be free, may not be close and may not carry the equipment the
          patient needs. RapidAid replaces that search with a single request.
        </p>
        <p>
          The platform keeps a live picture of every ambulance, driver and hospital. When a request
          arrives it is ranked by priority, matched to the nearest suitable vehicle and handed to a
          driver, who then reports each stage of the trip until the patient reaches the hospital.
        </p>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">What we stand for</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map(({ icon: Icon, title: valueTitle, text }) => (
            <Card key={valueTitle}>
              <CardHeader className="gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle>{valueTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{text}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
