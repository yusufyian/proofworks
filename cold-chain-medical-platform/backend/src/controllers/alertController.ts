import { Response } from 'express';
import storage from '../storage/fileStorage';

export const getAlerts = async (req: any, res: Response) => {
  try {
    const { batchId, deviceId, status, level, startTime, endTime } = req.query;
    const alerts = await storage.findAlerts({
      batchId,
      deviceId,
      status,
      level,
      startTime,
      endTime,
    });

    const batches = await storage.findBatches();
    const devices = await storage.findDevices();

    const alertsWithDetails = alerts.map(alert => {
      const batch = alert.batchId ? batches.find(b => b.id === alert.batchId) : null;
      const device = devices.find(d => d.id === alert.deviceId);
      return {
        ...alert,
        batchNo: batch?.batchNo,
        productName: batch?.productName,
        deviceName: device?.name,
      };
    });

    res.json({
      success: true,
      data: alertsWithDetails,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAlert = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await storage.findAlert(id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '告警不存在',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAlert = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await storage.updateAlert(id, req.body);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '告警不存在',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const acknowledgeAlert = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await storage.updateAlert(id, {
      status: 'acknowledged',
      handlerId: req.user?.userId,
      handledAt: new Date().toISOString(),
    });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '告警不存在',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resolveAlert = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const alert = await storage.updateAlert(id, {
      status: 'resolved',
      handlerId: req.user?.userId,
      handledAt: new Date().toISOString(),
      resolution: resolution || '已处理',
    });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '告警不存在',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
