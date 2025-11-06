import express from 'express';
import { authenticate } from '../middleware/auth';
import { infringementController } from '../controllers/infringementController';

const router = express.Router();

router.use(authenticate);

router.get('/', infringementController.getAll);
router.get('/:id', infringementController.getById);
router.post('/', infringementController.create);
router.put('/:id', infringementController.update);
router.get('/asset/:assetId', infringementController.getByAsset);

export default router;

