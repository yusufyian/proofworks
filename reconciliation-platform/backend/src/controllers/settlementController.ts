import { Response } from 'express';
import { storage } from '../storage/fileStorage';

export const getSettlementRecords = async (req: any, res: Response) => {
  try {
    const { status, startDate, endDate, page = 1, pageSize = 20 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    const records = await storage.findSettlementRecords(filter);

    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedRecords = records.slice(start, end);

    res.json({
      data: {
        records: paginatedRecords,
        total: records.length,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(records.length / Number(pageSize)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSettlement = async (req: any, res: Response) => {
  try {
    const { orderId, totalAmount, splits } = req.body;

    if (!orderId || !totalAmount || !splits || !Array.isArray(splits)) {
      return res.status(400).json({ error: '订单号、总金额和清分规则不能为空' });
    }

    // 计算清分金额
    let calculatedAmount = 0;
    const processedSplits = splits.map((split: any) => {
      let amount = 0;
      if (split.type === 'PERCENTAGE') {
        amount = totalAmount * (split.value / 100);
      } else if (split.type === 'FIXED') {
        amount = split.value;
      } else if (split.type === 'REMAINDER') {
        amount = totalAmount - calculatedAmount;
      }
      calculatedAmount += amount;
      return {
        ...split,
        amount: Math.round(amount * 100) / 100,
      };
    });

    // 生成区块链交易哈希（模拟）
    const blockchainTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    const settlementRecord = await storage.createSettlementRecord({
      settlementId: `SETTLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      totalAmount,
      splits: processedSplits,
      settlementTime: new Date().toISOString(),
      status: 'SUCCESS',
      blockchainTxHash,
    });

    res.json({ data: settlementRecord });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

