import { Router } from 'express';
import {
  createCertificate,
  getCertificates,
  getCertificateById,
  getCertificateHistory,
  verifyCertificate
} from '../controllers/certificateController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createCertificate);
router.get('/', getCertificates);
router.get('/:id', getCertificateById);
router.get('/:id/history', getCertificateHistory);
router.post('/:id/verify', verifyCertificate);

export default router;

