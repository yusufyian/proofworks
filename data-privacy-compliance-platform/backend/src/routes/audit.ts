import { Router } from 'express';
import { getAuditRecords } from '../controllers/auditController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin', 'auditor'), getAuditRecords);

export default router;

