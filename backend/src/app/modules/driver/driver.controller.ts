import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { driverFilterableFields } from './driver.constant';
import { TDriverFilters } from './driver.interface';
import { DriverService } from './driver.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverService.create(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: 'Driver created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...driverFilterableFields]) as TDriverFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await DriverService.getAll(filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Drivers retrieved successfully',
    meta,
    data,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverService.getMyProfile(authUser(req).userId);

  sendResponse(res, {
    statusCode: 200,
    message: 'Driver profile retrieved successfully',
    data: result,
  });
});

const updateMyAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverService.updateMyAvailability(
    authUser(req).userId,
    req.body.isAvailable,
  );

  sendResponse(res, {
    statusCode: 200,
    message: 'Availability updated successfully',
    data: result,
  });
});

export const DriverController = { create, getAll, getMyProfile, updateMyAvailability };
