import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '@ankirab/shared';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, validateBody(registerSchema), (req, res, next) =>
  controller.register(req, res, next)
);

router.post('/login', authLimiter, validateBody(loginSchema), (req, res, next) =>
  controller.login(req, res, next)
);

router.post('/logout', authenticate, (req, res, next) =>
  controller.logout(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  controller.me(req, res, next)
);

router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), (req, res, next) =>
  controller.forgotPassword(req, res, next)
);

router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), (req, res, next) =>
  controller.resetPassword(req, res, next)
);

export default router;
