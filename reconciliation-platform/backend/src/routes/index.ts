import express from 'express';
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import reconciliationRoutes from './reconciliation';
import discrepancyRoutes from './discrepancy';
import settlementRoutes from './settlement';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reconciliation', reconciliationRoutes);
router.use('/discrepancy', discrepancyRoutes);
router.use('/settlement', settlementRoutes);

export default router;

