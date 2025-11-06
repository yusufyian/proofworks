import express from 'express';
import { authenticate } from '../middleware/auth';
import { rightsProtectionController } from '../controllers/rightsProtectionController';

const router = express.Router();

router.use(authenticate);

router.get('/', rightsProtectionController.getAll);
router.get('/:id', rightsProtectionController.getById);
router.post('/', rightsProtectionController.create);
router.put('/:id', rightsProtectionController.update);

export default router;

