import { Router } from 'express';
import {
  getBlockchainRecords,
  verifyBlockchainRecord,
} from '../controllers/blockchainController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getBlockchainRecords);
router.get('/verify/:txHash', verifyBlockchainRecord);

export default router;