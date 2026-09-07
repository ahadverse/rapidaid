import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { notificationFilterableFields } from './notification.constant';
import { TNotificationFilters } from './notification.interface';
import { NotificationService } from './notification.service';

const getMine = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...notificationFilterableFields]) as TNotificationFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await NotificationService.getMine(authUser(req).userId, filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Notifications retrieved successfully',
    meta,
    data,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markAsRead(authUser(req).userId, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markAllAsRead(authUser(req).userId);

  sendResponse(res, {
    statusCode: 200,
    message: 'All notifications marked as read',
    data: result,
  });
});

export const NotificationController = { getMine, markAsRead, markAllAsRead };
