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

router.get('/me', auth(), validateRequest(PaymentValidation.list), PaymentController.getMine);

router.post('/success', validateRequest(PaymentValidation.callback), PaymentController.success);
router.post('/fail', validateRequest(PaymentValidation.callback), PaymentController.fail);
router.post('/cancel', validateRequest(PaymentValidation.callback), PaymentController.cancel);
router.post('/ipn', validateRequest(PaymentValidation.callback), PaymentController.ipn);

router.get('/:id', auth(), validateRequest(PaymentValidation.idParam), PaymentController.getById);

export const PaymentRoutes = router;
