import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createSalesInvoice, getSalesInvoices } from '../controllers/salesController';

const router = express.Router();

router.use(authenticateToken);
router.post('/invoices', createSalesInvoice);
router.get('/invoices', getSalesInvoices);

export default router;

