import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

export const getIoTData = async (req: AuthRequest, res: Response) => {
  try {
    const { equipmentId, startTime, endTime } = req.query;
    const data = await storage.findIoTData({
      equipmentId: equipmentId as string,
      startTime: startTime as string,
      endTime: endTime as string,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || '获取IoT数据失败' },
    });
  }
};

export const createIoTData = async (req: AuthRequest, res: Response) => {
  try {
    const iotData = await storage.createIoTData(req.body);
    res.status(201).json({ success: true, data: iotData });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || '创建IoT数据失败' },
    });
  }
};

