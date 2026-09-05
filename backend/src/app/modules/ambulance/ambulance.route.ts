import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AmbulanceController } from './ambulance.controller';
import { AmbulanceValidation } from './ambulance.validation';

const router = Router();

router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(AmbulanceValidation.create),
  AmbulanceController.create,
);
router.get(
  '/',
  auth(Role.ADMIN, Role.DRIVER),
  validateRequest(AmbulanceValidation.list),
  AmbulanceController.getAll,
);
router.get(
  '/:id',
  auth(Role.ADMIN, Role.DRIVER),
  validateRequest(AmbulanceValidation.idParam),
  AmbulanceController.getById,
);
router.patch(
  '/:id/status',
  auth(Role.ADMIN, Role.DRIVER),
  validateRequest(AmbulanceValidation.updateStatus),
  AmbulanceController.updateStatus,
);
router.patch(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(AmbulanceValidation.update),
  AmbulanceController.update,
);
router.delete(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(AmbulanceValidation.idParam),
  AmbulanceController.softDelete,
);

export const AmbulanceRoutes = router;
