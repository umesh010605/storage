import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest, registerSchema, loginSchema } from '../utils/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.me);

export default router;