import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import logger from '../utils/logger';

export const getBlockchainRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { recordType, recordId, page = 1, limit = 20 } = req.query;
    let records = fileStorage.getBlockchainRecords();

    if (recordType) {
      records = records.filter(r => r.recordType === recordType);
    }
    if (recordId) {
      records = records.filter(r => r.recordId === recordId);
    }

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = records.slice(start, end);

    res.json({
      records: paginated,
      total: records.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    logger.error('Get blockchain records error:', error);
    res.status(500).json({ error: '获取区块链记录失败' });
  }
};

export const verifyBlockchainRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { txHash } = req.params;
    const records = fileStorage.getBlockchainRecords();
    const record = records.find(r => r.txHash === txHash);

    if (!record) {
      return res.status(404).json({ error: '区块链记录不存在' });
    }

    // 模拟验证逻辑
    res.json({
      verified: true,
      record,
      message: '区块链记录验证通过',
    });
  } catch (error: any) {
    logger.error('Verify blockchain record error:', error);
    res.status(500).json({ error: '验证区块链记录失败' });
  }
};