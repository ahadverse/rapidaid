import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { tripFilterableFields } from './trip.constant';
import { TTripFilters } from './trip.interface';
import { TripService } from './trip.service';

const paginationFields = ['page', 'limit', 'sortBy', 'sortOrder'];

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...tripFilterableFields]) as TTripFilters;
  const options = pickQuery(req.query, paginationFields);
  const { data, meta } = await TripService.getAll(filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Trips retrieved successfully',
    meta,
    data,
  });
});

const getMyTrips = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...tripFilterableFields]) as TTripFilters;
  const options = pickQuery(req.query, paginationFields);
  const { data, meta } = await TripService.getMyTrips(authUser(req), filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Trips retrieved successfully',
    meta,
    data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await TripService.getById(authUser(req), req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Trip retrieved successfully',
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await TripService.updateStatus(authUser(req), req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: 'Trip status updated successfully',
    data: result,
  });
});

const selectHospital = catchAsync(async (req: Request, res: Response) => {
  const result = await TripService.selectHospital(
    authUser(req),
    req.params.id,
    req.body.hospitalId,
  );

  sendResponse(res, {
    statusCode: 200,
    message: 'Destination hospital selected successfully',
    data: result,
  });
});

export const TripController = { getAll, getMyTrips, getById, updateStatus, selectHospital };
