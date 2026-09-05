import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DriverController } from './driver.controller';
import { DriverValidation } from './driver.validation';

const router = Router();

router.get('/me', auth(Role.DRIVER), DriverController.getMyProfile);
router.patch(
  '/me/availability',
  auth(Role.DRIVER),
  validateRequest(DriverValidation.updateAvailability),
  DriverController.updateMyAvailability,
);

router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(DriverValidation.create),
  DriverController.create,
);
router.get(
  '/',
  auth(Role.ADMIN),
  validateRequest(DriverValidation.list),
  DriverController.getAll,
);

export const DriverRoutes = router;
