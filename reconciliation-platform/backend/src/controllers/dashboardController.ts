import { Response } from 'express';
import { storage } from '../storage/fileStorage';
import dayjs from 'dayjs';

export const getStats = async (req: any, res: Response) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    ).reverse();
    const last30Days = Array.from({ length: 30 }, (_, i) => 
      dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    ).reverse();

    // 今日统计
    let todaySummary = await storage.getReconciliationSummary(today);
    
    // 如果今天没有数据，尝试查找最近有数据的日期
    if (todaySummary.totalTransactions === 0) {
      for (let i = 1; i <= 30; i++) {
        const checkDate = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        const checkSummary = await storage.getReconciliationSummary(checkDate);
        if (checkSummary.totalTransactions > 0) {
          console.log(`[Dashboard] 今天(${today})没有数据，使用最近有数据的日期: ${checkDate}`);
          todaySummary = checkSummary;
          break;
        }
      }
    }
    
    const yesterdaySummary = await storage.getReconciliationSummary(yesterday);
    
    console.log('[Dashboard] Today:', today);
    console.log('[Dashboard] Today Summary:', JSON.stringify(todaySummary, null, 2));

    // 最近7天趋势
    const trend7Days = await Promise.all(
      last7Days.map(async (date) => {
        const summary = await storage.getReconciliationSummary(date);
        return {
          date,
          transactions: summary.totalTransactions,
          matched: summary.matchedCount,
          amount: summary.totalAmount,
        };
      })
    );

    // 最近30天趋势
    const trend30Days = await Promise.all(
      last30Days.map(async (date) => {
        const summary = await storage.getReconciliationSummary(date);
        return {
          date,
          transactions: summary.totalTransactions,
          matched: summary.matchedCount,
          amount: summary.totalAmount,
        };
      })
    );

    // 待处理差异
    const pendingTickets = await storage.findDiscrepancyTickets({ status: 'PENDING' });
    const processingTickets = await storage.findDiscrepancyTickets({ status: 'PROCESSING' });

    // 渠道统计
    const channelStats = todaySummary.channelStats || [];

    res.json({
      data: {
        today: {
          totalTransactions: todaySummary.totalTransactions,
          matchedCount: todaySummary.matchedCount,
          unmatchedCount: todaySummary.unmatchedCount,
          totalAmount: todaySummary.totalAmount,
          matchedAmount: todaySummary.matchedAmount,
          matchRate: todaySummary.matchRate,
        },
        yesterday: {
          totalTransactions: yesterdaySummary.totalTransactions,
          matchedCount: yesterdaySummary.matchedCount,
          unmatchedCount: yesterdaySummary.unmatchedCount,
          totalAmount: yesterdaySummary.totalAmount,
          matchedAmount: yesterdaySummary.matchedAmount,
          matchRate: yesterdaySummary.matchRate,
        },
        trend7Days,
        trend30Days,
        pendingTicketsCount: pendingTickets.length,
        processingTicketsCount: processingTickets.length,
        channelStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

