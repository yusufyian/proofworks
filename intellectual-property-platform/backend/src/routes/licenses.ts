import express from 'express';
import { authenticate } from '../middleware/auth';
import { licenseController } from '../controllers/licenseController';

const router = express.Router();

router.use(authenticate);

router.get('/', licenseController.getAll);
router.get('/:id', licenseController.getById);
router.post('/', licenseController.create);
router.put('/:id', licenseController.update);

export default router;

