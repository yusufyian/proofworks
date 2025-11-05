import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getStats } from '../controllers/dashboardController';

const router = express.Router();

router.use(authenticateToken);
router.get('/stats', getStats);

export default router;

