import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router = Router();

router.post(
  '/init/:tripId',
  auth(Role.PATIENT),
  validateRequest(PaymentValidation.init),
  PaymentController.init,
);

export const PaymentRoutes = router;
