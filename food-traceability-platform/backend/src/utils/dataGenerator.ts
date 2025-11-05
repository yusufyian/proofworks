import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, subHours, subMinutes, format } from 'date-fns';
import { Product, Batch, TransferEvent, IoTData, Recall, ProductCategory, EventType } from '../types';

// 生成追溯码
function generateTraceCode(companyCode: string, productCode: string, date: string, batch: string, serial: number): string {
  const serialStr = serial.toString().padStart(3, '0');
  const checkDigit = (parseInt(companyCode.slice(-1)) + serial) % 10;
  return `${companyCode}${productCode}${date}${batch}${serialStr}${checkDigit}`;
}

// 产品名称列表
const productNames = [
  '有机草莓', '绿色黄瓜', '无公害西红柿', '生态苹果', '有机蓝莓',
  '新鲜菠菜', '优质胡萝卜', '有机生菜', '绿色芹菜', '无公害茄子',
  '优质牛肉', '生态猪肉', '有机鸡肉', '新鲜羊肉', '生态鸭肉',
  '野生带鱼', '新鲜对虾', '优质三文鱼', '生态黄鱼', '新鲜鲈鱼',
  '有机牛奶', '优质酸奶', '生态奶酪', '有机奶粉', '新鲜奶油',
  '优质大米', '生态小米', '有机面粉', '绿色玉米', '优质花生'
];

// 品牌列表
const brands = [
  '绿源生态', '田园牧歌', '自然农场', '有机生活', '绿色家园',
  '生态农业', '健康之源', '优质食品', '自然之选', '生态优品'
];

// 企业信息
const companies = [
  { name: '绿源生态农业有限公司', code: '310115', creditCode: '91310000123456789X', license: 'SC12345678901234', address: '上海市浦东新区XX路123号' },
  { name: '田园牧歌食品股份有限公司', code: '110101', creditCode: '91110000987654321Y', license: 'SC98765432109876', address: '北京市朝阳区XX街456号' },
  { name: '自然农场集团有限公司', code: '440103', creditCode: '91440000333333333Z', license: 'SC33333333333333', address: '广州市天河区XX大道789号' },
  { name: '有机生活食品有限公司', code: '320106', creditCode: '91320000222222222W', license: 'SC22222222222222', address: '南京市鼓楼区XX路321号' },
  { name: '绿色家园农业科技公司', code: '510104', creditCode: '91510000444444444V', license: 'SC44444444444444', address: '成都市锦江区XX街654号' }
];

// 产地信息
const origins = [
  { province: '山东', city: '烟台', district: '栖霞市', gps: [37.3059, 120.8357], certs: ['有机认证', '绿色食品'] },
  { province: '山东', city: '寿光', district: '寿光市', gps: [36.8567, 118.7875], certs: ['无公害认证', '绿色食品'] },
  { province: '江苏', city: '南京', district: '溧水区', gps: [31.6531, 119.0154], certs: ['有机认证'] },
  { province: '四川', city: '成都', district: '都江堰市', gps: [31.0052, 103.6188], certs: ['有机认证', '绿色食品'] },
  { province: '新疆', city: '乌鲁木齐', district: '昌吉市', gps: [44.0144, 87.3049], certs: ['有机认证'] },
  { province: '内蒙古', city: '呼和浩特', district: '和林格尔县', gps: [40.3785, 111.8245], certs: ['有机认证', '绿色食品'] },
  { province: '黑龙江', city: '哈尔滨', district: '五常市', gps: [44.9314, 127.1876], certs: ['有机认证', '绿色食品'] },
  { province: '云南', city: '昆明', district: '安宁市', gps: [24.9197, 102.4846], certs: ['有机认证'] }
];

// 操作员信息
const operators = [
  { name: '张明华', company: '绿源生态农业有限公司', role: '生产主管' },
  { name: '李雅静', company: '绿源生态农业有限公司', role: '质检员' },
  { name: '王建国', company: '田园牧歌食品股份有限公司', role: '仓库管理员' },
  { name: '赵志强', company: '自然农场集团有限公司', role: '物流司机' },
  { name: '钱慧敏', company: '有机生活食品有限公司', role: '销售经理' },
  { name: '孙海峰', company: '绿源生态农业有限公司', role: '种植工人' },
  { name: '周文博', company: 'XX物流公司', role: '物流司机' },
  { name: '吴晓丽', company: 'XX超市', role: '销售经理' },
  { name: '陈永军', company: '绿源生态农业有限公司', role: '生产工人' },
  { name: '刘美玲', company: 'XX质量检测中心', role: '检测员' },
  { name: '杨国强', company: 'XX仓储中心', role: '仓库主管' },
  { name: '黄秀英', company: 'XX物流公司', role: '物流调度' }
];

