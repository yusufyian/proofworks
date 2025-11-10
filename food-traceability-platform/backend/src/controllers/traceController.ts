import { Request, Response } from 'express';
import { FileStorage } from '../storage/fileStorage';
import { TraceResult } from '../types';

export const traceByCode = (req: Request, res: Response) => {
  try {
    const { traceCode } = req.params;
    
    // 根据追溯码查找批次
    const batch = FileStorage.getBatchByTraceCode(traceCode);
    
    if (!batch) {
      return res.status(404).json({ success: false, error: '追溯码不存在' });
    }
    
    // 获取产品信息
    const product = FileStorage.getProduct(batch.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: '产品信息不存在' });
    }
    
    // 获取流转事件 - 优先使用 batchId 查询，如果为空则尝试使用 traceCode
    let events = FileStorage.getEventsByBatchId(batch.id);
    
    // 如果通过 batchId 找不到事件，尝试使用 traceCode 精确匹配
    if (events.length === 0) {
      events = FileStorage.getEventsByTraceCode(traceCode);
    }
    
    // 如果还是找不到，尝试匹配所有以该批次前缀开头的追溯码的事件
    if (events.length === 0) {
      const allEvents = FileStorage.getEvents();
      events = allEvents.filter(e => e.traceCode.startsWith(batch.traceCodePrefix));
    }
    
    // 获取IoT数据 - 同样优先使用 batchId
    let iotData = FileStorage.getIoTDataByBatchId(batch.id);
    if (iotData.length === 0) {
      iotData = FileStorage.getIoTDataByTraceCode(traceCode);
    }
    if (iotData.length === 0) {
      const allIoTData = FileStorage.getIoTData();
      iotData = allIoTData.filter(d => d.traceCode && d.traceCode.startsWith(batch.traceCodePrefix));
    }
    
    // 获取召回信息
    const recalls = FileStorage.getRecalls();
    const recall = recalls.find(r => r.batchId === batch.id);
    
    const result: TraceResult = {
      product,
      batch,
      events: events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      iotData: iotData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      recall
    };
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const traceByBatch = (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    
    const batch = FileStorage.getBatch(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, error: '批次不存在' });
    }
    
    const product = FileStorage.getProduct(batch.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: '产品信息不存在' });
    }
    
    const events = FileStorage.getEventsByBatchId(batchId);
    const iotData = FileStorage.getIoTDataByBatchId(batchId);
    const recalls = FileStorage.getRecalls();
    const recall = recalls.find(r => r.batchId === batchId);
    
    const result: TraceResult = {
      product,
      batch,
      events: events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      iotData: iotData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      recall
    };
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取示例追溯码
export const getSampleTraceCodes = (req: Request, res: Response) => {
  try {
    const batches = FileStorage.getBatches();
    
    // 获取前10个批次，每个批次生成5个示例追溯码
    const sampleCodes: string[] = [];
    batches.slice(0, 10).forEach(batch => {
      for (let serial = 1; serial <= 5; serial++) {
        const checkDigit = (parseInt(batch.traceCodePrefix.slice(-1)) + serial) % 10;
        const traceCode = `${batch.traceCodePrefix}${serial.toString().padStart(3, '0')}${checkDigit}`;
        sampleCodes.push(traceCode);
      }
    });
    
    res.json({ 
      success: true, 
      data: {
        sampleCodes: sampleCodes.slice(0, 20), // 返回前20个示例码
        total: sampleCodes.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
