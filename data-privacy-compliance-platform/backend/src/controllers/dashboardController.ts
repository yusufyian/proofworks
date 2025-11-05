import { Request, Response, NextFunction } from 'express';
import { getStorage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { DashboardStats } from '../types';

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const userId = req.user?.id;

    let dataAssets = storage.dataAssets;
    let authorizations = storage.authorizations;
    let computingTasks = storage.computingTasks;
    let auditRecords = storage.auditRecords;

    // 根据角色过滤
    if (req.user?.role === 'data_provider') {
      dataAssets = dataAssets.filter(a => a.owner === userId);
      authorizations = authorizations.filter(a => a.grantor === userId);
      computingTasks = computingTasks.filter(t => t.participants.includes(userId!));
      auditRecords = auditRecords.filter(r => r.userId === userId);
    } else if (req.user?.role === 'data_consumer') {
      authorizations = authorizations.filter(a => a.grantee === userId);
      computingTasks = computingTasks.filter(t => t.initiator === userId || t.participants.includes(userId!));
      auditRecords = auditRecords.filter(r => r.userId === userId);
    }

    const activeAuthorizations = authorizations.filter(a => 
      a.status === 'approved' && 
      new Date(a.validTo) > new Date() &&
      new Date(a.validFrom) <= new Date()
    );

    const completedTasks = computingTasks.filter(t => t.status === 'completed');

    // 计算合规率（所有授权中已批准的百分比）
    const complianceRate = authorizations.length > 0
      ? Math.round((authorizations.filter(a => a.status === 'approved').length / authorizations.length) * 100)
      : 100;

    // 最近活动（最近20条）
    const recentActivities = auditRecords
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
      .map(record => {
        const user = storage.users.find(u => u.id === record.userId);
        return {
          ...record,
          userName: user?.name,
          userOrg: user?.organization,
        };
      });

    const stats: DashboardStats = {
      totalDataAssets: dataAssets.length,
      totalAuthorizations: authorizations.length,
      activeAuthorizations: activeAuthorizations.length,
      totalComputingTasks: computingTasks.length,
      completedTasks: completedTasks.length,
      totalBlockchainRecords: storage.blockchainRecords.length,
      complianceRate,
      recentActivities,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

