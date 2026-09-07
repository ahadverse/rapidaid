import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { auditLogFilterableFields, reportFilterableFields } from './admin.constant';
import { TAuditLogFilters, TReportFilters } from './admin.interface';
import { AdminService } from './admin.service';

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();

  sendResponse(res, {
    statusCode: 200,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...auditLogFilterableFields]) as TAuditLogFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await AdminService.getAuditLogs(filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Audit logs retrieved successfully',
    meta,
    data,
  });
});

const getTripReport = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...reportFilterableFields]) as TReportFilters;
  const result = await AdminService.getTripReport(filters);

  sendResponse(res, {
    statusCode: 200,
    message: 'Trip report generated successfully',
    data: result,
  });
});

export const AdminController = { getDashboardStats, getAuditLogs, getTripReport };
