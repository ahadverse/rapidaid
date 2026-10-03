import Image from 'next/image';
import Link from 'next/link';
import {
  Ambulance,
  ArrowRight,
  Building2,
  ClipboardList,
  MapPin,
  Siren,
  Snowflake,
  Stethoscope,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Step = { icon: LucideIcon; title: string; text: string };
type AmbulanceKind = { icon: LucideIcon; type: string; text: string };

const steps: Step[] = [
  {
    icon: Siren,
    title: 'Raise an emergency request',
    text: 'Enter the pickup location, patient condition and a priority from low to critical. It takes under a minute.',
  },
  {
    icon: Ambulance,
    title: 'Nearest ambulance is dispatched',
    text: 'The platform assigns the closest available ambulance of the right type, with critical cases served first.',
  },
  {
    icon: MapPin,
    title: 'Track the trip live',
    text: 'Follow the driver from pickup to hospital through every status change, with updates sent as they happen.',
  },
  {
    icon: Building2,
    title: 'Arrive and settle the fare',
    text: 'The fare is calculated from the distance travelled and paid securely online once the trip is complete.',
  },
];

const ambulanceKinds: AmbulanceKind[] = [
  {
    icon: Stethoscope,
    type: 'BASIC',
    text: 'Standard patient transport with first-aid equipment for non-critical transfers.',
  },
  {
    icon: Wind,
    type: 'AC',
    text: 'Air-conditioned cabin for comfortable long-distance transfers and patients sensitive to heat.',
  },
  {
    icon: ClipboardList,
    type: 'ICU',
    text: 'Ventilator, cardiac monitor and trained staff on board for patients needing intensive care.',
  },
  {
    icon: Snowflake,
    type: 'FREEZER',
    text: 'Refrigerated compartment for the dignified transport of the deceased.',
  },
];

const coverageAreas = [
  'Dhanmondi',
  'Gulshan',
  'Banani',
  'Uttara',
  'Mirpur',
  'Mohakhali',
  'Motijheel',
  'Old Dhaka',
  'Bashundhara',
  'Mohammadpur',
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b bg-gradient-to-b from-red-50 to-background">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge variant="secondary" className="gap-1.5">
              <Siren className="size-3.5" aria-hidden="true" />
              Emergency response platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              The right ambulance, dispatched in the time that matters.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              RapidAid connects patients, drivers and hospitals through priority-based dispatch.
              From the first emergency call to arrival at the hospital door, every critical case is
              served first and every trip is tracked.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Request an ambulance
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
          <Image
            src="/hero-ambulance.svg"
            alt="An ambulance driving toward a hospital"
            width={640}
            height={400}
            priority
            className="h-auto w-full rounded-3xl"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">How dispatch works</h2>
          <p className="text-muted-foreground">
            Four steps from the moment help is needed to the moment the patient is safe.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <Card className="h-full">
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{text}</CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-20">
          <div className="mb-10 max-w-2xl space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Ambulances for every situation</h2>
            <p className="text-muted-foreground">
              Every request is matched to a vehicle equipped for the patient&apos;s condition.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ambulanceKinds.map(({ icon: Icon, type, text }) => (
              <Card key={type} className="h-full">
                <CardHeader className="gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{type}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{text}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <div className="mb-8 max-w-2xl space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Coverage areas</h2>
          <p className="text-muted-foreground">
            Ambulances are stationed across Dhaka so the nearest one is never far away.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {coverageAreas.map((area) => (
            <li key={area}>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                <MapPin className="size-3.5" aria-hidden="true" />
                {area}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Drive for RapidAid or request help
            </h2>
            <p className="max-w-xl text-primary-foreground/80">
              Create an account as a patient to request an ambulance, or register as a driver to
              start receiving dispatches.
            </p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Create an account</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
