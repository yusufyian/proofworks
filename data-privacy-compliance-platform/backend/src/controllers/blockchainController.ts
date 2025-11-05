import { Request, Response, NextFunction } from 'express';
import { getStorage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getBlockchainRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const { page = 1, limit = 20, recordType } = req.query;

    let records = storage.blockchainRecords;

    // 类型过滤
    if (recordType) {
      records = records.filter(r => r.recordType === recordType);
    }

    // 排序（最新的在前）
    records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 分页
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = records.slice(start, end);

    res.json({
      success: true,
      data: {
        items: paginated,
        total: records.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(records.length / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBlockchainRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const { id } = req.params;

    const record = storage.blockchainRecords.find(r => r.id === id);
    if (!record) {
      throw new AppError('区块链记录不存在', 404);
    }

    // 根据记录类型获取关联数据
    let relatedData = null;
    if (record.recordType === 'authorization') {
      relatedData = storage.authorizations.find(a => a.id === record.recordId);
    } else if (record.recordType === 'computing') {
      relatedData = storage.computingTasks.find(t => t.id === record.recordId);
    }

    res.json({
      success: true,
      data: {
        ...record,
        relatedData,
      },
    });
  } catch (error) {
    next(error);
  }
};

