type Params = Record<string, unknown>;

const scope = (name: string) => ({
  all: [name] as const,
  lists: () => [name, 'list'] as const,
  list: (params: Params = {}) => [name, 'list', params] as const,
  detail: (id: string) => [name, 'detail', id] as const,
});

export const queryKeys = {
  notifications: {
    ...scope('notifications'),
    unread: () => ['notifications', 'unread'] as const,
  },
  emergencyRequests: scope('emergency-requests'),
  trips: {
    ...scope('trips'),
    mine: (params: Params = {}) => ['trips', 'mine', params] as const,
  },
  payments: scope('payments'),
  ambulances: scope('ambulances'),
  hospitals: scope('hospitals'),
  drivers: {
    ...scope('drivers'),
    me: () => ['drivers', 'me'] as const,
  },
  users: {
    ...scope('users'),
    me: () => ['users', 'me'] as const,
  },
  admin: {
    stats: () => ['admin', 'dashboard-stats'] as const,
    auditLogs: (params: Params = {}) => ['admin', 'audit-logs', params] as const,
    tripReport: (params: Params = {}) => ['admin', 'trip-report', params] as const,
  },
};
