import { Router } from 'express';
import { transferController } from '../controllers/transferController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', transferController.createTransfer);
router.get('/', transferController.getTransfers);
router.get('/:id', transferController.getTransferById);
router.get('/certificate/:certificateId', transferController.getTransferHistory);

export default router;

