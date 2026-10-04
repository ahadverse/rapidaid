import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { getTripAction } from '@/app/actions/trips';
import { TripDetail } from '@/components/trips/trip-detail';

export const metadata: Metadata = { title: 'Trip details' };

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const result = await getTripAction(id);

  if (!result.ok) {
    if (result.status === 403 || result.status === 404) {
      notFound();
    }

    throw new Error(result.error);
  }

  return <TripDetail initialTrip={result.data} />;
}
