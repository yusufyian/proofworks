import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';
import dayjs from 'dayjs';

export const getRealTimeData = async (req: AuthRequest, res: Response) => {
  try {
    const { deviceId, batchId, hours = '24' } = req.query;
    
    const filter: any = {};
    if (deviceId) filter.deviceId = deviceId as string;
    if (batchId) filter.batchId = batchId as string;
    
    const hoursNum = parseInt(hours as string);
    filter.startTime = dayjs().subtract(hoursNum, 'hour').toISOString();
    filter.endTime = dayjs().toISOString();

    const records = await storage.findTemperatureRecords(filter);
    
    res.json({
      data: records,
      total: records.length,
    });
  } catch (error) {
    console.error('获取实时监控数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const getDeviceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const devices = await storage.findDevices();
    
    // 获取每个设备的最新温度记录
    const deviceStatuses = await Promise.all(
      devices.map(async (device) => {
        const recentRecords = await storage.findTemperatureRecords({
          deviceId: device.id,
          startTime: dayjs().subtract(1, 'hour').toISOString(),
        });
        
        const latestRecord = recentRecords[recentRecords.length - 1];
        
        return {
          ...device,
          latestRecord: latestRecord ? {
            temperature: latestRecord.temperature,
            humidity: latestRecord.humidity,
            timestamp: latestRecord.timestamp,
          } : null,
          recordCount: recentRecords.length,
        };
      })
    );

    res.json({
      data: deviceStatuses,
      total: deviceStatuses.length,
    });
  } catch (error) {
    console.error('获取设备状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

