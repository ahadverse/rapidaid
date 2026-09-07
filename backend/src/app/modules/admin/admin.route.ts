import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AdminController } from './admin.controller';
import { AdminValidation } from './admin.validation';

const router = Router();

router.use(auth(Role.ADMIN));

router.get('/dashboard-stats', AdminController.getDashboardStats);
router.get('/audit-logs', validateRequest(AdminValidation.auditLogs), AdminController.getAuditLogs);
router.get(
  '/reports/trips',
  validateRequest(AdminValidation.report),
  AdminController.getTripReport,
);

export const AdminRoutes = router;
