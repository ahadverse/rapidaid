import Link from 'next/link';
import { Siren } from 'lucide-react';
import { publicNavLinks } from '@/lib/navigation';

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Siren className="size-4" aria-hidden="true" />
            </span>
            RapidAid
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            Priority-based ambulance dispatch, from emergency call to hospital arrival.
          </p>
        </div>
        <nav aria-label="Footer" className="space-y-3">
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {publicNavLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Account</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="transition-colors hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-foreground">
                Create an account
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          &copy; {new Date().getFullYear()} RapidAid. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
