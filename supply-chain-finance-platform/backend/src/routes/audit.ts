import { Router } from 'express';
import { getAuditLogs, getAuditStats } from '../controllers/auditController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'bank'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);

export default router;

