'use client';

import { useQuery } from '@tanstack/react-query';
import { listMyPaymentsAction } from '@/app/actions/payments';
import { listMyTripsAction } from '@/app/actions/trips';
import { unwrap } from '@/lib/api/action-result';
import { queryKeys } from '@/lib/query/keys';

const SCAN_LIMIT = 100;

export function useUnpaidTrips(enabled = true) {
  return useQuery({
    queryKey: queryKeys.trips.mine({ status: 'COMPLETED', unpaid: true }),
    queryFn: async () => {
      const [trips, paid] = await Promise.all([
        listMyTripsAction({ status: 'COMPLETED', limit: SCAN_LIMIT }),
        listMyPaymentsAction({ status: 'PAID', page: 1, limit: SCAN_LIMIT }),
      ]);
      const paidTripIds = new Set(unwrap(paid).data.map((payment) => payment.trip.id));

      return unwrap(trips).data.filter((trip) => trip.fare !== null && !paidTripIds.has(trip.id));
    },
    meta: { silent: true },
    enabled,
  });
}
