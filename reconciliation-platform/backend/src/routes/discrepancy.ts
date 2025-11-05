import express from 'express';
import {
  getDiscrepancyTickets,
  updateDiscrepancyTicket,
  getDiscrepancyStats,
} from '../controllers/discrepancyController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/tickets', authMiddleware, getDiscrepancyTickets);
router.get('/stats', authMiddleware, getDiscrepancyStats);
router.patch('/tickets/:id', authMiddleware, updateDiscrepancyTicket);

export default router;

