import { Request, Response, Router } from 'express';
import { config } from '../../config';
import { DocsRoutes } from '../docs/docs.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { AmbulanceRoutes } from '../modules/ambulance/ambulance.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { DriverRoutes } from '../modules/driver/driver.route';
import { EmergencyRequestRoutes } from '../modules/emergencyRequest/emergencyRequest.route';
import { HospitalRoutes } from '../modules/hospital/hospital.route';
import { NotificationRoutes } from '../modules/notification/notification.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { TripRoutes } from '../modules/trip/trip.route';
import { UserRoutes } from '../modules/user/user.route';
import sendResponse from '../utils/sendResponse';

const router = Router();

type TModuleRoute = {
  path: string;
  route: Router;
};

const moduleRoutes: TModuleRoute[] = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/ambulances', route: AmbulanceRoutes },
  { path: '/hospitals', route: HospitalRoutes },
  { path: '/drivers', route: DriverRoutes },
  { path: '/emergency-requests', route: EmergencyRequestRoutes },
  { path: '/trips', route: TripRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/docs', route: DocsRoutes },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

router.get('/health', (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    message: 'RapidAid API is running',
    data: {
      service: 'rapidaid-api',
      environment: config.env,
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
