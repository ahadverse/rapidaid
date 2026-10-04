'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  getUnreadNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type UnreadNotifications,
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

const empty: UnreadNotifications = { items: [], total: 0 };

export function NotificationBell() {
  const [unread, setUnread] = useState<UnreadNotifications>(empty);
  const [pending, startTransition] = useTransition();

  const load = useCallback(
    () =>
      getUnreadNotificationsAction()
        .then(setUnread)
        .catch(() => setUnread(empty)),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = (id: string) => {
    startTransition(async () => {
      try {
        await markNotificationReadAction(id);
        await load();
      } catch {
        toast.error('Could not mark the notification as read');
      }
    });
  };

  const markAllRead = () => {
    startTransition(async () => {
      try {
        await markAllNotificationsReadAction();
        await load();
      } catch {
        toast.error('Could not mark notifications as read');
      }
    });
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && void load()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications, ${unread.total} unread`}
        >
          <Bell aria-hidden="true" />
          {unread.total > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
              {unread.total > 99 ? '99+' : unread.total}
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
            disabled={pending || unread.total === 0}
            onClick={markAllRead}
          >
            <CheckCheck aria-hidden="true" />
            Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {unread.items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You are all caught up
          </p>
        ) : (
          unread.items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex flex-col items-start gap-0.5"
              onSelect={(event) => {
                event.preventDefault();
                markRead(item.id);
              }}
            >
              <span className="text-sm font-medium">{item.title}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{item.message}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
