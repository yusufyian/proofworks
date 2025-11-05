import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { recognizeInvoice } from '../controllers/ocrController';

const router = express.Router();

router.use(authenticateToken);
router.post('/recognize', recognizeInvoice);

export default router;

