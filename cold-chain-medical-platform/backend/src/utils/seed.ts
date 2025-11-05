import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import storage from '../storage/fileStorage';
import { Batch, Device, TemperatureData, Alert, Transport, Company, User, Incident } from '../types';

// 生成随机温度数据（在正常范围内，带有平滑波动）
function generateNormalTemperature(productType: string, previousTemp?: number): number {
  const ranges: Record<string, { min: number; max: number }> = {
    vaccine_cold: { min: 2, max: 8 },
    vaccine_frozen: { min: -20, max: -15 },
    biologic: { min: 2, max: 8 },
    insulin: { min: 2, max: 8 },
    cold_drug: { min: 2, max: 8 },
    cool_drug: { min: 15, max: 20 },
  };
  const range = ranges[productType] || { min: 2, max: 8 };
  const center = (range.min + range.max) / 2;
  
  if (previousTemp !== undefined) {
    // 基于前一个温度值，产生平滑的波动（最大变化±0.5°C）
    const change = (Math.random() - 0.5) * 1.0; // -0.5 到 +0.5
    const newTemp = previousTemp + change;
    // 确保在范围内，但允许微小的波动
    const clampedTemp = Math.max(range.min - 0.5, Math.min(range.max + 0.5, newTemp));
    return Number(clampedTemp.toFixed(1));
  }
  
  // 初始温度，在范围内随机，但倾向于中心值
  const randomFactor = (Math.random() - 0.5) * 2; // -1 到 1
  const temp = center + randomFactor * ((range.max - range.min) / 3);
  return Number(Math.max(range.min, Math.min(range.max, temp)).toFixed(1));
}

// 生成随机坐标（中国主要城市）
const cities = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '广州', lat: 23.1291, lng: 113.2644 },
  { name: '深圳', lat: 22.5431, lng: 114.0579 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 },
  { name: '成都', lat: 30.6624, lng: 104.0633 },
  { name: '武汉', lat: 30.5928, lng: 114.3055 },
  { name: '西安', lat: 34.3416, lng: 108.9398 },
  { name: '南京', lat: 32.0603, lng: 118.7969 },
  { name: '天津', lat: 39.3434, lng: 117.3616 },
];

function getRandomCity() {
  return cities[Math.floor(Math.random() * cities.length)];
}

// 生成逼真的中文姓名
function generateChineseName(): string {
  // 常见姓氏（前100大姓）
  const surnames = [
    '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周',
    '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗',
    '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
    '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡',
    '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈',
    '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金',
    '石', '廖', '贾', '夏', '韦', '付', '方', '白', '邹', '孟',
    '熊', '秦', '邱', '江', '尹', '薛', '闫', '段', '雷', '侯',
    '龙', '史', '陶', '黎', '贺', '顾', '毛', '郝', '龚', '邵',
  ];
  
  // 常见名字（单字名）
  const givenNamesSingle = [
    '伟', '芳', '娜', '秀', '英', '华', '强', '磊', '军', '洋',
    '勇', '艳', '杰', '娟', '涛', '明', '超', '秀', '兰', '霞',
    '平', '刚', '桂', '英', '辉', '东', '鹏', '梅', '玲', '玲',
    '伟', '静', '丽', '强', '磊', '敏', '艳', '勇', '娟', '涛',
    '明', '超', '秀', '兰', '霞', '平', '刚', '辉', '东', '鹏',
    '建', '文', '斌', '武', '军', '勇', '强', '华', '明', '辉',
    '国', '民', '德', '胜', '发', '财', '富', '贵', '祥', '瑞',
    '龙', '虎', '豹', '鹰', '鹏', '鹤', '凤', '燕', '雁', '鹤',
  ];
  
  // 常见名字（双字名，第一个字）
  const givenNamesFirst = [
    '志', '建', '文', '国', '德', '永', '世', '广', '义', '礼',
    '智', '信', '仁', '忠', '孝', '勇', '强', '健', '康', '福',
    '吉', '祥', '瑞', '兴', '旺', '发', '达', '富', '贵', '荣',
    '华', '明', '亮', '辉', '光', '新', '春', '秋', '冬', '夏',
    '山', '海', '江', '河', '湖', '波', '涛', '浪', '潮', '风',
  ];
  
  // 常见名字（双字名，第二个字）
  const givenNamesSecond = [
    '伟', '强', '军', '华', '明', '辉', '东', '鹏', '超', '勇',
    '杰', '磊', '涛', '波', '峰', '亮', '刚', '健', '康', '福',
    '安', '平', '和', '顺', '利', '达', '成', '功', '业', '家',
    '国', '民', '人', '友', '谊', '情', '爱', '心', '意', '志',
    '文', '武', '德', '才', '学', '识', '见', '知', '智', '慧',
  ];
  
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  
  // 70%概率生成双字名，30%概率生成单字名
  if (Math.random() < 0.7) {
    const first = givenNamesFirst[Math.floor(Math.random() * givenNamesFirst.length)];
    const second = givenNamesSecond[Math.floor(Math.random() * givenNamesSecond.length)];
    return surname + first + second;
  } else {
    const single = givenNamesSingle[Math.floor(Math.random() * givenNamesSingle.length)];
    return surname + single;
  }
}

