import { Router } from 'express';
import { certificateController } from '../controllers/certificateController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/certificates:
 *   get:
 *     summary: Get certificates list
 *     tags: [Certificates]
 */
router.get('/', certificateController.getCertificates);

/**
 * @swagger
 * /api/v1/certificates/{id}:
 *   get:
 *     summary: Get certificate details
 *     tags: [Certificates]
 */
router.get('/:id', certificateController.getCertificateById);

/**
 * @swagger
 * /api/v1/certificates:
 *   post:
 *     summary: Issue a new certificate (Core Enterprise only)
 *     tags: [Certificates]
 */
router.post(
  '/',
  authorizeRoles('core_enterprise', 'admin'),
  certificateController.issueCertificate
);

export default router;

