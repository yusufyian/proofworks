import { Router } from 'express';
import {
  createTransfer,
  getTransfers,
  getTransferById,
  approveTransfer,
  rejectTransfer
} from '../controllers/transferController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createTransfer);
router.get('/', getTransfers);
router.get('/:id', getTransferById);
router.post('/:id/approve', approveTransfer);
router.post('/:id/reject', rejectTransfer);

export default router;

