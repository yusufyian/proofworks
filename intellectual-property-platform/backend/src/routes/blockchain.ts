import express from 'express';
import { authenticate } from '../middleware/auth';
import { blockchainController } from '../controllers/blockchainController';

const router = express.Router();

router.use(authenticate);

router.get('/info', blockchainController.getInfo);
router.post('/verify', blockchainController.verify);
router.get('/transaction/:txHash', blockchainController.getTransaction);

export default router;

