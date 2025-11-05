import express from 'express';
import {
  getReconciliationRecords,
  getReconciliationSummary,
  triggerReconciliation,
} from '../controllers/reconciliationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/records', authMiddleware, getReconciliationRecords);
router.get('/summary', authMiddleware, getReconciliationSummary);
router.post('/trigger', authMiddleware, triggerReconciliation);

export default router;

