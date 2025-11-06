import { Response } from 'express';
import { storage } from '../storage/fileStorage';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const assessments = await storage.findDataExportAssessments();
    const contracts = await storage.findStandardContracts();
    const transmissions = await storage.findDataTransmissions();
    const payments = await storage.findCrossBorderPayments();
    const orders = await storage.findSupplyChainOrders();
    const reports = await storage.findRegulatoryReports();

    const approvedAssessments = assessments.filter(a => a.status === 'approved').length;
    const activeContracts = contracts.filter(c => c.status === 'signed').length;
    const completedTransmissions = transmissions.filter(t => t.status === 'completed').length;
    const completedPayments = payments.filter(p => p.status === 'completed');
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const totalPaymentAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaymentCount = completedPayments.length;

    res.json({
      success: true,
      data: {
        assessments: {
          total: assessments.length,
          approved: approvedAssessments,
          pending: assessments.filter(a => a.status === 'pending').length,
        },
        contracts: {
          total: contracts.length,
          active: activeContracts,
          expired: contracts.filter(c => c.status === 'expired').length,
        },
        transmissions: {
          total: transmissions.length,
          completed: completedTransmissions,
          pending: transmissions.filter(t => t.status === 'pending').length,
        },
        payments: {
          total: payments.length,
          completed: totalPaymentCount,
          amount: totalPaymentAmount,
          pending: payments.filter(p => p.status === 'pending').length,
        },
        orders: {
          total: orders.length,
          completed: completedOrders,
          pending: orders.filter(o => o.status === 'pending').length,
        },
        reports: {
          total: reports.length,
          submitted: reports.filter(r => r.status === 'submitted').length,
        },
      },
    });
  } catch (error) {
    logger.error('获取统计数据失败:', error);
    throw new AppError('获取统计数据失败', 500);
  }
};

