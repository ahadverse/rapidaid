export type TAuditLogFilters = {
  entity?: string;
  action?: string;
  actorId?: string;
  from?: string;
  to?: string;
};

export type TReportFilters = {
  from?: string;
  to?: string;
};

export type TDailyTripRow = {
  date: string;
  trips: number;
  revenue: number;
};
