import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { emergencyRequestFilterableFields } from './emergencyRequest.constant';
import { TEmergencyRequestFilters } from './emergencyRequest.interface';
import { EmergencyRequestService } from './emergencyRequest.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await EmergencyRequestService.create(authUser(req).userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: 'Emergency request created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [
    ...emergencyRequestFilterableFields,
  ]) as TEmergencyRequestFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await EmergencyRequestService.getAll(authUser(req), filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Emergency requests retrieved successfully',
    meta,
    data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await EmergencyRequestService.getById(authUser(req), req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Emergency request retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await EmergencyRequestService.update(authUser(req), req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: 'Emergency request updated successfully',
    data: result,
  });
});

const cancel = catchAsync(async (req: Request, res: Response) => {
  const result = await EmergencyRequestService.cancel(
    authUser(req),
    req.params.id,
    req.body.cancelReason,
  );

  sendResponse(res, {
    statusCode: 200,
    message: 'Emergency request cancelled successfully',
    data: result,
  });
});

export const EmergencyRequestController = { create, getAll, getById, update, cancel };