async function seed() {
  console.log('开始生成模拟数据...');

  // 1. 创建公司
  const companies: Company[] = [];
  const companyTypes: Array<{ name: string; type: Company['type'] }> = [
    { name: '北京生物制品有限公司', type: 'producer' },
    { name: '上海医药集团', type: 'producer' },
    { name: '广州医药批发有限公司', type: 'wholesaler' },
    { name: '深圳顺丰冷链物流', type: 'logistics' },
    { name: '北京协和医院', type: 'hospital' },
    { name: '上海第一人民医院', type: 'hospital' },
    { name: '广州大药房连锁', type: 'pharmacy' },
    { name: '国家药监局', type: 'regulator' },
  ];

  for (const companyInfo of companyTypes) {
    const city = getRandomCity();
    const company = await storage.createCompany({
      name: companyInfo.name,
      type: companyInfo.type,
      address: `${city.name}市${['区', '开发区', '高新区'][Math.floor(Math.random() * 3)]}${['路', '街', '大道'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 999) + 1}号`,
      contact: ['张', '李', '王', '刘', '陈'][Math.floor(Math.random() * 5)] + ['经理', '主任', '负责人'][Math.floor(Math.random() * 3)],
      phone: `1${[3, 5, 7, 8, 9][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`,
    });
    companies.push(company);
  }

  // 2. 创建用户
  const admin = await storage.createUser({
    email: 'admin@coldchain.com',
    password: await bcrypt.hash('admin123', 10),
    name: '系统管理员',
    role: 'admin',
  });

  // 为每个公司创建用户
  for (const company of companies) {
    const roleMap: Record<string, 'warehouse' | 'logistics' | 'pharmacy' | 'regulator'> = {
      producer: 'warehouse',
      wholesaler: 'warehouse',
      logistics: 'logistics',
      hospital: 'pharmacy',
      pharmacy: 'pharmacy',
      regulator: 'regulator',
    };
    const role = roleMap[company.type] || 'warehouse';
    await storage.createUser({
      email: `${company.name.toLowerCase().replace(/\s+/g, '')}@coldchain.com`,
      password: await bcrypt.hash('123456', 10),
      name: company.contact,
      role,
      companyId: company.id,
    });
  }

  // 3. 创建设备
  const devices: Device[] = [];
  const deviceNames = [
    '冷库监控系统-01', '冷库监控系统-02', '冷库监控系统-03',
    '冷链车-001', '冷链车-002', '冷链车-003', '冷链车-004', '冷链车-005',
    '便携冷箱-001', '便携冷箱-002', '便携冷箱-003',
  ];

  for (let i = 0; i < deviceNames.length; i++) {
    const name = deviceNames[i];
    const type: Device['type'] = name.includes('冷库') ? 'warehouse' : name.includes('车') ? 'vehicle' : 'portable';
    const device = await storage.createDevice({
      deviceId: `DEV-${String(i + 1).padStart(6, '0')}`,
      name,
      type,
      location: type === 'warehouse' ? getRandomCity().name + '仓库' : undefined,
      status: Math.random() > 0.1 ? 'online' : 'offline',
      calibrationDate: dayjs().subtract(Math.floor(Math.random() * 180), 'day').toISOString(),
      nextCalibrationDate: dayjs().add(180 - Math.floor(Math.random() * 60), 'day').toISOString(),
    });
    devices.push(device);
  }

  // 4. 创建批次
  const batches: Batch[] = [];
  const productTypes: Batch['productType'][] = ['vaccine_cold', 'vaccine_frozen', 'biologic', 'insulin', 'cold_drug', 'cool_drug'];
  const productNames = [
    '新冠疫苗', '流感疫苗', '乙肝疫苗', '狂犬疫苗',
    '重组人胰岛素', '干扰素注射液', '白蛋白注射液',
    '头孢类抗生素', '青霉素注射液', '抗病毒药物',
  ];

  const producers = companies.filter(c => c.type === 'producer');
  for (let i = 0; i < 150; i++) {
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
    const temperatureRanges: Record<string, { min: number; max: number }> = {
      vaccine_cold: { min: 2, max: 8 },
      vaccine_frozen: { min: -20, max: -15 },
      biologic: { min: 2, max: 8 },
      insulin: { min: 2, max: 8 },
      cold_drug: { min: 2, max: 8 },
      cool_drug: { min: 15, max: 20 },
    };
    const range = temperatureRanges[productType];

    const batch = await storage.createBatch({
      batchNo: `BATCH-${dayjs().subtract(Math.floor(Math.random() * 180), 'day').format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
      productName: productNames[Math.floor(Math.random() * productNames.length)],
      productType,
      producerId: producers[Math.floor(Math.random() * producers.length)].id,
      productionDate: dayjs().subtract(Math.floor(Math.random() * 180), 'day').toISOString(),
      expiryDate: dayjs().add(Math.floor(Math.random() * 180) + 180, 'day').toISOString(),
      quantity: Math.floor(Math.random() * 9000) + 1000,
      unit: '支',
      temperatureRange: range,
      traceCode: `TRACE-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      status: ['in_storage', 'in_transit', 'delivered', 'isolated'][Math.floor(Math.random() * 4)] as Batch['status'],
      currentLocation: getRandomCity().name,
    });
    batches.push(batch);
  }

  // 5. 生成温控数据（为所有批次生成，确保有足够的数据点）
  console.log('生成温控数据...');
  const now = dayjs();
  // 为更多批次生成数据，确保演示时有丰富的数据
  const batchesToTrack = batches.slice(0, 100);
  let totalDataPoints = 0;
  
  for (const batch of batchesToTrack) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    
    // 确保数据覆盖最近30天，并且有数据一直到当前时间
    // 生成多个时间段的数据，确保24h、7d、30d查询都有数据
    const timeRanges = [
      { start: now.subtract(1, 'day'), end: now, interval: 15, maxPoints: 96 }, // 最近24小时
      { start: now.subtract(7, 'day'), end: now, interval: 30, maxPoints: 200 }, // 最近7天
      { start: now.subtract(30, 'day'), end: now.subtract(7, 'day'), interval: 120, maxPoints: 200 }, // 7-30天前
    ];
    
    for (const timeRange of timeRanges) {
      let currentTime = timeRange.start;
      let previousTemp: number | undefined = undefined;
      let pointCount = 0;
      
      // 生成逼真的温度曲线
      while (currentTime.isBefore(timeRange.end) && pointCount < timeRange.maxPoints) {
        // 生成平滑的温度变化
        const temp = generateNormalTemperature(batch.productType, previousTemp);
        previousTemp = temp;
        
        const city = getRandomCity();
        
        // 模拟一天中的温度波动（白天略高，夜间略低）
        const hour = dayjs(currentTime).hour();
        let adjustedTemp = temp;
        if (hour >= 6 && hour <= 18) {
          // 白天：温度可能略高0.2-0.5°C
          adjustedTemp = Math.min(batch.temperatureRange.max, temp + (Math.random() * 0.3 + 0.2));
        } else {
          // 夜间：温度可能略低0.1-0.3°C
          adjustedTemp = Math.max(batch.temperatureRange.min, temp - (Math.random() * 0.2 + 0.1));
        }
        
        await storage.createTemperatureData({
          deviceId: device.id,
          batchId: batch.id,
          temperature: Number(adjustedTemp.toFixed(1)),
          humidity: Math.floor(Math.random() * 20) + 50, // 50-70%
          location: { 
            lat: city.lat + (Math.random() - 0.5) * 0.1, 
            lng: city.lng + (Math.random() - 0.5) * 0.1 
          },
          vibration: Number((Math.random() * 0.3).toFixed(2)), // 0-0.3g
          doorStatus: Math.random() > 0.95 ? 'open' : 'closed',
          timestamp: currentTime.toISOString(),
        });

        currentTime = currentTime.add(timeRange.interval, 'minute');
        pointCount++;
        totalDataPoints++;
      }
    }
  }
  
  console.log(`已生成 ${batchesToTrack.length} 个批次的温控数据，共 ${totalDataPoints} 个数据点`);

  // 6. 生成告警
  console.log('生成告警数据...');
  for (let i = 0; i < 50; i++) {
    const batch = batches[Math.floor(Math.random() * batches.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const alertTypes: Alert['type'][] = ['temperature', 'humidity', 'door', 'device_offline'];
    const levels: Alert['level'][] = ['warning', 'serious', 'critical'];
    
    const alert = await storage.createAlert({
      batchId: batch.id,
      deviceId: device.id,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      message: `检测到${alertTypes[Math.floor(Math.random() * alertTypes.length)]}异常`,
      temperature: alertTypes[Math.floor(Math.random() * alertTypes.length)] === 'temperature' ? 
        (batch.temperatureRange.max + Math.random() * 5) : undefined,
      threshold: batch.temperatureRange.max,
      duration: Math.floor(Math.random() * 120) + 10,
      status: ['pending', 'acknowledged', 'resolved', 'false_alarm'][Math.floor(Math.random() * 4)] as Alert['status'],
      createdAt: dayjs().subtract(Math.floor(Math.random() * 30), 'day').toISOString(),
    });
  }

  // 7. 生成运输单
  console.log('生成运输单数据...');
  const wholesalers = companies.filter(c => c.type === 'wholesaler');
  const hospitals = companies.filter(c => c.type === 'hospital');
  const pharmacies = companies.filter(c => c.type === 'pharmacy');
  const logistics = companies.filter(c => c.type === 'logistics');

  for (let i = 0; i < 80; i++) {
    const fromCompany = [...producers, ...wholesalers][Math.floor(Math.random() * (producers.length + wholesalers.length))];
    const toCompany = [...hospitals, ...pharmacies][Math.floor(Math.random() * (hospitals.length + pharmacies.length))];
    const batchIds = batches.slice(Math.floor(Math.random() * 50), Math.floor(Math.random() * 50) + 5).map(b => b.id);
    const startCity = getRandomCity();
    const endCity = getRandomCity();

    const transport = await storage.createTransport({
      transportNo: `TRANS-${dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
      batchIds,
      fromCompanyId: fromCompany.id,
      toCompanyId: toCompany.id,
      vehicleId: devices.find(d => d.type === 'vehicle')?.id,
      driverName: generateChineseName(),
      driverPhone: `1${[3, 5, 7, 8, 9][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`,
      startTime: dayjs().subtract(Math.floor(Math.random() * 30), 'day').toISOString(),
      endTime: Math.random() > 0.3 ? dayjs().subtract(Math.floor(Math.random() * 25), 'day').toISOString() : undefined,
      status: Math.random() > 0.3 ? 'delivered' : 'in_transit' as Transport['status'],
      route: {
        start: { lat: startCity.lat, lng: startCity.lng, name: startCity.name },
        end: { lat: endCity.lat, lng: endCity.lng, name: endCity.name },
      },
      complianceScore: Math.random() > 0.2 ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 20) + 70,
      createdAt: dayjs().subtract(Math.floor(Math.random() * 30), 'day').toISOString(),
    });
  }

  console.log('模拟数据生成完成！');
  console.log(`- 公司: ${companies.length}`);
  console.log(`- 设备: ${devices.length}`);
  console.log(`- 批次: ${batches.length}`);
  console.log(`- 运输单: 80`);
}

seed().catch(console.error);
