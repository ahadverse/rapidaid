import { CardSkeleton } from '@/components/shared/card-skeleton';

export default function PaymentLoading() {
  return (
    <div className="mx-auto max-w-lg">
      <CardSkeleton lines={4} />
    </div>
  );
}
