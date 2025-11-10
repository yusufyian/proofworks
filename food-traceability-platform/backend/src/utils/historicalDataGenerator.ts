import { format, addDays, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from '../storage/fileStorage';
import { Product, Batch, TransferEvent, IoTData } from '../types';
import { subHours, subMinutes, addHours } from 'date-fns';
import { DataGenerator } from './dataGenerator';

/**
 * 生成历史模拟数据（从6月1日到现在）
 */
export class HistoricalDataGenerator {
  /**
   * 生成从指定开始日期到现在的历史数据
   */
  static generateHistoricalData(startDate: Date = new Date(2024, 5, 1)): {
    batches: Batch[];
    events: TransferEvent[];
    iotData: IoTData[];
  } {
    const today = new Date();
    const daysDiff = differenceInDays(today, startDate);
    
    console.log(`开始生成历史数据：从 ${format(startDate, 'yyyy-MM-dd')} 到 ${format(today, 'yyyy-MM-dd')}，共 ${daysDiff} 天`);
    
    const products = FileStorage.getProducts();
    if (products.length === 0) {
      throw new Error('请先生成产品数据');
    }
    
    const batches: Batch[] = [];
    const events: TransferEvent[] = [];
    const iotData: IoTData[] = [];
    
    const productCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
    
    // 获取企业代码映射
    const companyCodeMap = new Map<string, string>();
    const existingBatches = FileStorage.getBatches();
    if (existingBatches.length > 0) {
      existingBatches.forEach(batch => {
        const companyCode = batch.traceCodePrefix.substring(0, 6);
        const companyName = products.find(p => p.id === batch.productId)?.manufacturer.name || '';
        if (companyName && !companyCodeMap.has(companyName)) {
          companyCodeMap.set(companyName, companyCode);
        }
      });
    }
    
    // 为每个产品分配企业代码
    products.forEach(product => {
      if (!companyCodeMap.has(product.manufacturer.name)) {
        companyCodeMap.set(product.manufacturer.name, '310115');
      }
    });
    
    // 每天生成数据
    for (let dayOffset = 0; dayOffset <= daysDiff; dayOffset++) {
      const currentDate = addDays(startDate, dayOffset);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // 每天生成3-10个批次（周末稍少，工作日稍多）
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const batchesPerDay = isWeekend 
        ? Math.floor(Math.random() * 4) + 2  // 周末：2-5个
        : Math.floor(Math.random() * 6) + 4; // 工作日：4-9个
      
      // 随机选择产品
      const selectedProducts = products
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(batchesPerDay, products.length));
      
      selectedProducts.forEach((product, index) => {
        const batchNum = (index + 1).toString().padStart(2, '0');
        const productIndex = products.indexOf(product);
        const productCode = productCodes[productIndex % productCodes.length];
        const companyCode = companyCodeMap.get(product.manufacturer.name) || '310115';
        const dateStrForCode = format(currentDate, 'yyyyMMdd');
        
        const batch: Batch = {
          id: uuidv4(),
          batchNumber: `${dateStrForCode}${batchNum}`,
          traceCodePrefix: `${companyCode}${productCode}${dateStrForCode}${batchNum}`,
          productId: product.id,
          productionDate: dateStr,
          expiryDays: Math.floor(Math.random() * 15 + 5),
          quantity: Math.floor(Math.random() * 5000 + 1000),
          unit: '盒',
          ingredients: [
            { name: '主料', batchNumber: `ING${dateStrForCode}01`, amount: 100 },
            { name: '辅料', batchNumber: `ING${dateStrForCode}02`, amount: 20 }
          ],
          qualityReports: [
            {
              testItem: '农残检测',
              result: Math.random() > 0.1 ? '未检出' : '合格',
              agency: 'XX质量检测中心',
              reportNumber: `QR${dateStrForCode}${index + 1}`,
              reportHash: `hash_${uuidv4()}`,
              testDate: dateStr
            },
            {
              testItem: '微生物检测',
              result: Math.random() > 0.1 ? '合格' : '符合标准',
              agency: 'XX质量检测中心',
              reportNumber: `QR${dateStrForCode}${index + 1}_2`,
              reportHash: `hash_${uuidv4()}`,
              testDate: dateStr
            }
          ],
          status: Math.random() > 0.15 ? '合格' : (Math.random() > 0.5 ? '生产中' : '合格'),
          createdAt: format(addHours(startOfDay(currentDate), Math.floor(Math.random() * 8) + 8), 'yyyy-MM-dd HH:mm:ss'),
          updatedAt: format(addHours(startOfDay(currentDate), Math.floor(Math.random() * 8) + 8), 'yyyy-MM-dd HH:mm:ss')
        };
        
        batches.push(batch);
        
        // 为每个批次生成完整的事件链和IoT数据
        const batchEvents = this.generateEventsForBatch(batch, currentDate);
        const batchIoTData = this.generateIoTDataForBatch(batch, currentDate);
        
        events.push(...batchEvents);
        iotData.push(...batchIoTData);
      });
      
      // 每10天输出一次进度
      if (dayOffset % 10 === 0) {
        console.log(`  已生成 ${dayOffset + 1} 天的数据...`);
      }
    }
    
    console.log(`✅ 历史数据生成完成：${batches.length}个批次，${events.length}个事件，${iotData.length}个IoT数据点`);
    
    return { batches, events, iotData };
  }
  
  /**
   * 为单个批次生成完整的事件链
   */
  private static generateEventsForBatch(batch: Batch, productionDate: Date): TransferEvent[] {
    const events: TransferEvent[] = [];
    
    const fullEventChain: Array<'播种' | '施肥' | '收获' | '加工' | '包装' | '农残检测' | '营养成分' | '微生物检测' | '入库' | '出库' | '装车' | '运输' | '到货' | '上架'> = [
      '播种', '施肥', '收获',
      '加工', '加工', '包装',
      '农残检测', '营养成分', '微生物检测',
      '入库', '出库',
      '装车', '运输', '运输', '运输', '到货',
      '入库', '上架'
    ];
    
    const operators = [
      { name: '孙海峰', company: '绿源生态农业有限公司', role: '种植工人' },
      { name: '马志强', company: '绿源生态农业有限公司', role: '种植工人' },
      { name: '徐文涛', company: '绿源生态农业有限公司', role: '种植工人' },
      { name: '张明华', company: '绿源生态农业有限公司', role: '生产主管' },
      { name: '陈永军', company: '绿源生态农业有限公司', role: '生产工人' },
      { name: '刘建军', company: '绿源生态农业有限公司', role: '加工工人' },
      { name: '李雅静', company: 'XX质量检测中心', role: '质检员' },
      { name: '刘美玲', company: 'XX质量检测中心', role: '检测员' },
      { name: '赵晓雯', company: 'XX质量检测中心', role: '高级检测师' },
      { name: '王建国', company: 'XX仓储中心', role: '仓库管理员' },
      { name: '杨国强', company: 'XX仓储中心', role: '仓库主管' },
      { name: '周文博', company: 'XX物流公司', role: '物流司机' },
      { name: '黄秀英', company: 'XX物流公司', role: '物流调度' },
      { name: '马建军', company: 'XX物流公司', role: '物流司机' },
      { name: '徐志强', company: 'XX物流公司', role: '运输队长' },
      { name: '赵文华', company: 'XX物流公司', role: '物流司机' },
      { name: '吴晓丽', company: 'XX超市', role: '销售经理' },
      { name: '钱慧敏', company: 'XX超市', role: '门店主管' }
    ];

    const locations: Array<{ name: string; gps: [number, number] }> = [
      { name: '烟台XX农场', gps: [37.3059, 120.8357] },
      { name: '寿光XX种植基地', gps: [36.8567, 118.7875] },
      { name: '南京XX加工厂', gps: [31.6531, 119.0154] },
      { name: '上海XX仓储中心', gps: [31.2304, 121.4737] },
      { name: '北京XX配送中心', gps: [39.9042, 116.4074] },
      { name: '成都XX超市', gps: [30.6624, 104.0633] },
      { name: '广州XX批发市场', gps: [23.1291, 113.2644] },
      { name: 'XX质量检测中心', gps: [31.2304, 121.4737] },
      { name: 'XX物流中转站', gps: [36.8567, 118.7875] },
      { name: 'XX超市（销售门店）', gps: [31.2304, 121.4737] }
    ];

    // 为每个批次生成5个示例追溯码
    const sampleSerials = Array.from({ length: 5 }, (_, i) => i + 1);
    
    sampleSerials.forEach(serial => {
      const checkDigit = (parseInt(batch.traceCodePrefix.slice(-1)) + serial) % 10;
      const traceCode = `${batch.traceCodePrefix}${serial.toString().padStart(3, '0')}${checkDigit}`;
      
      // 为每个追溯码生成完整的事件链
      fullEventChain.forEach((eventType, index) => {
        // 时间从生产日期往前推，越早的事件时间越早
        const hoursBefore = (fullEventChain.length - index) * 2;
        const eventTime = subHours(startOfDay(productionDate), hoursBefore);
        
        let operator = operators[index % operators.length];
        let location = locations[index % locations.length];
        
        // 根据事件类型和阶段智能分配操作员和地点
        if (index < 3) {
          operator = operators[index % 3];
          location = locations[0];
        } else if (index < 6) {
          operator = operators[3 + ((index - 3) % 3)];
          location = locations[2];
        } else if (index < 9) {
          operator = operators[6 + ((index - 6) % 3)];
          location = locations[7];
        } else if (index < 11) {
          operator = operators[9 + ((index - 9) % 2)];
          location = locations[3];
        } else if (index < 16) {
          operator = operators[11 + ((index - 11) % 5)];
          if (index === 13) {
            location = locations[8];
          } else if (index === 15) {
            location = locations[4];
          } else {
            location = locations[Math.floor(Math.random() * locations.length)];
          }
        } else {
          operator = operators[16 + ((index - 16) % 2)];
          location = locations[9];
        }
        
        const event: TransferEvent = {
          id: uuidv4(),
          traceCode: traceCode,
          batchId: batch.id,
          eventType: eventType,
          timestamp: format(eventTime, 'yyyy-MM-dd HH:mm:ss'),
          operator: operator,
          location: {
            name: location.name,
            gps: location.gps
          },
          content: {
            quantity: eventType === '收获' ? batch.quantity : Math.floor(Math.random() * 100 + 10),
            temperature: (eventType === '运输' || eventType === '入库' || eventType === '到货') ? Math.floor(Math.random() * 6 + 2) : undefined,
            humidity: eventType === '入库' ? Math.floor(Math.random() * 20 + 60) : undefined,
            notes: `${eventType}操作完成${index < 3 ? '（种植阶段）' : index < 6 ? '（加工阶段）' : index < 9 ? '（质检阶段）' : index < 11 ? '（仓储阶段）' : index < 16 ? '（物流阶段）' : '（销售阶段）'}`,
            ...(eventType.includes('检测') ? {
              testResult: eventType === '农残检测' ? '未检出' : eventType === '营养成分' ? '合格' : '符合标准'
            } : {})
          },
          attachments: [],
          signature: `sig_${uuidv4()}`,
          blockHeight: Math.floor(Math.random() * 100000) + 10000 + index,
          txHash: `0x${Math.random().toString(16).substring(2, 66)}`
        };
        
        events.push(event);
      });
    });
    
    return events;
  }
  
  /**
   * 为单个批次生成IoT数据
   */
  private static generateIoTDataForBatch(batch: Batch, productionDate: Date): IoTData[] {
    const iotData: IoTData[] = [];
    
    const locations: Array<{ name: string; gps: [number, number] }> = [
      { name: '烟台XX农场', gps: [37.3059, 120.8357] },
      { name: '寿光XX种植基地', gps: [36.8567, 118.7875] },
      { name: '南京XX加工厂', gps: [31.6531, 119.0154] },
      { name: '上海XX仓储中心', gps: [31.2304, 121.4737] },
      { name: '北京XX配送中心', gps: [39.9042, 116.4074] },
      { name: '成都XX超市', gps: [30.6624, 104.0633] },
      { name: '广州XX批发市场', gps: [23.1291, 113.2644] },
    ];

    const sampleSerials = Array.from({ length: 5 }, (_, i) => i + 1);
    
    sampleSerials.forEach(serial => {
      const checkDigit = (parseInt(batch.traceCodePrefix.slice(-1)) + serial) % 10;
      const traceCode = `${batch.traceCodePrefix}${serial.toString().padStart(3, '0')}${checkDigit}`;
      
      // 生成温度数据（每批次10个数据点）
      for (let i = 0; i < 10; i++) {
        const dataTime = subMinutes(startOfDay(productionDate), 10 - i);
        iotData.push({
          id: uuidv4(),
          traceCode: traceCode,
          batchId: batch.id,
          sensorType: 'temperature',
          value: Math.floor(Math.random() * 6 + 2), // 2-8度
          timestamp: format(dataTime, 'yyyy-MM-dd HH:mm:ss'),
          deviceId: `TEMP_${Math.floor(Math.random() * 1000)}`,
          location: { ...locations[i % locations.length], gps: locations[i % locations.length].gps as [number, number] }
        });
      }
      
      // 生成GPS数据（每批次2个数据点）
      for (let i = 0; i < 2; i++) {
        const dataTime = subMinutes(startOfDay(productionDate), 5 - i);
        const location = locations[Math.floor(Math.random() * locations.length)];
        iotData.push({
          id: uuidv4(),
          traceCode: traceCode,
          batchId: batch.id,
          sensorType: 'gps',
          value: location.gps as [number, number],
          timestamp: format(dataTime, 'yyyy-MM-dd HH:mm:ss'),
          deviceId: `GPS_${Math.floor(Math.random() * 1000)}`,
          location: { ...location, gps: location.gps as [number, number] }
        });
      }
    });
    
    return iotData;
  }
  
  /**
   * 保存历史数据到文件（分批保存以避免堆栈溢出）
   */
  static saveHistoricalData(data: { batches: Batch[]; events: TransferEvent[]; iotData: IoTData[] }): void {
    console.log('开始保存历史数据到文件（分批保存）...');
    
    // 分批保存批次数据
    const existingBatches = FileStorage.getBatches();
    const batchChunkSize = 500;
    console.log(`保存批次数据：${data.batches.length} 个批次（分 ${Math.ceil(data.batches.length / batchChunkSize)} 批）`);
    
    for (let i = 0; i < data.batches.length; i += batchChunkSize) {
      const chunk = data.batches.slice(i, i + batchChunkSize);
      const currentBatches = FileStorage.getBatches();
      FileStorage.saveBatches([...currentBatches, ...chunk]);
      if ((i / batchChunkSize) % 10 === 0) {
        console.log(`  已保存 ${Math.min(i + batchChunkSize, data.batches.length)} / ${data.batches.length} 个批次`);
      }
    }
    console.log(`✅ 批次数据保存完成`);
    
    // 分批保存事件数据
    const existingEvents = FileStorage.getEvents();
    const eventChunkSize = 10000;
    console.log(`保存事件数据：${data.events.length} 个事件（分 ${Math.ceil(data.events.length / eventChunkSize)} 批）`);
    
    for (let i = 0; i < data.events.length; i += eventChunkSize) {
      const chunk = data.events.slice(i, i + eventChunkSize);
      const currentEvents = FileStorage.getEvents();
      FileStorage.saveEvents([...currentEvents, ...chunk]);
      if ((i / eventChunkSize) % 5 === 0) {
        console.log(`  已保存 ${Math.min(i + eventChunkSize, data.events.length)} / ${data.events.length} 个事件`);
      }
    }
    console.log(`✅ 事件数据保存完成`);
    
    // 分批保存IoT数据
    const iotChunkSize = 10000;
    console.log(`保存IoT数据：${data.iotData.length} 个数据点（分 ${Math.ceil(data.iotData.length / iotChunkSize)} 批）`);
    
    for (let i = 0; i < data.iotData.length; i += iotChunkSize) {
      const chunk = data.iotData.slice(i, i + iotChunkSize);
      FileStorage.saveIoTDataArray(chunk);
      if ((i / iotChunkSize) % 5 === 0) {
        console.log(`  已保存 ${Math.min(i + iotChunkSize, data.iotData.length)} / ${data.iotData.length} 个IoT数据点`);
      }
    }
    console.log(`✅ IoT数据保存完成`);
    
    console.log(`✅ 所有历史数据已保存到文件`);
  }
}

