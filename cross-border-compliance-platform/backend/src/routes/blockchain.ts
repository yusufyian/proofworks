import { Router } from 'express';
import { storage } from '../storage/fileStorage';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { dataType, page = 1, limit = 20 } = req.query;
    const records = await storage.findBlockchainRecords({ dataType } as any);
    
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = records.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: records.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(records.length / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('获取区块链记录失败', 500);
  }
});

export default router;

