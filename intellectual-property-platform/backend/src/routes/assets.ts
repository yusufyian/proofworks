import express from 'express';
import { authenticate } from '../middleware/auth';
import { assetController } from '../controllers/assetController';

const router = express.Router();

router.use(authenticate);

router.get('/', assetController.getAll);
router.get('/:id', assetController.getById);
router.post('/', assetController.create);
router.put('/:id', assetController.update);
router.delete('/:id', assetController.delete);
router.get('/owner/:ownerId', assetController.getByOwner);

export default router;

