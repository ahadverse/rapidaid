'use server';

import { api } from '@/lib/api/client';
import type { Notification } from '@/lib/api/types';
import { getAccessToken } from '@/lib/auth/session';

export type UnreadNotifications = {
  items: Notification[];
  total: number;
};

async function requireToken(): Promise<string> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Session expired');
  }

  return token;
}

export async function getUnreadNotificationsAction(): Promise<UnreadNotifications> {
  const token = await requireToken();
  const { data, meta } = await api<Notification[]>('/notifications', {
    token,
    query: { isRead: false, limit: 8, sortOrder: 'desc' },
    cache: 'no-store',
  });

  return { items: data, total: meta?.total ?? data.length };
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const token = await requireToken();

  await api(`/notifications/${id}/read`, { method: 'PATCH', token, cache: 'no-store' });
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const token = await requireToken();

  await api('/notifications/read-all', { method: 'PATCH', token, cache: 'no-store' });
}
