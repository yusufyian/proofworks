import { Response } from 'express';
import storage from '../storage/fileStorage';

export const getTransports = async (req: any, res: Response) => {
  try {
    const { fromCompanyId, toCompanyId, status, search } = req.query;
    const transports = await storage.findTransports({
      fromCompanyId,
      toCompanyId,
      status,
      search,
    });

    const companies = await storage.findAllCompanies();
    const batches = await storage.findBatches();

    const transportsWithDetails = transports.map(transport => {
      const fromCompany = companies.find(c => c.id === transport.fromCompanyId);
      const toCompany = companies.find(c => c.id === transport.toCompanyId);
      const transportBatches = batches.filter(b => transport.batchIds.includes(b.id));
      
      return {
        ...transport,
        fromCompanyName: fromCompany?.name || '未知',
        toCompanyName: toCompany?.name || '未知',
        batches: transportBatches,
        batchCount: transportBatches.length,
      };
    });

    res.json({
      success: true,
      data: transportsWithDetails,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransport = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const transport = await storage.findTransport(id);
    
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: '运输单不存在',
      });
    }

    const companies = await storage.findAllCompanies();
    const batches = await storage.findBatches();
    const devices = await storage.findDevices();

    const fromCompany = companies.find(c => c.id === transport.fromCompanyId);
    const toCompany = companies.find(c => c.id === transport.toCompanyId);
    const transportBatches = batches.filter(b => transport.batchIds.includes(b.id));
    const vehicle = transport.vehicleId ? devices.find(d => d.id === transport.vehicleId) : null;

    // 获取运输过程中的温控数据
    const allBatchIds = transport.batchIds;
    const temperatureData = await storage.findTemperatureData({
      startTime: transport.startTime,
      endTime: transport.endTime,
    }).then(data => data.filter(d => d.batchId && allBatchIds.includes(d.batchId)));

    // 获取运输过程中的告警
    const alerts = await storage.findAlerts({
      startTime: transport.startTime,
      endTime: transport.endTime,
    }).then(alerts => alerts.filter(a => a.batchId && allBatchIds.includes(a.batchId)));

    res.json({
      success: true,
      data: {
        ...transport,
        fromCompanyName: fromCompany?.name || '未知',
        toCompanyName: toCompany?.name || '未知',
        batches: transportBatches,
        vehicleName: vehicle?.name,
        temperatureData,
        alerts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createTransport = async (req: any, res: Response) => {
  try {
    const transport = await storage.createTransport(req.body);
    res.json({
      success: true,
      data: transport,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTransport = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const transport = await storage.updateTransport(id, req.body);
    
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: '运输单不存在',
      });
    }

    res.json({
      success: true,
      data: transport,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
