import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-medium">{title}</h3>
        {message ? <p className="max-w-sm text-sm text-muted-foreground">{message}</p> : null}
      </div>
      {action}
    </div>
  );
}
