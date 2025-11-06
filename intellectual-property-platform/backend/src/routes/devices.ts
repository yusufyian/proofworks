import express from 'express';
import { authenticate } from '../middleware/auth';
import { deviceController } from '../controllers/deviceController';

const router = express.Router();

router.use(authenticate);

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getById);
router.post('/', deviceController.create);
router.put('/:id', deviceController.update);

export default router;

