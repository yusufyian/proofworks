import express from 'express';
import {
  getSettlementRecords,
  createSettlement,
} from '../controllers/settlementController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/records', authMiddleware, getSettlementRecords);
router.post('/create', authMiddleware, createSettlement);

export default router;

