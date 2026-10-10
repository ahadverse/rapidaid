'use client';

import { useState } from 'react';
import { Ambulance, Rocket, ShieldCheck, User, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { demoLoginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import type { Role } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const demoRoles: { role: Role; label: string; description: string; icon: LucideIcon }[] = [
  { role: 'ADMIN', label: 'Admin', description: 'Dispatch desk', icon: ShieldCheck },
  { role: 'PATIENT', label: 'User', description: 'Patient', icon: User },
  { role: 'DRIVER', label: 'Provider', description: 'Ambulance driver', icon: Ambulance },
];

export function DemoLogin() {
  const [pending, setPending] = useState<Role | null>(null);

  async function signInAs(role: Role) {
    setPending(role);

    const result = await demoLoginAction(role);

    toast.error(result.error ?? 'Demo login failed');
    setPending(null);
  }

  return (
    <section aria-labelledby="demo-login-heading" className="space-y-4">
      <h2
        id="demo-login-heading"
        className="flex items-center justify-center gap-2 text-sm font-semibold"
      >
        <Rocket className="size-4 text-primary" aria-hidden="true" />
        Quick Demo Login
      </h2>
      <ul className="grid grid-cols-2 gap-3">
        {demoRoles.map(({ role, label, description, icon: Icon }, index) => (
          <li
            key={role}
            className={cn(
              'flex flex-col items-center gap-3 rounded-xl border bg-background p-4 text-center',
              index === demoRoles.length - 1 &&
                'col-span-2 mx-auto w-full max-w-[calc(50%-0.375rem)]',
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </span>
            <Button
              type="button"
              size="sm"
              className="w-full"
              aria-label={`Demo login as ${label}`}
              disabled={pending !== null}
              onClick={() => signInAs(role)}
            >
              {pending === role ? 'Logging in...' : 'Demo Login'}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
