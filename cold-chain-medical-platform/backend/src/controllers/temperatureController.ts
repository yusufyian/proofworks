import { Response } from 'express';
import storage from '../storage/fileStorage';

export const getTemperatureData = async (req: any, res: Response) => {
  try {
    const { deviceId, batchId, startTime, endTime } = req.query;
    const data = await storage.findTemperatureData({
      deviceId,
      batchId,
      startTime,
      endTime,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createTemperatureData = async (req: any, res: Response) => {
  try {
    const data = await storage.createTemperatureData(req.body);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



