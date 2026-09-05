import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { HospitalController } from './hospital.controller';
import { HospitalValidation } from './hospital.validation';

const router = Router();

router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(HospitalValidation.create),
  HospitalController.create,
);
router.get('/', auth(), validateRequest(HospitalValidation.list), HospitalController.getAll);
router.get(
  '/:id',
  auth(),
  validateRequest(HospitalValidation.idParam),
  HospitalController.getById,
);
router.patch(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(HospitalValidation.update),
  HospitalController.update,
);
router.delete(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(HospitalValidation.idParam),
  HospitalController.softDelete,
);

export const HospitalRoutes = router;
