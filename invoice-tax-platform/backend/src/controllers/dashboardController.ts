import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const stats = await storage.getStatistics();
    const invoices = await storage.findInvoices();
    const reimbursements = await storage.findReimbursements();
    const salesInvoices = await storage.findSalesInvoices();

    // 计算趋势数据（最近30天）
    const trend30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const dayInvoices = invoices.filter(inv => inv.issueDate === date);
      const dayReimbursements = reimbursements.filter(r => r.createdAt.startsWith(date));
      
      trend30Days.push({
        date,
        invoiceCount: dayInvoices.length,
        invoiceAmount: dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        reimbursementCount: dayReimbursements.length,
        reimbursementAmount: dayReimbursements.reduce((sum, r) => sum + r.totalAmount, 0)
      });
    }

    // 计算最近7天趋势
    const trend7Days = trend30Days.slice(-7);

    // 状态分布
    const statusDistribution = {
      verified: invoices.filter(i => i.verifyStatus === 'verified').length,
      invalid: invoices.filter(i => i.verifyStatus === 'invalid').length,
      pending: invoices.filter(i => i.verifyStatus === 'pending').length,
      matched: invoices.filter(i => i.matchStatus === 'matched').length,
      unmatched: invoices.filter(i => i.matchStatus === 'unmatched').length
    };

    // 风险分布
    const riskDistribution = {
      low: invoices.filter(i => i.riskLevel === 'low').length,
      medium: invoices.filter(i => i.riskLevel === 'medium').length,
      high: invoices.filter(i => i.riskLevel === 'high').length
    };

    res.json({
      data: {
        ...stats,
        trend7Days,
        trend30Days,
        statusDistribution,
        riskDistribution
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
}

