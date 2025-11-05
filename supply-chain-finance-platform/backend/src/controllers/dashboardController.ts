import { Response, NextFunction } from 'express';
import { storage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// 生成最近7天的日期数组
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

// 生成最近30天的日期数组
function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user!.companyId;
    const role = req.user!.role;

    let stats: any = {};

    if (role === 'core_enterprise') {
      const certificates = await storage.findCertificates({ creditorId: companyId });
      const totalCertificates = certificates.length;
      const activeCertificates = certificates.filter(c => c.status === 'holding').length;
      const totalAmount = certificates.reduce((sum, c) => sum + (parseFloat(c.initialAmount) || 0), 0);
      const remainingAmount = certificates
        .filter(c => c.status === 'holding' || c.status === 'split')
        .reduce((sum, c) => sum + (parseFloat(c.remainingAmount) || 0), 0);

      // 状态分布
      const statusDistribution = {
        holding: certificates.filter(c => c.status === 'holding').length,
        transferred: certificates.filter(c => c.status === 'transferred').length,
        pledged: certificates.filter(c => c.status === 'pledged').length,
        redeemed: certificates.filter(c => c.status === 'redeemed').length,
        split: certificates.filter(c => c.status === 'split').length,
      };

      // 最近7天趋势
      const last7Days = getLast7Days();
      const trend7Days = last7Days.map(date => {
        const dayCertificates = certificates.filter(c => {
          const certDate = c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : null;
          return certDate === date;
        });
        return {
          date,
          count: dayCertificates.length,
          amount: dayCertificates.reduce((sum, c) => sum + (parseFloat(c.initialAmount) || 0), 0)
        };
      });

      // 最近30天趋势
      const last30Days = getLast30Days();
      const trend30Days = last30Days.map(date => {
        const dayCertificates = certificates.filter(c => {
          const certDate = c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : null;
          return certDate === date;
        });
        return {
          date,
          count: dayCertificates.length,
          amount: dayCertificates.reduce((sum, c) => sum + (parseFloat(c.initialAmount) || 0), 0)
        };
      });

      // 平均金额
      const avgAmount = totalCertificates > 0 ? totalAmount / totalCertificates : 0;

      stats = {
        totalCertificates,
        activeCertificates,
        totalAmount,
        remainingAmount,
        redeemedAmount: totalAmount - remainingAmount,
        statusDistribution,
        trend7Days,
        trend30Days,
        avgAmount,
        utilizationRate: totalAmount > 0 ? ((totalAmount - remainingAmount) / totalAmount * 100).toFixed(2) : 0
      };
    } else if (role === 'supplier') {
      const certificates = await storage.findCertificates({ debtorId: companyId });
      const myCertificates = certificates.length;
      const activeCertificates = certificates.filter(c => c.status === 'holding').length;
      const totalAmount = certificates
        .filter(c => c.status === 'holding' || c.status === 'split')
        .reduce((sum, c) => sum + (parseFloat(c.remainingAmount) || 0), 0);
      
      const financings = await storage.findFinancings({ applicantId: companyId });
      const pendingFinancings = financings.filter(f => f.status === 'pending').length;
      const approvedFinancings = financings.filter(f => f.status === 'approved').length;

      // 状态分布
      const statusDistribution = {
        holding: certificates.filter(c => c.status === 'holding').length,
        transferred: certificates.filter(c => c.status === 'transferred').length,
        pledged: certificates.filter(c => c.status === 'pledged').length,
      };

      // 融资状态分布
      const financingStatus = {
        pending: pendingFinancings,
        approved: approvedFinancings,
        rejected: financings.filter(f => f.status === 'rejected').length,
        disbursed: financings.filter(f => f.status === 'disbursed').length,
      };

      // 最近7天凭证接收趋势
      const last7Days = getLast7Days();
      const trend7Days = last7Days.map(date => {
        const dayCertificates = certificates.filter(c => {
          const certDate = c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : null;
          return certDate === date;
        });
        return {
          date,
          count: dayCertificates.length,
          amount: dayCertificates.reduce((sum, c) => sum + (parseFloat(c.initialAmount) || 0), 0)
        };
      });

      stats = {
        myCertificates,
        activeCertificates,
        totalAmount,
        pendingFinancings,
        approvedFinancings,
        statusDistribution,
        financingStatus,
        trend7Days,
        avgAmount: myCertificates > 0 ? totalAmount / myCertificates : 0
      };
    } else if (role === 'bank') {
      const financings = await storage.findFinancings({ financierId: companyId });
      const pendingFinancings = financings.filter(f => f.status === 'pending').length;
      const approvedFinancings = financings.filter(f => f.status === 'approved').length;
      const disbursedFinancings = financings.filter(f => f.status === 'disbursed').length;
      const totalFinancingAmount = financings
        .filter(f => ['approved', 'disbursed', 'repaid'].includes(f.status))
        .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);

      // 融资状态分布
      const financingStatus = {
        pending: pendingFinancings,
        approved: approvedFinancings,
        rejected: financings.filter(f => f.status === 'rejected').length,
        disbursed: disbursedFinancings,
        repaid: financings.filter(f => f.status === 'repaid').length,
      };

      // 最近7天融资趋势
      const last7Days = getLast7Days();
      const trend7Days = last7Days.map(date => {
        const dayFinancings = financings.filter(f => {
          const finDate = f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : null;
          return finDate === date;
        });
        return {
          date,
          count: dayFinancings.length,
          amount: dayFinancings.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
        };
      });

      // 最近30天融资趋势
      const last30Days = getLast30Days();
      const trend30Days = last30Days.map(date => {
        const dayFinancings = financings.filter(f => {
          const finDate = f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : null;
          return finDate === date;
        });
        return {
          date,
          count: dayFinancings.length,
          amount: dayFinancings.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
        };
      });

      stats = {
        pendingFinancings,
        approvedFinancings,
        disbursedFinancings,
        totalFinancingAmount,
        financingStatus,
        trend7Days,
        trend30Days,
        avgFinancingAmount: financings.length > 0 ? totalFinancingAmount / financings.length : 0,
        approvalRate: financings.length > 0 ? ((approvedFinancings + disbursedFinancings) / financings.length * 100).toFixed(2) : 0
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
