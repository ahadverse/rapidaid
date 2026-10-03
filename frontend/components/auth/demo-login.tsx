'use client';

import { useState } from 'react';
import { ShieldCheck, Truck, User, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { demoLoginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { FieldSeparator } from '@/components/ui/field';
import type { Role } from '@/lib/api/types';

const demoRoles: { role: Role; label: string; description: string; icon: LucideIcon }[] = [
  {
    role: 'ADMIN',
    label: 'Admin',
    description: 'Dispatch and manage the platform',
    icon: ShieldCheck,
  },
  { role: 'PATIENT', label: 'Patient', description: 'Request and track ambulances', icon: User },
  { role: 'DRIVER', label: 'Driver', description: 'Accept and complete trips', icon: Truck },
];

export function DemoLogin() {
  const [pending, setPending] = useState<Role | null>(null);

  async function signInAs(role: Role) {
    setPending(role);

    const result = await demoLoginAction(role);

    toast.error(result.error ?? 'Demo sign in failed');
    setPending(null);
  }

  return (
    <div className="space-y-4">
      <FieldSeparator>Try a demo account</FieldSeparator>
      <div className="grid gap-2">
        {demoRoles.map(({ role, label, description, icon: Icon }) => (
          <Button
            key={role}
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 px-3 py-2.5 text-left"
            disabled={pending !== null}
            onClick={() => signInAs(role)}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium">
                {pending === role ? 'Signing in...' : `Continue as ${label}`}
              </span>
              <span className="text-xs font-normal text-muted-foreground">{description}</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
