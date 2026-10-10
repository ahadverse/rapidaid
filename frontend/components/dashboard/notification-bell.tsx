'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  getUnreadNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/lib/api/types';
import { playChime, unlockChime } from '@/lib/chime';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const POLL_INTERVAL_MS = 10_000;

const PAYMENT_PAGES: Record<Role, string> = {
  PATIENT: '/dashboard/payments',
  DRIVER: '/driver/earnings',
  ADMIN: '/admin/transactions',
};

export function NotificationBell() {
  const router = useRouter();
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const seen = useRef<Set<string> | null>(null);

  const { data } = useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: getUnreadNotificationsAction,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    meta: { silent: true },
  });

  useEffect(() => {
    window.addEventListener('pointerdown', unlockChime, { once: true });
    window.addEventListener('keydown', unlockChime, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockChime);
      window.removeEventListener('keydown', unlockChime);
    };
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (seen.current === null) {
      seen.current = new Set(data.items.map((item) => item.id));
      return;
    }

    const known = seen.current;
    const fresh = data.items.filter((item) => !known.has(item.id));

    if (fresh.length === 0) {
      return;
    }

    fresh.forEach((item) => known.add(item.id));
    playChime();

    if (fresh.length === 1) {
      toast(fresh[0].title, { description: fresh[0].message });
    } else {
      toast(`${fresh.length} new notifications`);
    }
  }, [data]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

  const markRead = useMutation({
    mutationFn: markNotificationReadAction,
    onSuccess: refresh,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsReadAction,
    onSuccess: refresh,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <DropdownMenu onOpenChange={(open) => open && void refresh()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications, ${total} unread`}
        >
          <Bell aria-hidden="true" />
          {total > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
              {total > 99 ? '99+' : total}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          <Button
            variant="ghost"
            size="sm"
            disabled={markAllRead.isPending || total === 0}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck aria-hidden="true" />
            Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You are all caught up
          </p>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex flex-col items-start gap-0.5"
              onSelect={(event) => {
                markRead.mutate(item.id);

                if (item.type === 'PAYMENT' && role) {
                  router.push(PAYMENT_PAGES[role]);
                } else {
                  event.preventDefault();
                }
              }}
            >
              <span className="flex w-full items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{item.title}</span>
                <time
                  dateTime={item.createdAt}
                  title={formatDateTime(item.createdAt)}
                  className="shrink-0 text-[11px] text-muted-foreground"
                >
                  {formatRelativeTime(item.createdAt)}
                </time>
              </span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{item.message}</span>
              {item.type === 'PAYMENT' && role ? (
                <span className="text-xs font-medium text-primary">
                  {role === 'DRIVER' ? 'Go to earnings' : 'Go to payments'}
                </span>
              ) : null}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
