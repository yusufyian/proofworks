import { Router } from 'express';
import { certifyToBlockchain, getBlockchainRecords } from '../controllers/blockchainController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/certify', certifyToBlockchain);
router.get('/records', getBlockchainRecords);

export default router;
