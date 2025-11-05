import express from 'express';
import { login, getCurrentUser } from '../controllers/authController';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

export default router;

