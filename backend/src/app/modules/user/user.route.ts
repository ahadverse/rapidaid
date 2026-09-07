import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = Router();

router.get('/me', auth(), UserController.getMe);
router.patch(
  '/me',
  auth(),
  validateRequest(UserValidation.updateProfile),
  UserController.updateMe,
);

router.get(
  '/',
  auth(Role.ADMIN),
  validateRequest(UserValidation.listUsers),
  UserController.getAllUsers,
);
router.get(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(UserValidation.idParam),
  UserController.getUserById,
);
router.patch(
  '/:id/status',
  auth(Role.ADMIN),
  validateRequest(UserValidation.updateStatus),
  UserController.updateUserStatus,
);
router.delete(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(UserValidation.idParam),
  UserController.softDeleteUser,
);

export const UserRoutes = router;