// 地点信息
const locations = [
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

export class DataGenerator {
  static generateProducts(count: number = 100): Product[] {
    const products: Product[] = [];
    const categories: ProductCategory[] = ['水果', '蔬菜', '肉类', '水产', '乳制品', '粮油', '其他'];
    
    for (let i = 0; i < count; i++) {
      const company = companies[i % companies.length];
      const origin = origins[i % origins.length];
      const category = categories[i % categories.length];
      const productName = productNames[i % productNames.length];
      const brand = brands[i % brands.length];
      
      products.push({
        id: uuidv4(),
        name: productName,
        brand: brand,
        category: category,
        specification: `${Math.floor(Math.random() * 500 + 100)}g/盒`,
        manufacturer: {
          name: company.name,
          creditCode: company.creditCode,
          license: company.license,
          address: company.address
        },
        origin: {
          province: origin.province,
          city: origin.city,
          district: origin.district,
          gps: origin.gps as [number, number],
          certifications: origin.certs
        },
        createdAt: format(subDays(new Date(), Math.floor(Math.random() * 365)), 'yyyy-MM-dd HH:mm:ss'),
        updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      });
    }
    
    return products;
  }

  static generateBatches(products: Product[], batchesPerProduct: number = 5): Batch[] {
    const batches: Batch[] = [];
    const productCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
    
    products.forEach((product, productIndex) => {
      const company = companies.find(c => c.name === product.manufacturer.name) || companies[0];
      
      for (let b = 0; b < batchesPerProduct; b++) {
        const productionDate = subDays(new Date(), Math.floor(Math.random() * 90));
        const dateStr = format(productionDate, 'yyyyMMdd');
        const batchNum = (b + 1).toString().padStart(2, '0');
        const productCode = productCodes[productIndex % productCodes.length];
        
        const batch: Batch = {
          id: uuidv4(),
          batchNumber: `${format(productionDate, 'yyyyMMdd')}${batchNum}`,
          traceCodePrefix: `${company.code}${productCode}${dateStr}${batchNum}`,
          productId: product.id,
          productionDate: format(productionDate, 'yyyy-MM-dd'),
          expiryDays: Math.floor(Math.random() * 15 + 5),
          quantity: Math.floor(Math.random() * 5000 + 1000),
          unit: '盒',
          ingredients: [
            { name: '主料', batchNumber: `ING${format(productionDate, 'yyyyMMdd')}01`, amount: 100 },
            { name: '辅料', batchNumber: `ING${format(productionDate, 'yyyyMMdd')}02`, amount: 20 }
          ],
          qualityReports: [
            {
              testItem: '农残检测',
              result: '未检出',
              agency: 'XX质量检测中心',
              reportNumber: `QR${format(productionDate, 'yyyyMMdd')}${b + 1}`,
              reportHash: `hash_${uuidv4()}`,
              testDate: format(productionDate, 'yyyy-MM-dd')
            },
            {
              testItem: '微生物检测',
              result: '合格',
              agency: 'XX质量检测中心',
              reportNumber: `QR${format(productionDate, 'yyyyMMdd')}${b + 1}_2`,
              reportHash: `hash_${uuidv4()}`,
              testDate: format(productionDate, 'yyyy-MM-dd')
            }
          ],
          status: Math.random() > 0.1 ? '合格' : (Math.random() > 0.5 ? '生产中' : '已召回'),
          createdAt: format(productionDate, 'yyyy-MM-dd HH:mm:ss'),
          updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };
        
        batches.push(batch);
      }
    });
    
    return batches;
  }

  static generateEvents(batches: Batch[], eventsPerBatch: number = 15): TransferEvent[] {
    const events: TransferEvent[] = [];
    
    // 完整的事件类型链（从种植到销售）- 共18个节点，去重后保留核心流程
    const fullEventChain: EventType[] = [
      // 种植阶段（3个节点）
      '播种',           // 1. 播种
      '施肥',           // 2. 施肥
      '收获',           // 3. 收获农产品
      
      // 初加工阶段（3个节点）
      '加工',           // 4. 清洗分拣
      '加工',           // 5. 深度加工
      '包装',           // 6. 产品包装
      
      // 质检阶段（3个节点）
      '农残检测',       // 7. 农残检测
      '营养成分',       // 8. 营养成分检测
      '微生物检测',     // 9. 微生物检测
      
      // 仓储阶段（2个节点）
      '入库',           // 10. 仓储入库
      '出库',           // 11. 出库发货
      
      // 物流阶段（5个节点）
      '装车',           // 12. 装车发货
      '运输',           // 13. 运输途中
      '运输',           // 14. 中转站中转
      '运输',           // 15. 继续运输
      '到货',           // 16. 到达目的地
      
      // 销售阶段（2个节点）
      '入库',           // 17. 门店入库
      '上架'            // 18. 上架销售
    ];
    
    batches.forEach(batch => {
      const baseTime = new Date(batch.productionDate);
      
      // 为每个批次生成5个示例追溯码，每个追溯码都有完整的事件链
      const sampleSerials = Array.from({ length: 5 }, (_, i) => i + 1);
      
      sampleSerials.forEach(serial => {
        const checkDigit = (parseInt(batch.traceCodePrefix.slice(-1)) + serial) % 10;
        const traceCode = `${batch.traceCodePrefix}${serial.toString().padStart(3, '0')}${checkDigit}`;
        
        // 为每个追溯码生成完整的事件链
        fullEventChain.forEach((eventType, index) => {
          // 时间从生产日期往前推，越早的事件时间越早
          // 使用更细粒度的时间间隔（每2小时一个事件）
          const hoursBefore = (fullEventChain.length - index) * 2;
          const eventTime = subHours(baseTime, hoursBefore);
          
          // 根据事件类型选择合适的操作员和地点
          let operator = operators[index % operators.length];
          let location = locations[index % locations.length];
          
          // 根据事件类型和阶段智能分配操作员和地点
          if (index < 3) {
            // 种植阶段（3个节点）
            const plantingOperators = [
              { name: '孙海峰', company: '绿源生态农业有限公司', role: '种植工人' },
              { name: '马志强', company: '绿源生态农业有限公司', role: '种植工人' },
              { name: '徐文涛', company: '绿源生态农业有限公司', role: '种植工人' }
            ];
            operator = plantingOperators[index % plantingOperators.length];
            location = locations[0]; // 农场
          } else if (index < 6) {
            // 初加工阶段（3个节点）
            const processingOperators = [
              { name: '张明华', company: '绿源生态农业有限公司', role: '生产主管' },
              { name: '陈永军', company: '绿源生态农业有限公司', role: '生产工人' },
              { name: '刘建军', company: '绿源生态农业有限公司', role: '加工工人' }
            ];
            operator = processingOperators[(index - 3) % processingOperators.length];
            location = locations[2]; // 加工厂
          } else if (index < 9) {
            // 质检阶段（3个节点）
            const qualityOperators = [
              { name: '李雅静', company: 'XX质量检测中心', role: '质检员' },
              { name: '刘美玲', company: 'XX质量检测中心', role: '检测员' },
              { name: '赵晓雯', company: 'XX质量检测中心', role: '高级检测师' }
            ];
            operator = qualityOperators[(index - 6) % qualityOperators.length];
            location = { name: 'XX质量检测中心', gps: [31.2304, 121.4737] as [number, number] };
          } else if (index < 11) {
            // 仓储阶段（2个节点）
            const warehouseOperators = [
              { name: '王建国', company: 'XX仓储中心', role: '仓库管理员' },
              { name: '杨国强', company: 'XX仓储中心', role: '仓库主管' }
            ];
            operator = warehouseOperators[(index - 9) % warehouseOperators.length];
            location = locations[3]; // 仓储中心
          } else if (index < 16) {
            // 物流阶段（5个节点）
            const logisticsOperators = [
              { name: '周文博', company: 'XX物流公司', role: '物流司机' },
              { name: '黄秀英', company: 'XX物流公司', role: '物流调度' },
              { name: '马建军', company: 'XX物流公司', role: '物流司机' },
              { name: '徐志强', company: 'XX物流公司', role: '运输队长' },
              { name: '赵文华', company: 'XX物流公司', role: '物流司机' }
            ];
            operator = logisticsOperators[(index - 11) % logisticsOperators.length];
            // 运输过程中使用不同的地点
            if (index === 13) {
              location = { name: 'XX物流中转站', gps: [36.8567, 118.7875] as [number, number] };
            } else if (index === 15) {
              location = locations[4]; // 配送中心
            } else {
              location = locations[Math.floor(Math.random() * locations.length)];
            }
          } else {
            // 销售阶段（2个节点）
            const salesOperators = [
              { name: '吴晓丽', company: 'XX超市', role: '销售经理' },
              { name: '钱慧敏', company: 'XX超市', role: '门店主管' }
            ];
            operator = salesOperators[(index - 16) % salesOperators.length];
            location = { name: 'XX超市（销售门店）', gps: [31.2304, 121.4737] as [number, number] };
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
              gps: location.gps as [number, number]
            },
            content: {
              quantity: eventType === '收获' ? batch.quantity : Math.floor(Math.random() * 100 + 10),
              temperature: (eventType === '运输' || eventType === '入库' || eventType === '到货') ? Math.floor(Math.random() * 6 + 2) : undefined,
              humidity: eventType === '入库' ? Math.floor(Math.random() * 20 + 60) : undefined,
              notes: `${eventType}操作完成${index < 3 ? '（种植阶段）' : index < 6 ? '（加工阶段）' : index < 9 ? '（质检阶段）' : index < 11 ? '（仓储阶段）' : index < 16 ? '（物流阶段）' : '（销售阶段）'}`,
              // 检测事件添加检测结果
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

  static generateIoTData(batches: Batch[], dataPointsPerBatch: number = 50): IoTData[] {
    const iotData: IoTData[] = [];
    
    batches.forEach(batch => {
      const baseTime = new Date(batch.productionDate);
      
      // 为每个批次生成几个示例追溯码（与事件中的追溯码保持一致）
      const sampleSerials = Array.from({ length: 5 }, (_, i) => i + 1);
      
      // 为每个示例追溯码生成IoT数据
      sampleSerials.forEach(serial => {
        const checkDigit = (parseInt(batch.traceCodePrefix.slice(-1)) + serial) % 10;
        const traceCode = `${batch.traceCodePrefix}${serial.toString().padStart(3, '0')}${checkDigit}`;
        
        // 生成温度数据
        for (let i = 0; i < Math.floor(dataPointsPerBatch / sampleSerials.length); i++) {
          const dataTime = subMinutes(baseTime, Math.floor(dataPointsPerBatch / sampleSerials.length) - i);
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
        
        // 生成GPS数据（运输过程中）
        for (let i = 0; i < Math.floor(dataPointsPerBatch / sampleSerials.length / 5); i++) {
          const dataTime = subMinutes(baseTime, Math.floor(dataPointsPerBatch / sampleSerials.length / 5) - i);
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

  static generateRecalls(batches: Batch[], recallRate: number = 0.05): Recall[] {
    const recalls: Recall[] = [];
    const recalledBatches = batches.filter(() => Math.random() < recallRate);
    const reasons = ['检测不合格', '投诉质量问题', '疑似污染', '保质期异常', '包装破损'];
    const riskLevels: Array<'低' | '中' | '高' | '紧急'> = ['低', '中', '高', '紧急'];
    
    recalledBatches.forEach(batch => {
      const recall: Recall = {
        id: uuidv4(),
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
        initiatedBy: '市场监管局',
        initiatedAt: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd HH:mm:ss'),
        status: Math.random() > 0.3 ? '进行中' : '已完成',
        recallProgress: {
          totalQuantity: batch.quantity,
          recalledQuantity: Math.floor(batch.quantity * (0.6 + Math.random() * 0.3)),
          locations: [
            { name: '仓库A', quantity: Math.floor(batch.quantity * 0.2), status: '已召回' },
            { name: '门店B', quantity: Math.floor(batch.quantity * 0.3), status: '已召回' },
            { name: '在途C', quantity: Math.floor(batch.quantity * 0.1), status: '召回中' }
          ]
        },
        completedAt: Math.random() > 0.3 ? format(subDays(new Date(), Math.floor(Math.random() * 5)), 'yyyy-MM-dd HH:mm:ss') : undefined
      };
      
      recalls.push(recall);
    });
    
    return recalls;
  }
}

