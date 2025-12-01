import { Request, Response } from 'express';
import { FileStorage } from '../storage/fileStorage';
import { format, subDays, parseISO, startOfDay, endOfDay, differenceInHours } from 'date-fns';
import { TransferEvent } from '../types';

// 获取概览数据
export const getOverview = (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? parseISO(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? parseISO(endDate as string) : new Date();

    const products = FileStorage.getProducts();
    const batches = FileStorage.getBatches();
    const events = FileStorage.getEvents();
    const recalls = FileStorage.getRecalls();
    
    // 优化：只加载时间范围内的IoT数据，而不是全部
    // 先过滤事件获取时间范围，然后只处理相关的IoT数据
    const allIoTData = FileStorage.getIoTData();
    
    // 过滤时间范围内的数据
    const filteredBatches = batches.filter(b => {
      const batchDate = parseISO(b.productionDate);
      return batchDate >= start && batchDate <= end;
    });

    const filteredEvents = events.filter(e => {
      const eventDate = parseISO(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });
    
    // 只处理时间范围内的IoT数据（基于事件时间范围）
    const filteredIoTData = allIoTData.filter(d => {
      const dataDate = parseISO(d.timestamp);
      return dataDate >= start && dataDate <= end;
    });

    // 宏观KPI
    const totalProducts = products.length;
    const totalBatches = filteredBatches.length;
    const totalEvents = filteredEvents.length;
    const totalRecalls = recalls.filter(r => {
      const recallDate = parseISO(r.initiatedAt);
      return recallDate >= start && recallDate <= end;
    }).length;

    // 追溯覆盖率（有事件的批次占比）
    const batchesWithEvents = new Set(filteredEvents.map(e => e.batchId));
    const traceabilityCoverage = filteredBatches.length > 0 
      ? (batchesWithEvents.size / filteredBatches.length) * 100 
      : 0;

    // 合规率（合格批次占比）
    const qualifiedBatches = filteredBatches.filter(b => b.status === '合格').length;
    const complianceRate = filteredBatches.length > 0 
      ? (qualifiedBatches / filteredBatches.length) * 100 
      : 0;

    // 召回率
    const recallRate = filteredBatches.length > 0 
      ? (totalRecalls / filteredBatches.length) * 100 
      : 0;

    // 温度合规率（基于IoT数据）- 使用已过滤的数据
    const tempData = filteredIoTData.filter(d => d.sensorType === 'temperature' && typeof d.value === 'number');
    const validTempData = tempData.filter(d => {
      const temp = d.value as number;
      return temp >= 2 && temp <= 8; // 2-8°C为合规范围
    });
    const tempComplianceRate = tempData.length > 0 
      ? (validTempData.length / tempData.length) * 100 
      : 0;

    // 趋势数据（根据日期范围生成）
    const trendData = [];
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // 根据日期范围决定粒度：<=30天按天，<=90天按周，>90天按月
    let granularity: 'day' | 'week' | 'month' = 'day';
    if (daysDiff > 90) {
      granularity = 'month';
    } else if (daysDiff > 30) {
      granularity = 'week';
    }
    
    if (granularity === 'day') {
      // 按天生成数据
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayBatches = filteredBatches.filter(b => {
          const batchDate = parseISO(b.productionDate);
          return batchDate >= dayStart && batchDate <= dayEnd;
        });
        
        const dayEvents = filteredEvents.filter(e => {
          const eventDate = parseISO(e.timestamp);
          return eventDate >= dayStart && eventDate <= dayEnd;
        });

        trendData.push({
          date: format(date, 'yyyy-MM-dd'),
          batches: dayBatches.length,
          events: dayEvents.length,
        });
      }
    } else if (granularity === 'week') {
      // 按周生成数据
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const weekStart = startOfDay(currentDate);
        let weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > end) {
          weekEnd = new Date(end);
        }
        const weekEndDay = endOfDay(weekEnd);
        
        const weekBatches = filteredBatches.filter(b => {
          const batchDate = parseISO(b.productionDate);
          return batchDate >= weekStart && batchDate <= weekEndDay;
        });
        
        const weekEvents = filteredEvents.filter(e => {
          const eventDate = parseISO(e.timestamp);
          return eventDate >= weekStart && eventDate <= weekEndDay;
        });

        trendData.push({
          date: format(weekStart, 'yyyy-MM-dd'),
          batches: weekBatches.length,
          events: weekEvents.length,
        });
        
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else {
      // 按月生成数据
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        let monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        if (monthEnd > end) {
          monthEnd = new Date(end);
        }
        const monthEndDay = endOfDay(monthEnd);
        
        const monthBatches = filteredBatches.filter(b => {
          const batchDate = parseISO(b.productionDate);
          return batchDate >= monthStart && batchDate <= monthEndDay;
        });
        
        const monthEvents = filteredEvents.filter(e => {
          const eventDate = parseISO(e.timestamp);
          return eventDate >= monthStart && eventDate <= monthEndDay;
        });

        trendData.push({
          date: format(monthStart, 'yyyy-MM'),
          batches: monthBatches.length,
          events: monthEvents.length,
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    res.json({
      success: true,
      data: {
        kpis: {
          totalProducts,
          totalBatches,
          totalEvents,
          totalRecalls,
          traceabilityCoverage: Math.round(traceabilityCoverage * 100) / 100,
          complianceRate: Math.round(complianceRate * 100) / 100,
          recallRate: Math.round(recallRate * 100) / 100,
          tempComplianceRate: Math.round(tempComplianceRate * 100) / 100,
        },
        trends: trendData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取趋势数据
export const getTrends = (req: Request, res: Response) => {
  try {
    const { metric, startDate, endDate, granularity = 'day' } = req.query;
    const start = startDate ? parseISO(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? parseISO(endDate as string) : new Date();

    const batches = FileStorage.getBatches();
    const events = FileStorage.getEvents();
    const iotData = FileStorage.getIoTData();

    const filteredBatches = batches.filter(b => {
      const batchDate = parseISO(b.productionDate);
      return batchDate >= start && batchDate <= end;
    });

    const filteredEvents = events.filter(e => {
      const eventDate = parseISO(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    const filteredIoTData = iotData.filter(d => {
      const dataDate = parseISO(d.timestamp);
      return dataDate >= start && dataDate <= end;
    });

    const trendData: any[] = [];
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      let value = 0;
      
      switch (metric) {
        case 'batches':
          value = filteredBatches.filter(b => {
            const batchDate = parseISO(b.productionDate);
            return batchDate >= dayStart && batchDate <= dayEnd;
          }).length;
          break;
        case 'events':
          value = filteredEvents.filter(e => {
            const eventDate = parseISO(e.timestamp);
            return eventDate >= dayStart && eventDate <= dayEnd;
          }).length;
          break;
        case 'temperature':
          const dayTempData = filteredIoTData.filter(d => {
            const dataDate = parseISO(d.timestamp);
            return dataDate >= dayStart && dataDate <= dayEnd && d.sensorType === 'temperature' && typeof d.value === 'number';
          });
          if (dayTempData.length > 0) {
            const temps = dayTempData.map(d => d.value as number);
            value = temps.reduce((a, b) => a + b, 0) / temps.length;
          }
          break;
        case 'compliance':
          const dayBatches = filteredBatches.filter(b => {
            const batchDate = parseISO(b.productionDate);
            return batchDate >= dayStart && batchDate <= dayEnd;
          });
          const qualified = dayBatches.filter(b => b.status === '合格').length;
          value = dayBatches.length > 0 ? (qualified / dayBatches.length) * 100 : 0;
          break;
        default:
          value = 0;
      }

      trendData.push({
        date: format(date, 'yyyy-MM-dd'),
        value: Math.round(value * 100) / 100,
      });
    }

    res.json({ success: true, data: trendData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取质量分析
export const getQualityAnalysis = (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? parseISO(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? parseISO(endDate as string) : new Date();

    const batches = FileStorage.getBatches();
    const products = FileStorage.getProducts();
    const events = FileStorage.getEvents();

    const filteredBatches = batches.filter(b => {
      const batchDate = parseISO(b.productionDate);
      return batchDate >= start && batchDate <= end;
    });

    // 按状态统计
    const statusStats = filteredBatches.reduce((acc, batch) => {
      acc[batch.status] = (acc[batch.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按产品类别统计
    const categoryStats = filteredBatches.reduce((acc, batch) => {
      const product = products.find(p => p.id === batch.productId);
      if (product) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // 质检不合格项统计
    const qualityIssues: Record<string, number> = {};
    filteredBatches.forEach(batch => {
      batch.qualityReports.forEach(report => {
        if (report.result !== '合格' && report.result !== '未检出' && report.result !== '符合标准') {
          qualityIssues[report.testItem] = (qualityIssues[report.testItem] || 0) + 1;
        }
      });
    });

    // 检测事件统计
    const testEvents = events.filter(e => 
      e.eventType.includes('检测') && 
      parseISO(e.timestamp) >= start && 
      parseISO(e.timestamp) <= end
    );

    const testResults = testEvents.reduce((acc, event) => {
      const result = event.content.testResult || '未知';
      acc[result] = (acc[result] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        statusStats,
        categoryStats,
        qualityIssues,
        testResults,
        totalBatches: filteredBatches.length,
        qualifiedBatches: filteredBatches.filter(b => b.status === '合格').length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取物流绩效分析
export const getLogisticsAnalysis = (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? parseISO(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? parseISO(endDate as string) : new Date();

    const events = FileStorage.getEvents();
    const batches = FileStorage.getBatches();

    const filteredEvents = events.filter(e => {
      const eventDate = parseISO(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    // 物流相关事件（包括门店上架，用于计算门店停留时间）
    const logisticsEvents = filteredEvents.filter(e => 
      ['装车', '运输', '到货', '入库', '出库', '上架'].includes(e.eventType)
    );

    // 计算各环节停留时间
    const traceCodes = new Set(logisticsEvents.map(e => e.traceCode));
    const stayTimes: Record<string, number[]> = {
      '仓储': [],
      '运输': [],
      '门店': [],
    };

    traceCodes.forEach(traceCode => {
      const codeEvents = logisticsEvents
        .filter(e => e.traceCode === traceCode)
        .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

      // 查找装车事件和对应的到货事件
      let loadEvent: TransferEvent | null = null;
      
      for (let i = 0; i < codeEvents.length; i++) {
        const current = codeEvents[i];
        
        // 找到装车事件
        if (current.eventType === '装车' && !loadEvent) {
          loadEvent = current;
        }
        
        // 如果已有装车事件，查找对应的到货事件
        if (loadEvent && current.eventType === '到货') {
          const hours = differenceInHours(parseISO(current.timestamp), parseISO(loadEvent.timestamp));
          if (hours > 0) {
            stayTimes['运输'].push(hours);
          }
          loadEvent = null; // 重置，准备查找下一组
        }
      }
      
      // 计算仓储停留时间（相邻事件）
      for (let i = 0; i < codeEvents.length - 1; i++) {
        const current = codeEvents[i];
        const next = codeEvents[i + 1];
        
        if (current.eventType === '入库' && next.eventType === '出库') {
          const hours = differenceInHours(parseISO(next.timestamp), parseISO(current.timestamp));
          stayTimes['仓储'].push(hours);
        }
      }
      
      // 计算门店停留时间：查找门店入库（在"到货"之后的"入库"）和对应的"上架"事件
      let storeInEvent: TransferEvent | null = null;
      let foundArrival = false;
      
      for (let i = 0; i < codeEvents.length; i++) {
        const current = codeEvents[i];
        
        // 找到"到货"事件，标记已到达门店
        if (current.eventType === '到货') {
          foundArrival = true;
        }
        
        // 如果已到达门店，查找门店入库事件
        if (foundArrival && current.eventType === '入库' && !storeInEvent) {
          storeInEvent = current;
        }
        
        // 如果已有门店入库事件，查找对应的上架事件
        if (storeInEvent && current.eventType === '上架') {
          const hours = differenceInHours(parseISO(current.timestamp), parseISO(storeInEvent.timestamp));
          if (hours > 0) {
            stayTimes['门店'].push(hours);
          }
          // 重置，准备查找下一组
          storeInEvent = null;
          foundArrival = false;
        }
      }
    });

    // 计算平均停留时间
    const avgStayTimes = Object.keys(stayTimes).reduce((acc, key) => {
      const times = stayTimes[key];
      acc[key] = times.length > 0 
        ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100
        : 0;
      return acc;
    }, {} as Record<string, number>);

    // 按地点统计
    const locationStats = logisticsEvents.reduce((acc, event) => {
      const location = event.location.name;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按操作员统计
    const operatorStats = logisticsEvents.reduce((acc, event) => {
      const operator = event.operator.name;
      acc[operator] = (acc[operator] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        avgStayTimes,
        locationStats,
        operatorStats,
        totalLogisticsEvents: logisticsEvents.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取温控合规分析
export const getTemperatureAnalysis = (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? parseISO(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? parseISO(endDate as string) : new Date();

    const iotData = FileStorage.getIoTData();
    const events = FileStorage.getEvents();

    const filteredIoTData = iotData.filter(d => {
      const dataDate = parseISO(d.timestamp);
      return dataDate >= start && dataDate <= end && d.sensorType === 'temperature' && typeof d.value === 'number';
    });

    // 温度分布统计
    const tempRanges = {
      '超低温(<0°C)': 0,
      '低温(0-2°C)': 0,
      '正常(2-8°C)': 0,
      '偏高(8-10°C)': 0,
      '高温(>10°C)': 0,
    };

    filteredIoTData.forEach(data => {
      const temp = data.value as number;
      if (temp < 0) tempRanges['超低温(<0°C)']++;
      else if (temp < 2) tempRanges['低温(0-2°C)']++;
      else if (temp <= 8) tempRanges['正常(2-8°C)']++;
      else if (temp <= 10) tempRanges['偏高(8-10°C)']++;
      else tempRanges['高温(>10°C)']++;
    });

    // 温度趋势（按天）
    const tempTrend: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    filteredIoTData.forEach(data => {
      const date = format(parseISO(data.timestamp), 'yyyy-MM-dd');
      const temp = data.value as number;
      
      if (!tempTrend[date]) {
        tempTrend[date] = { avg: 0, min: temp, max: temp, count: 0 };
      }
      
      tempTrend[date].min = Math.min(tempTrend[date].min, temp);
      tempTrend[date].max = Math.max(tempTrend[date].max, temp);
      tempTrend[date].avg += temp;
      tempTrend[date].count++;
    });

    Object.keys(tempTrend).forEach(date => {
      const day = tempTrend[date];
      day.avg = Math.round((day.avg / day.count) * 100) / 100;
    });

    // 异常事件统计
    const abnormalEvents = events.filter(e => 
      e.eventType === '温度异常' && 
      parseISO(e.timestamp) >= start && 
      parseISO(e.timestamp) <= end
    );

    // 合规率
    const validTempData = filteredIoTData.filter(d => {
      const temp = d.value as number;
      return temp >= 2 && temp <= 8;
    });
    const complianceRate = filteredIoTData.length > 0 
      ? (validTempData.length / filteredIoTData.length) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        tempRanges,
        tempTrend: Object.keys(tempTrend).map(date => ({
          date,
          ...tempTrend[date],
        })),
        abnormalEvents: abnormalEvents.length,
        complianceRate: Math.round(complianceRate * 100) / 100,
        totalDataPoints: filteredIoTData.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取地理热力图数据
export const getHeatmap = (req: Request, res: Response) => {
  try {
    const { dimension = 'region', startDate, endDate } = req.query;
    const start = startDate ? parseISO(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? parseISO(endDate as string) : new Date();

    const events = FileStorage.getEvents();
    const filteredEvents = events.filter(e => {
      const eventDate = parseISO(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    const heatmapData: Record<string, { count: number; gps: [number, number] }> = {};

    filteredEvents.forEach(event => {
      const key = dimension === 'region' 
        ? event.location.name.split('XX')[0] || event.location.name
        : event.location.name;
      
      if (!heatmapData[key]) {
        heatmapData[key] = {
          count: 0,
          gps: event.location.gps,
        };
      }
      heatmapData[key].count++;
    });

    res.json({
      success: true,
      data: Object.keys(heatmapData).map(key => ({
        name: key,
        count: heatmapData[key].count,
        gps: heatmapData[key].gps,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

