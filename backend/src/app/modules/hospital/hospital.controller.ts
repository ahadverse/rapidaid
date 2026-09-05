import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { hospitalFilterableFields } from './hospital.constant';
import { THospitalFilters } from './hospital.interface';
import { HospitalService } from './hospital.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await HospitalService.create(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: 'Hospital created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...hospitalFilterableFields]) as THospitalFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await HospitalService.getAll(filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Hospitals retrieved successfully',
    meta,
    data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await HospitalService.getById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Hospital retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await HospitalService.update(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: 'Hospital updated successfully',
    data: result,
  });
});

const softDelete = catchAsync(async (req: Request, res: Response) => {
  const result = await HospitalService.softDelete(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Hospital deleted successfully',
    data: result,
  });
});

export const HospitalController = { create, getAll, getById, update, softDelete };
