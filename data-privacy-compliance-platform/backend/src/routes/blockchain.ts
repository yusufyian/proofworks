import { Router } from 'express';
import { getBlockchainRecords, getBlockchainRecord } from '../controllers/blockchainController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getBlockchainRecords);
router.get('/:id', authenticate, getBlockchainRecord);

export default router;

