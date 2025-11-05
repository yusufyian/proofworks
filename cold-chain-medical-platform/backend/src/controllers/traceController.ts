import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';

export const traceBatch = async (req: AuthRequest, res: Response) => {
  try {
    const { batchNo } = req.query;
    
    if (!batchNo) {
      return res.status(400).json({ error: '批次号不能为空' });
    }

    const batches = await storage.findBatches({ batchNo: batchNo as string });
    
    if (batches.length === 0) {
      return res.status(404).json({ error: '批次不存在' });
    }

    const batch = batches[0];
    
    // 获取追溯记录
    const traceRecords = await storage.findTraceRecords(batch.id);
    
    // 获取温度记录
    const temperatureRecords = await storage.findTemperatureRecords({ batchId: batch.id });
    
    // 获取告警
    const alerts = await storage.findAlerts({ batchId: batch.id });

    res.json({
      batch,
      traceRecords,
      temperatureRecords: temperatureRecords.slice(-100), // 最近100条
      alerts,
    });
  } catch (error) {
    console.error('追溯查询错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

