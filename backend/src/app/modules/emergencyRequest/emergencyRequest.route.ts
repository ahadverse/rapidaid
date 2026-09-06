import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { EmergencyRequestController } from './emergencyRequest.controller';
import { EmergencyRequestValidation } from './emergencyRequest.validation';

const router = Router();

router.post(
  '/',
  auth(Role.PATIENT),
  validateRequest(EmergencyRequestValidation.create),
  EmergencyRequestController.create,
);
// Admins get every request here; patients get only their own.
router.get(
  '/',
  auth(Role.PATIENT, Role.ADMIN),
  validateRequest(EmergencyRequestValidation.list),
  EmergencyRequestController.getAll,
);
router.get(
  '/:id',
  auth(Role.PATIENT, Role.ADMIN),
  validateRequest(EmergencyRequestValidation.idParam),
  EmergencyRequestController.getById,
);
router.patch(
  '/:id',
  auth(Role.PATIENT),
  validateRequest(EmergencyRequestValidation.update),
  EmergencyRequestController.update,
);
router.patch(
  '/:id/cancel',
  auth(Role.PATIENT, Role.ADMIN),
  validateRequest(EmergencyRequestValidation.cancel),
  EmergencyRequestController.cancel,
);
router.post(
  '/:id/dispatch',
  auth(Role.ADMIN),
  validateRequest(EmergencyRequestValidation.dispatch),
  EmergencyRequestController.dispatch,
);

export const EmergencyRequestRoutes = router;
