import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(AuthValidation.register), AuthController.register);
router.post('/login', validateRequest(AuthValidation.login), AuthController.login);
router.get('/google', AuthController.googleLogin);
router.get('/google/callback', AuthController.googleCallback);
router.post('/refresh-token', AuthController.refreshToken);
router.post(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.changePassword),
  AuthController.changePassword,
);
router.post('/logout', auth(), AuthController.logout);

export const AuthRoutes = router;
