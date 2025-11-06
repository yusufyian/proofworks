import { Router } from 'express';
import { storage } from '../storage/fileStorage';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const transmissions = await storage.findDataTransmissions({ status } as any);
    
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = transmissions.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: transmissions.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(transmissions.length / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('获取传输记录失败', 500);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const transmission = await storage.findDataTransmission(req.params.id);
    if (!transmission) {
      throw new AppError('传输记录不存在', 404);
    }
    res.json({ success: true, data: transmission });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('获取传输记录失败', 500);
  }
});

export default router;

