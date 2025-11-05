import { Response } from 'express';
import storage from '../storage/fileStorage';

export const getDevices = async (req: any, res: Response) => {
  try {
    const { type, status } = req.query;
    const devices = await storage.findDevices({ type, status });
    res.json({
      success: true,
      data: devices,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDevice = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const device = await storage.findDevice(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: '设备不存在',
      });
    }

    // 获取设备最近的温控数据
    const temperatureData = await storage.findTemperatureData({
      deviceId: id,
    }).then(data => data.slice(-100));

    res.json({
      success: true,
      data: {
        ...device,
        recentTemperatureData: temperatureData,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDevice = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const device = await storage.updateDevice(id, req.body);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: '设备不存在',
      });
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



