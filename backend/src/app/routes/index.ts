import { Request, Response, Router } from 'express';
import { config } from '../../config';
import sendResponse from '../utils/sendResponse';

const router = Router();

type TModuleRoute = {
  path: string;
  route: Router;
};

const moduleRoutes: TModuleRoute[] = [];

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
