import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/certificates/overview', dashboardController.getCertificatesOverview);
router.get('/financing/overview', dashboardController.getFinancingOverview);

export default router;

