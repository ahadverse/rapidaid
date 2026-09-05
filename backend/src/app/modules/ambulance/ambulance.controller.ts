import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { ambulanceFilterableFields } from './ambulance.constant';
import { TAmbulanceFilters } from './ambulance.interface';
import { AmbulanceService } from './ambulance.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await AmbulanceService.create(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: 'Ambulance created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...ambulanceFilterableFields]) as TAmbulanceFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await AmbulanceService.getAll(filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Ambulances retrieved successfully',
    meta,
    data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await AmbulanceService.getById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Ambulance retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await AmbulanceService.update(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: 'Ambulance updated successfully',
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AmbulanceService.updateStatus(
    req.params.id,
    req.body.status,
    authUser(req),
  );

  sendResponse(res, {
    statusCode: 200,
    message: 'Ambulance status updated successfully',
    data: result,
  });
});

const softDelete = catchAsync(async (req: Request, res: Response) => {
  const result = await AmbulanceService.softDelete(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Ambulance deleted successfully',
    data: result,
  });
});

export const AmbulanceController = { create, getAll, getById, update, updateStatus, softDelete };
