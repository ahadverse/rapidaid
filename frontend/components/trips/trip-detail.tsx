'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Ambulance,
  ArrowLeft,
  Hospital,
  MapPin,
  Phone,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import { getTripAction } from '@/app/actions/trips';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { unwrap } from '@/lib/api/action-result';
import type { Trip, TripStatus } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';
import { roleHome } from '@/lib/navigation';
import { queryKeys } from '@/lib/query/keys';
import { TripTimeline } from './trip-timeline';

const POLL_INTERVAL_MS = 10_000;
const FINAL_STATUSES: TripStatus[] = ['COMPLETED', 'CANCELLED'];

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

function Contact({ name, phone }: { name: string; phone: string | null }) {
  return (
    <>
      <span className="block">{name}</span>
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-1 text-sm font-normal text-primary hover:underline"
        >
          <Phone className="size-3.5" aria-hidden="true" />
          {phone}
        </a>
      ) : null}
    </>
  );
}

function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function TripDetail({ initialTrip }: { initialTrip: Trip }) {
  const { role } = useAuth();

  const { data: trip } = useQuery({
    queryKey: queryKeys.trips.detail(initialTrip.id),
    queryFn: async () => unwrap(await getTripAction(initialTrip.id)).data,
    initialData: initialTrip,
    refetchInterval: (query) =>
      query.state.data && FINAL_STATUSES.includes(query.state.data.status)
        ? false
        : POLL_INTERVAL_MS,
  });

  const isLive = !FINAL_STATUSES.includes(trip.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip details"
        description={`${trip.ambulance.regNumber} · dispatched ${formatDateTime(trip.dispatchedAt)}`}
        actions={
          <>
            <StatusBadge value={trip.status} />
            <Button variant="outline" size="sm" asChild>
              <Link href={role ? roleHome[role] : '/'}>
                <ArrowLeft aria-hidden="true" />
                Back
              </Link>
            </Button>
          </>
        }
      />
      {isLive ? (
        <p className="text-sm text-muted-foreground">
          Live tracking: this page refreshes every {POLL_INTERVAL_MS / 1000} seconds.
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <TripTimeline trip={trip} />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <DetailCard icon={MapPin} title="Pickup">
            <dl className="space-y-3">
              <Detail label="Address">{trip.request.pickupAddress}</Detail>
              <Detail label="Condition">{trip.request.patientCondition}</Detail>
              <Detail label="Priority">
                <StatusBadge value={trip.request.priority} />
              </Detail>
              {role === 'PATIENT' ? null : (
                <Detail label="Patient">
                  <Contact name={trip.request.patient.name} phone={trip.request.patient.phone} />
                </Detail>
              )}
            </dl>
          </DetailCard>
          <DetailCard icon={Ambulance} title="Ambulance">
            <dl className="space-y-3">
              <Detail label="Vehicle">
                <span className="flex flex-wrap items-center gap-2">
                  {trip.ambulance.regNumber}
                  <StatusBadge value={trip.ambulance.type} />
                </span>
              </Detail>
              <Detail label="Station">{trip.ambulance.stationArea}</Detail>
              {role === 'DRIVER' ? null : (
                <Detail label="Driver">
                  <Contact name={trip.driver.user.name} phone={trip.driver.user.phone} />
                </Detail>
              )}
            </dl>
          </DetailCard>
          <DetailCard icon={Hospital} title="Destination">
            {trip.hospital ? (
              <dl className="space-y-3">
                <Detail label="Hospital">
                  <Contact name={trip.hospital.name} phone={trip.hospital.phone} />
                </Detail>
                <Detail label="Area">{trip.hospital.area}</Detail>
              </dl>
            ) : (
              <p className="text-muted-foreground">
                The driver selects the destination hospital before heading there.
              </p>
            )}
          </DetailCard>
          <DetailCard icon={Receipt} title="Fare">
            {trip.fare !== null && trip.distanceKm !== null ? (
              <dl className="space-y-3">
                <Detail label="Distance">{Number(trip.distanceKm)} km</Detail>
                <Detail label="Fare">{formatMoney(trip.fare)}</Detail>
              </dl>
            ) : (
              <p className="text-muted-foreground">
                {trip.status === 'CANCELLED'
                  ? 'No fare is charged for a cancelled trip.'
                  : 'Calculated from the distance travelled once the trip is completed.'}
              </p>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
