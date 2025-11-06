import { Router } from 'express';
import { storage } from '../storage/fileStorage';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { agency, page = 1, limit = 20 } = req.query;
    const reports = await storage.findRegulatoryReports({ agency } as any);
    
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = reports.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: reports.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(reports.length / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('获取报送记录失败', 500);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const report = await storage.findRegulatoryReport(req.params.id);
    if (!report) {
      throw new AppError('报送记录不存在', 404);
    }
    res.json({ success: true, data: report });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('获取报送记录失败', 500);
  }
});

export default router;

