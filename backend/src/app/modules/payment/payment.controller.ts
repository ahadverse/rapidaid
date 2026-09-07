import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { paymentFilterableFields } from './payment.constant';
import { TPaymentFilters } from './payment.interface';
import { PaymentService } from './payment.service';

const init = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.init(authUser(req), req.params.tripId);

  sendResponse(res, {
    statusCode: 200,
    message: 'Payment session created successfully',
    data: result,
  });
});

const success = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.success(req.body);

  sendResponse(res, {
    statusCode: 200,
    message: result.alreadySettled
      ? 'This payment was already confirmed'
      : 'Payment confirmed successfully',
    data: result.payment,
  });
});

const fail = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.fail(req.body);

  sendResponse(res, {
    statusCode: 200,
    message: result.alreadySettled ? 'This payment was already confirmed' : 'Payment failed',
    data: result.payment,
  });
});

const cancel = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.cancel(req.body);

  sendResponse(res, {
    statusCode: 200,
    message: result.alreadySettled
      ? 'This payment was already confirmed'
      : 'Payment cancelled by the patient',
    data: result.payment,
  });
});

const ipn = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.ipn(req.body);

  sendResponse(res, {
    statusCode: 200,
    message: result.alreadySettled ? 'This payment was already confirmed' : 'IPN processed',
    data: result.payment,
  });
});

const getMine = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...paymentFilterableFields]) as TPaymentFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await PaymentService.getMine(authUser(req), filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Payments retrieved successfully',
    meta,
    data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getById(authUser(req), req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

export const PaymentController = { init, success, fail, cancel, ipn, getMine, getById };
