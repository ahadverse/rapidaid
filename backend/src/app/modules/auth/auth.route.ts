import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(AuthValidation.register), AuthController.register);
router.post('/login', validateRequest(AuthValidation.login), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

export const AuthRoutes = router;
