import express from 'express';
import { authenticate } from '../middleware/auth';
import { dashboardController } from '../controllers/dashboardController';

const router = express.Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);

export default router;

