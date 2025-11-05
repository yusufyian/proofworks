import { Request, Response, NextFunction } from 'express';
import { getStorage, updateStorage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { AuditRecord } from '../types';

export const getAuditRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const { page = 1, limit = 50, action, resourceType, startDate, endDate } = req.query;

    let records = storage.auditRecords;

    // 非管理员只能看自己的记录
    if (req.user?.role !== 'admin' && req.user?.role !== 'auditor') {
      records = records.filter(r => r.userId === req.user?.id);
    }

    // 过滤
    if (action) {
      records = records.filter(r => r.action === action);
    }
    if (resourceType) {
      records = records.filter(r => r.resourceType === resourceType);
    }
    if (startDate) {
      records = records.filter(r => r.timestamp >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.timestamp <= endDate);
    }

    // 排序（最新的在前）
    records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 分页
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = records.slice(start, end);

    // 填充用户信息
    const enriched = paginated.map(record => {
      const user = storage.users.find(u => u.id === record.userId);
      return {
        ...record,
        userName: user?.name,
        userEmail: user?.email,
        userOrg: user?.organization,
      };
    });

    res.json({
      success: true,
      data: {
        items: enriched,
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

export const createAuditRecord = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: any,
  ipAddress?: string,
  userAgent?: string
) => {
  const storage = getStorage();
  const record: AuditRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString(),
  };

  updateStorage(storage => {
    storage.auditRecords.push(record);
    return storage;
  });

  return record;
};

