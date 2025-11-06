import { Router } from 'express';
import { storage } from '../storage/fileStorage';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, path, page = 1, limit = 20 } = req.query;
    const assessments = await storage.findDataExportAssessments({ status, path } as any);
    
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = assessments.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: assessments.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(assessments.length / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('获取评估记录失败', 500);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const assessment = await storage.findDataExportAssessment(req.params.id);
    if (!assessment) {
      throw new AppError('评估记录不存在', 404);
    }
    res.json({ success: true, data: assessment });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('获取评估记录失败', 500);
  }
});

export default router;

