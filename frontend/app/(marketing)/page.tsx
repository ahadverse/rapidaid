import Image from 'next/image';
import Link from 'next/link';
import {
  Ambulance,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ClipboardList,
  MapPin,
  Siren,
  Snowflake,
  Stethoscope,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = { icon: LucideIcon; title: string; text: string };
type AmbulanceKind = { icon: LucideIcon; type: string; text: string; features: string[] };

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
    text: 'Standard patient transport for non-critical transfers.',
    features: ['First-aid equipment', 'Stretcher and oxygen', 'Routine hospital transfers'],
  },
  {
    icon: Wind,
    type: 'AC',
    text: 'Climate-controlled cabin for comfort on longer journeys.',
    features: ['Air-conditioned cabin', 'Suited to long distances', 'Heat-sensitive patients'],
  },
  {
    icon: ClipboardList,
    type: 'ICU',
    text: 'Intensive care on wheels for critically ill patients.',
    features: ['Ventilator on board', 'Cardiac monitor', 'Trained medical staff'],
  },
  {
    icon: Snowflake,
    type: 'FREEZER',
    text: 'Refrigerated transport handled with dignity and care.',
    features: ['Refrigerated compartment', 'Respectful handling', 'Inter-city transfers'],
  },
];

const stats = [
  { value: '24/7', label: 'Dispatch desk' },
  { value: '4', label: 'Ambulance types' },
  { value: '4', label: 'Priority levels' },
  { value: '10+', label: 'Areas covered' },
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
    <main className="flex flex-1 flex-col overflow-x-clip">
      <section className="relative isolate border-b">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(0.92_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0_0)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 -z-10 size-96 animate-float rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-0 -z-10 size-96 animate-float-delayed rounded-full bg-orange-400/20 blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:py-24 lg:grid-cols-2">
          <div className="space-y-7">
            <div className="inline-flex animate-fade-up items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-primary" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              Dispatch desk live, 24 hours a day
            </div>
            <h1
              className="animate-fade-up text-4xl font-extrabold tracking-tight text-balance sm:text-6xl"
              style={{ animationDelay: '100ms' }}
            >
              The right ambulance, dispatched in the{' '}
              <span className="animate-gradient bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_auto] bg-clip-text text-transparent">
                time that matters.
              </span>
            </h1>
            <p
              className="max-w-xl animate-fade-up text-lg text-muted-foreground"
              style={{ animationDelay: '200ms' }}
            >
              RapidAid connects patients, drivers and hospitals through priority-based dispatch.
              From the first emergency call to arrival at the hospital door, every critical case is
              served first and every trip is tracked.
            </p>
            <div
              className="flex animate-fade-up flex-col gap-3 sm:flex-row"
              style={{ animationDelay: '300ms' }}
            >
              <Button size="lg" className="h-12 px-6 text-base" asChild>
                <Link href="/register">
                  Request an ambulance
                  <ArrowRight
                    className="transition-transform group-hover/button:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: '250ms' }}>
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/25 to-orange-300/25 blur-2xl" />
            <Image
              src="/hero-ambulance.svg"
              alt="An ambulance driving toward a hospital"
              width={640}
              height={440}
              priority
              className="h-auto w-full rounded-3xl border bg-background shadow-2xl"
            />
            <div className="absolute -top-4 left-2 flex animate-float items-center gap-2 rounded-xl border bg-background/95 px-3 py-2 text-sm font-medium shadow-lg backdrop-blur sm:-left-6">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Siren className="size-4" aria-hidden="true" />
              </span>
              Priority: CRITICAL
            </div>
            <div className="absolute right-2 -bottom-5 flex animate-float-delayed items-center gap-2 rounded-xl border bg-background/95 px-3 py-2 text-sm font-medium shadow-lg backdrop-blur sm:-right-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <BadgeCheck className="size-4" aria-hidden="true" />
              </span>
              Ambulance assigned
            </div>
          </div>
        </div>
        <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden border-t bg-border sm:px-0 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-background/90 px-6 py-6 text-center backdrop-blur">
              <dt className="text-3xl font-extrabold tracking-tight text-primary">{value}</dt>
              <dd className="text-sm text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="reveal mx-auto mb-14 max-w-2xl space-y-3 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From emergency to hospital in four steps
          </h2>
          <p className="text-muted-foreground">
            Four steps from the moment help is needed to the moment the patient is safe.
          </p>
        </div>
        <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute top-8 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
          />
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="reveal relative">
              <div className="group h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <span className="text-5xl font-black text-muted/80 transition-colors group-hover:text-primary/20">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="reveal mx-auto mb-14 max-w-2xl space-y-3 text-center">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">Fleet</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ambulances for every situation
            </h2>
            <p className="text-muted-foreground">
              Every request is matched to a vehicle equipped for the patient&apos;s condition.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ambulanceKinds.map(({ icon: Icon, type, text, features }) => (
              <article
                key={type}
                className="reveal flex flex-col rounded-xl border bg-card p-6 shadow-xs transition-colors hover:border-primary/40"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{type}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
                <ul className="mt-5 space-y-2 border-t pt-5 text-sm">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="reveal mx-auto mb-10 max-w-2xl space-y-3 px-4 text-center sm:px-6">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">Coverage</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Across Dhaka</h2>
          <p className="text-muted-foreground">
            Ambulances are stationed across the city so the nearest one is never far away.
          </p>
        </div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <ul className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
            {[...coverageAreas, ...coverageAreas].map((area, index) => (
              <li
                key={`${area}-${index}`}
                aria-hidden={index >= coverageAreas.length}
                className="flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-sm font-medium shadow-sm"
              >
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 md:pb-24">
        <div className="reveal relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-neutral-950 px-6 py-14 text-white sm:px-12">
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 size-72 animate-float rounded-full bg-primary/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-12 size-72 animate-float-delayed rounded-full bg-orange-500/25 blur-3xl"
          />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Drive for RapidAid or request help
              </h2>
              <p className="max-w-xl text-neutral-300">
                Create an account as a patient to request an ambulance, or register as a driver to
                start receiving dispatches.
              </p>
            </div>
            <Button size="lg" variant="secondary" className="h-12 px-6 text-base" asChild>
              <Link href="/register">
                Create an account
                <ArrowRight
                  className="transition-transform group-hover/button:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
