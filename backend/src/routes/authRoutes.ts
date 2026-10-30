import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
  validateRequest,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/schemas';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);

export default router;
