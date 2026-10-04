'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
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
import { queryKeys } from '@/lib/query/keys';

export function NotificationBell() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: getUnreadNotificationsAction,
    meta: { silent: true },
  });

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
                event.preventDefault();
                markRead.mutate(item.id);
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
