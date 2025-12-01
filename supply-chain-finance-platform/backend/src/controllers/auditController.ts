import { Response, NextFunction } from 'express';
import { storage } from '../storage/fileStorage';
import { AuthRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resourceType, action, status, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter: any = {};
    if (resourceType) filter.resourceType = resourceType;
    if (action) filter.action = action;
    if (status) filter.status = status;

    let logs = await storage.findAuditLogs(filter);

    // 分页
    const total = logs.length;
    const offset = (pageNum - 1) * limitNum;
    logs = logs.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await storage.findAuditLogs({});
    const totalLogs = logs.length;
    const successLogs = logs.filter(l => l.status === 'success').length;
    const failureLogs = logs.filter(l => l.status === 'failure').length;

    // 按操作类型统计
    const actionMap: { [key: string]: number } = {};
    logs.forEach(log => {
      actionMap[log.action] = (actionMap[log.action] || 0) + 1;
    });
    const actionStats = Object.entries(actionMap).map(([action, count]) => ({ action, count }));

    res.json({
      success: true,
      data: {
        total: totalLogs,
        success: successLogs,
        failure: failureLogs,
        successRate: totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(2) : 0,
        actionStats
      }
    });
  } catch (error) {
    next(error);
  }
};
