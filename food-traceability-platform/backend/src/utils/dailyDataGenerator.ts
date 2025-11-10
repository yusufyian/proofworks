import { format, subDays, addDays, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { DataGenerator } from './dataGenerator';
import { FileStorage } from '../storage/fileStorage';
import { Product, Batch, TransferEvent, IoTData } from '../types';
import { subHours, subMinutes } from 'date-fns';

/**
 * 生成当日的模拟数据
 */
export class DailyDataGenerator {
  /**
   * 检查是否需要生成今日数据
   */
  static shouldGenerateTodayData(): boolean {
    const today = format(new Date(), 'yyyy-MM-dd');
    const batches = FileStorage.getBatches();
    
    // 检查今天是否已有批次数据
    const todayBatches = batches.filter(b => b.productionDate === today);
    
    // 如果今天没有批次或批次数量少于5个，需要生成
    return todayBatches.length < 5;
  }

  /**
   * 生成今日的批次数据
   */
  static generateTodayBatches(): Batch[] {
    const products = FileStorage.getProducts();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // 随机选择3-8个产品生成今日批次
    const selectedProducts = products
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 6) + 3);
    
    const batches: Batch[] = [];
    const productCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
    
    selectedProducts.forEach((product, index) => {
      // 每个产品生成1-3个批次
      const batchCount = Math.floor(Math.random() * 3) + 1;
      
      for (let b = 0; b < batchCount; b++) {
        const batchNum = (b + 1).toString().padStart(2, '0');
        const productCode = productCodes[index % productCodes.length];
        
        // 获取产品对应的企业代码（从已有批次中查找或使用默认值）
        const existingBatch = FileStorage.getBatches().find(b => b.productId === product.id);
        let companyCode = '310115';
        if (existingBatch) {
          companyCode = existingBatch.traceCodePrefix.substring(0, 6);
        }
        
        const batch: Batch = {
          id: uuidv4(),
          batchNumber: `${format(today, 'yyyyMMdd')}${batchNum}`,
          traceCodePrefix: `${companyCode}${productCode}${format(today, 'yyyyMMdd')}${batchNum}`,
          productId: product.id,
          productionDate: todayStr,
          expiryDays: Math.floor(Math.random() * 15 + 5),
          quantity: Math.floor(Math.random() * 5000 + 1000),
          unit: '盒',
          ingredients: [
            { name: '主料', batchNumber: `ING${format(today, 'yyyyMMdd')}01`, amount: 100 },
            { name: '辅料', batchNumber: `ING${format(today, 'yyyyMMdd')}02`, amount: 20 }
          ],
          qualityReports: [
            {
              testItem: '农残检测',
              result: Math.random() > 0.1 ? '未检出' : '合格',
              agency: 'XX质量检测中心',
              reportNumber: `QR${format(today, 'yyyyMMdd')}${b + 1}`,
              reportHash: `hash_${uuidv4()}`,
              testDate: todayStr
            },
            {
              testItem: '微生物检测',
              result: Math.random() > 0.1 ? '合格' : '符合标准',
              agency: 'XX质量检测中心',
              reportNumber: `QR${format(today, 'yyyyMMdd')}${b + 1}_2`,
              reportHash: `hash_${uuidv4()}`,
              testDate: todayStr
            }
          ],
          status: Math.random() > 0.15 ? '合格' : (Math.random() > 0.5 ? '生产中' : '合格'),
          createdAt: format(today, 'yyyy-MM-dd HH:mm:ss'),
          updatedAt: format(today, 'yyyy-MM-dd HH:mm:ss')
        };
        
        batches.push(batch);
      }
    });
    
    return batches;
  }

  /**
   * 为今日批次生成完整的事件链
   */
  static generateTodayEvents(batches: Batch[]): TransferEvent[] {
    const events: TransferEvent[] = [];
    
    // 完整的事件类型链（18个节点）
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

    batches.forEach(batch => {
      const baseTime = new Date(batch.productionDate);
      
      // 为每个批次生成5个示例追溯码
      const sampleSerials = Array.from({ length: 5 }, (_, i) => i + 1);
      
      sampleSerials.forEach(serial => {
        const checkDigit = (parseInt(batch.traceCodePrefix.slice(-1)) + serial) % 10;
        const traceCode = `${batch.traceCodePrefix}${serial.toString().padStart(3, '0')}${checkDigit}`;
        
        // 为每个追溯码生成完整的事件链
        fullEventChain.forEach((eventType, index) => {
          // 时间从生产日期往前推，越早的事件时间越早
          const hoursBefore = (fullEventChain.length - index) * 2;
          const eventTime = subHours(baseTime, hoursBefore);
          
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
    });
    
    return events;
  }

  /**
   * 为今日批次生成IoT数据
   */
  static generateTodayIoTData(batches: Batch[]): IoTData[] {
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

    batches.forEach(batch => {
      const baseTime = new Date(batch.productionDate);
      const sampleSerials = Array.from({ length: 5 }, (_, i) => i + 1);
      
      sampleSerials.forEach(serial => {
        const checkDigit = (parseInt(batch.traceCodePrefix.slice(-1)) + serial) % 10;
        const traceCode = `${batch.traceCodePrefix}${serial.toString().padStart(3, '0')}${checkDigit}`;
        
        // 生成温度数据（每批次10个数据点）
        for (let i = 0; i < 10; i++) {
          const dataTime = subMinutes(baseTime, 10 - i);
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
          const dataTime = subMinutes(baseTime, 5 - i);
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
    });
    
    return iotData;
  }

  /**
   * 生成今日的所有数据
   */
  static generateTodayData(): { batches: Batch[]; events: TransferEvent[]; iotData: IoTData[] } {
    console.log('开始生成今日模拟数据...');
    
    const batches = this.generateTodayBatches();
    const events = this.generateTodayEvents(batches);
    const iotData = this.generateTodayIoTData(batches);
    
    // 保存到存储（批量保存）
    const existingBatches = FileStorage.getBatches();
    FileStorage.saveBatches([...existingBatches, ...batches]);
    
    const existingEvents = FileStorage.getEvents();
    FileStorage.saveEvents([...existingEvents, ...events]);
    
    FileStorage.saveIoTDataArray(iotData);
    
    console.log(`✅ 今日数据生成完成：${batches.length}个批次，${events.length}个事件，${iotData.length}个IoT数据点`);
    
    return { batches, events, iotData };
  }
}

