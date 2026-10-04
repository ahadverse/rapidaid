import Link from 'next/link';
import { Siren } from 'lucide-react';

export function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-lg font-bold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Siren className="size-4" aria-hidden="true" />
      </span>
      RapidAid
    </Link>
  );
}
