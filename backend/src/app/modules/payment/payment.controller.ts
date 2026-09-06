import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';

const init = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.init(authUser(req), req.params.tripId);

  sendResponse(res, {
    statusCode: 200,
    message: 'Payment session created successfully',
    data: result,
  });
});

export const PaymentController = { init };
