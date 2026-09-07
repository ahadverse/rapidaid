import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TripController } from './trip.controller';
import { TripValidation } from './trip.validation';

const router = Router();

router.get(
  '/me',
  auth(Role.DRIVER, Role.PATIENT),
  validateRequest(TripValidation.list),
  TripController.getMyTrips,
);

router.get('/', auth(Role.ADMIN), validateRequest(TripValidation.list), TripController.getAll);
router.get(
  '/:id',
  auth(Role.DRIVER, Role.PATIENT, Role.ADMIN),
  validateRequest(TripValidation.idParam),
  TripController.getById,
);
router.patch(
  '/:id/status',
  auth(Role.DRIVER, Role.ADMIN),
  validateRequest(TripValidation.updateStatus),
  TripController.updateStatus,
);
router.patch(
  '/:id/complete',
  auth(Role.DRIVER, Role.ADMIN),
  validateRequest(TripValidation.complete),
  TripController.complete,
);
router.patch(
  '/:id/hospital',
  auth(Role.DRIVER, Role.ADMIN),
  validateRequest(TripValidation.selectHospital),
  TripController.selectHospital,
);

export const TripRoutes = router;
