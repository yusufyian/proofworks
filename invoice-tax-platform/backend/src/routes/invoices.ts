import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  uploadInvoice,
  getInvoices,
  getInvoice,
  verifyInvoice
} from '../controllers/invoiceController';

const router = express.Router();

router.use(authenticateToken);

router.post('/upload', uploadInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/:id/verify', verifyInvoice);

export default router;

