import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createReimbursement,
  getReimbursements,
  getReimbursement,
  approveReimbursement
} from '../controllers/reimbursementController';

const router = express.Router();

router.use(authenticateToken);
router.post('/', createReimbursement);
router.get('/', getReimbursements);
router.get('/:id', getReimbursement);
router.post('/:id/approve', approveReimbursement);

export default router;

