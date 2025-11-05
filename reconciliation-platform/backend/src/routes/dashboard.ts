import express from 'express';
import { getStats } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/stats', authMiddleware, getStats);

export default router;

