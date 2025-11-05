import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getOrders, getOrder, getReceipts } from '../controllers/orderController';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getOrders);
router.get('/receipts', getReceipts);
router.get('/:id', getOrder);

export default router;

