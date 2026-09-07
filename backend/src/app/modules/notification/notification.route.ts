import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationController } from './notification.controller';
import { NotificationValidation } from './notification.validation';

const router = Router();

router.get(
  '/',
  auth(),
  validateRequest(NotificationValidation.list),
  NotificationController.getMine,
);
router.patch('/read-all', auth(), NotificationController.markAllAsRead);
router.patch(
  '/:id/read',
  auth(),
  validateRequest(NotificationValidation.idParam),
  NotificationController.markAsRead,
);

export const NotificationRoutes = router;
