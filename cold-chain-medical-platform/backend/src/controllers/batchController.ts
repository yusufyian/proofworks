import { Response } from 'express';
import storage from '../storage/fileStorage';

export const getBatches = async (req: any, res: Response) => {
  try {
    const { status, search } = req.query;
    const batches = await storage.findBatches({ status, search });
    const companies = await storage.findAllCompanies();
    
    const batchesWithDetails = batches.map(batch => {
      const producer = companies.find(c => c.id === batch.producerId);
      return {
        ...batch,
        producerName: producer?.name || '未知',
      };
    });

    res.json({
      success: true,
      data: batchesWithDetails,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBatch = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await storage.findBatch(id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: '批次不存在',
      });
    }

    const companies = await storage.findAllCompanies();
    const producer = companies.find(c => c.id === batch.producerId);
    
    // 获取该批次的温控数据
    const temperatureData = await storage.findTemperatureData({ batchId: id });
    
    // 获取该批次的告警
    const alerts = await storage.findAlerts({ batchId: id });
    
    // 获取该批次的异常事件
    const incidents = await storage.findIncidents({ batchId: id });

    res.json({
      success: true,
      data: {
        ...batch,
        producerName: producer?.name || '未知',
        temperatureData: temperatureData.slice(-100), // 最近100条
        alerts,
        incidents,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBatch = async (req: any, res: Response) => {
  try {
    const batch = await storage.createBatch(req.body);
    res.json({
      success: true,
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBatch = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await storage.updateBatch(id, req.body);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: '批次不存在',
      });
    }

    res.json({
      success: true,
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
