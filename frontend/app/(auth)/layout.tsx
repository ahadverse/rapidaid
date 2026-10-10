import Link from 'next/link';
import { Siren } from 'lucide-react';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12"
    >
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Siren className="size-5" aria-hidden="true" />
        </span>
        RapidAid
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
