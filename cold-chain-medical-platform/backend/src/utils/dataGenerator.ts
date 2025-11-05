import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import {
  Company,
  Batch,
  TemperatureRecord,
  Transport,
  Alert,
  Device,
  TraceRecord,
} from '../types';

// 药品名称列表
const PRODUCT_NAMES = [
  '新冠疫苗（灭活）',
  '流感疫苗',
  'HPV疫苗',
  '狂犬病疫苗',
  '乙肝疫苗',
  '胰岛素注射液',
  '干扰素注射液',
  '白蛋白注射液',
  '免疫球蛋白',
  '生长激素',
  '促红细胞生成素',
  '抗肿瘤药物A',
  '抗肿瘤药物B',
  '抗生素注射液',
  '营养液',
];

// 公司名称
const COMPANY_NAMES = {
  producer: [
    '北京生物制品研究所',
    '上海复星医药集团',
    '深圳康泰生物制品',
    '长春生物制品研究所',
    '武汉生物制品研究所',
  ],
  distributor: [
    '国药控股股份有限公司',
    '华润医药商业集团',
    '九州通医药集团',
    '上海医药集团',
    '华东医药股份有限公司',
  ],
  logistics: [
    '顺丰医药冷链',
    '京东物流医药',
    '中国邮政医药物流',
    '中通冷链',
    '德邦医药物流',
  ],
  hospital: [
    '北京协和医院',
    '上海瑞金医院',
    '广州中山医院',
    '深圳人民医院',
    '成都华西医院',
  ],
  pharmacy: [
    '国大药房',
    '老百姓大药房',
    '一心堂药房',
    '益丰大药房',
    '大参林药房',
  ],
};

// 设备型号
const DEVICE_MODELS = {
  warehouse: ['WH-TEMP-2000', 'WH-TEMP-3000', 'WH-TEMP-5000'],
  vehicle: ['VEH-TEMP-GPS-100', 'VEH-TEMP-GPS-200', 'VEH-TEMP-GPS-300'],
  portable: ['PORT-TEMP-BT-50', 'PORT-TEMP-4G-100', 'PORT-TEMP-4G-200'],
};

const DEVICE_MANUFACTURERS = ['智能温控科技', '恒温科技', '冷链监测设备', '医药温控'];

// 城市坐标
const CITIES = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '广州', lat: 23.1291, lng: 113.2644 },
  { name: '深圳', lat: 22.5431, lng: 114.0579 },
  { name: '成都', lat: 30.6624, lng: 104.0633 },
  { name: '武汉', lat: 30.5928, lng: 114.3055 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 },
  { name: '南京', lat: 32.0603, lng: 118.7969 },
];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

export class DataGenerator {
  static generateCompanies(): Company[] {
    const companies: Company[] = [];
    let idCounter = 1;

    Object.entries(COMPANY_NAMES).forEach(([type, names]) => {
      names.forEach((name) => {
        const city = randomChoice(CITIES);
        companies.push({
          id: uuidv4(),
          name,
          type: type as Company['type'],
          unifiedSocialCreditCode: `91${String(Math.floor(Math.random() * 100000000000000)).padStart(16, '0')}`,
          address: `${city.name}市${randomChoice(['朝阳区', '海淀区', '西城区', '东城区', '丰台区'])}${randomInt(1, 999)}号`,
          contact: `联系人${idCounter}`,
          phone: `1${randomInt(3, 9)}${String(randomInt(100000000, 999999999))}`,
          createdAt: dayjs().subtract(randomInt(30, 365), 'day').toISOString(),
          updatedAt: dayjs().subtract(randomInt(1, 30), 'day').toISOString(),
        });
        idCounter++;
      });
    });

    return companies;
  }

  static generateDevices(companies: Company[]): Device[] {
    const devices: Device[] = [];
    const warehouses = companies.filter(c => c.type === 'producer' || c.type === 'distributor');
    const logistics = companies.filter(c => c.type === 'logistics');

    // 仓库设备
    warehouses.forEach((company, index) => {
      const deviceCount = randomInt(2, 5);
      for (let i = 0; i < deviceCount; i++) {
        devices.push({
          id: uuidv4(),
          deviceNo: `WH-${company.name.substring(0, 2)}-${String(index + 1).padStart(3, '0')}-${String(i + 1).padStart(2, '0')}`,
          deviceType: 'warehouse',
          model: randomChoice(DEVICE_MODELS.warehouse),
          manufacturer: randomChoice(DEVICE_MANUFACTURERS),
          installationLocation: `${company.name}冷库${i + 1}号库`,
          calibrationDate: dayjs().subtract(randomInt(0, 6), 'month').toISOString(),
          nextCalibrationDate: dayjs().add(randomInt(0, 6), 'month').toISOString(),
          status: randomChoice(['active', 'active', 'active', 'maintenance']),
          createdAt: dayjs().subtract(randomInt(30, 180), 'day').toISOString(),
          updatedAt: dayjs().subtract(randomInt(1, 30), 'day').toISOString(),
        });
      }
    });

    // 车辆设备
    logistics.forEach((company, index) => {
      const vehicleCount = randomInt(5, 15);
      for (let i = 0; i < vehicleCount; i++) {
        devices.push({
          id: uuidv4(),
          deviceNo: `VEH-${company.name.substring(0, 2)}-${String(index + 1).padStart(3, '0')}-${String(i + 1).padStart(3, '0')}`,
          deviceType: 'vehicle',
          model: randomChoice(DEVICE_MODELS.vehicle),
          manufacturer: randomChoice(DEVICE_MANUFACTURERS),
          vehicleId: `V${String(randomInt(10000, 99999))}`,
          calibrationDate: dayjs().subtract(randomInt(0, 6), 'month').toISOString(),
          nextCalibrationDate: dayjs().add(randomInt(0, 6), 'month').toISOString(),
          status: randomChoice(['active', 'active', 'active', 'maintenance']),
          createdAt: dayjs().subtract(randomInt(30, 180), 'day').toISOString(),
          updatedAt: dayjs().subtract(randomInt(1, 30), 'day').toISOString(),
        });
      }
    });

    // 便携设备
    for (let i = 0; i < 50; i++) {
      devices.push({
        id: uuidv4(),
        deviceNo: `PORT-${String(i + 1).padStart(4, '0')}`,
        deviceType: 'portable',
        model: randomChoice(DEVICE_MODELS.portable),
        manufacturer: randomChoice(DEVICE_MANUFACTURERS),
        calibrationDate: dayjs().subtract(randomInt(0, 6), 'month').toISOString(),
        nextCalibrationDate: dayjs().add(randomInt(0, 6), 'month').toISOString(),
        status: randomChoice(['active', 'active', 'inactive']),
        createdAt: dayjs().subtract(randomInt(30, 180), 'day').toISOString(),
        updatedAt: dayjs().subtract(randomInt(1, 30), 'day').toISOString(),
      });
    }

    return devices;
  }

  static generateBatches(companies: Company[]): Batch[] {
    const batches: Batch[] = [];
    const producers = companies.filter(c => c.type === 'producer');
    const now = dayjs();

    for (let i = 0; i < 200; i++) {
      const producer = randomChoice(producers);
      const productName = randomChoice(PRODUCT_NAMES);
      const productionDate = dayjs().subtract(randomInt(1, 180), 'day');
      const expiryDate = productionDate.add(randomInt(180, 730), 'day');
      
      // 根据产品类型确定温度要求
      let tempRequirement;
      if (productName.includes('疫苗')) {
        tempRequirement = { min: 2, max: 8, type: 'refrigerated' as const };
      } else if (productName.includes('胰岛素') || productName.includes('干扰素')) {
        tempRequirement = { min: 2, max: 8, type: 'refrigerated' as const };
      } else {
        tempRequirement = { min: 2, max: 8, type: 'refrigerated' as const };
      }

      const statuses: Batch['status'][] = ['in_storage', 'in_transit', 'delivered', 'in_storage', 'in_transit'];
      const status = randomChoice(statuses);

      batches.push({
        id: uuidv4(),
        batchNo: `BATCH-${productionDate.format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
        productName,
        productCode: `PROD-${productName.substring(0, 2).toUpperCase()}-${String(randomInt(1000, 9999))}`,
        specification: `${randomInt(5, 50)}ml/支`,
        manufacturer: producer.name,
        manufacturerId: producer.id,
        productionDate: productionDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        quantity: randomInt(100, 10000),
        unit: '支',
        temperatureRequirement: tempRequirement,
        traceCode: `TRACE-${randomInt(100000000000, 999999999999)}`,
        status,
        currentLocation: status === 'delivered' ? randomChoice(companies.filter(c => c.type === 'hospital' || c.type === 'pharmacy')).name : producer.name,
        createdAt: productionDate.toISOString(),
        updatedAt: dayjs().subtract(randomInt(0, 7), 'day').toISOString(),
      });
    }

    return batches;
  }

  static generateTemperatureRecords(
    batches: Batch[],
    devices: Device[]
  ): TemperatureRecord[] {
    const records: TemperatureRecord[] = [];
    const warehouseDevices = devices.filter(d => d.deviceType === 'warehouse');
    const vehicleDevices = devices.filter(d => d.deviceType === 'vehicle');
    const portableDevices = devices.filter(d => d.deviceType === 'portable');

    // 为每个批次生成温度记录
    batches.forEach((batch) => {
      const tempMin = batch.temperatureRequirement.min;
      const tempMax = batch.temperatureRequirement.max;
      const tempCenter = (tempMin + tempMax) / 2;

      // 存储期间的记录
      if (batch.status !== 'in_production') {
        const storageDevice = randomChoice(warehouseDevices);
        const storageStart = dayjs(batch.createdAt);
        const daysInStorage = randomInt(1, 30);
        
        // 每5分钟一条记录
        for (let day = 0; day < daysInStorage; day++) {
          for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 5) {
              const timestamp = storageStart.add(day, 'day').add(hour, 'hour').add(minute, 'minute');
              
              // 偶尔生成异常温度（5%概率）
              let temperature = tempCenter + randomFloat(-1, 1);
              if (Math.random() < 0.05) {
                temperature = randomFloat(tempMin - 2, tempMax + 2);
              }
              
              // 确保温度在合理范围内
              temperature = Math.max(tempMin - 5, Math.min(tempMax + 5, temperature));

              records.push({
                id: uuidv4(),
                batchId: batch.id,
                deviceId: storageDevice.id,
                deviceType: 'warehouse',
                timestamp: timestamp.toISOString(),
                temperature: parseFloat(temperature.toFixed(2)),
                humidity: randomFloat(40, 70),
                location: {
                  lat: randomFloat(30, 40),
                  lng: randomFloat(110, 120),
                },
                vibration: randomFloat(0, 0.5),
                doorStatus: randomChoice(['open', 'closed', 'closed', 'closed']),
                createdAt: timestamp.toISOString(),
              });
            }
          }
        }
      }

      // 运输期间的记录
      if (batch.status === 'in_transit' || batch.status === 'delivered') {
        const transportDevice = randomChoice([...vehicleDevices, ...portableDevices]);
        const transportStart = dayjs(batch.createdAt).add(randomInt(1, 7), 'day');
        const transportHours = randomInt(2, 12);
        
        // 每5分钟一条记录
        for (let hour = 0; hour < transportHours; hour++) {
          for (let minute = 0; minute < 60; minute += 5) {
            const timestamp = transportStart.add(hour, 'hour').add(minute, 'minute');
            
            // 运输中偶尔会有温度波动（10%概率）
            let temperature = tempCenter + randomFloat(-1.5, 1.5);
            if (Math.random() < 0.1) {
              temperature = randomFloat(tempMin - 1, tempMax + 1);
            }
            temperature = Math.max(tempMin - 5, Math.min(tempMax + 5, temperature));

            const city = randomChoice(CITIES);
            records.push({
              id: uuidv4(),
              batchId: batch.id,
              deviceId: transportDevice.id,
              deviceType: transportDevice.deviceType,
              timestamp: timestamp.toISOString(),
              temperature: parseFloat(temperature.toFixed(2)),
              humidity: randomFloat(45, 75),
              location: {
                lat: city.lat + randomFloat(-0.5, 0.5),
                lng: city.lng + randomFloat(-0.5, 0.5),
                address: `${city.name}市`,
              },
              vibration: randomFloat(0.2, 1.5),
              doorStatus: randomChoice(['open', 'closed', 'closed', 'closed', 'closed']),
              createdAt: timestamp.toISOString(),
            });
          }
        }
      }
    });

    return records;
  }

  static generateTransports(
    batches: Batch[],
    companies: Company[]
  ): Transport[] {
    const transports: Transport[] = [];
    const producers = companies.filter(c => c.type === 'producer');
    const distributors = companies.filter(c => c.type === 'distributor');
    const hospitals = companies.filter(c => c.type === 'hospital' || c.type === 'pharmacy');
    const logistics = companies.filter(c => c.type === 'logistics');

    const inTransitBatches = batches.filter(b => b.status === 'in_transit' || b.status === 'delivered');

    // 每个运输批次
    for (let i = 0; i < 50; i++) {
      const batchGroup = inTransitBatches.slice(i * 2, (i + 1) * 2).filter(Boolean);
      if (batchGroup.length === 0) continue;

      const origin = randomChoice([...producers, ...distributors]);
      const destination = randomChoice([...distributors, ...hospitals]);
      const logisticsCompany = randomChoice(logistics);
      
      const startTime = dayjs().subtract(randomInt(1, 30), 'day');
      const estimatedHours = randomInt(4, 12);
      const estimatedArrival = startTime.add(estimatedHours, 'hour');
      
      const statuses: Transport['status'][] = ['completed', 'completed', 'completed', 'in_transit', 'abnormal'];
      const status = randomChoice(statuses);
      
      const actualArrival = status === 'completed' || status === 'abnormal'
        ? estimatedArrival.add(randomInt(-2, 4), 'hour')
        : undefined;

      // 生成路线
      const waypoints = [];
      const startCity = randomChoice(CITIES);
      const endCity = randomChoice(CITIES.filter(c => c.name !== startCity.name));
      
      waypoints.push({
        lat: startCity.lat,
        lng: startCity.lng,
        address: `${startCity.name}市 - ${origin.name}`,
        timestamp: startTime.toISOString(),
      });

      // 中间点
      const midPoints = randomInt(1, 3);
      for (let j = 0; j < midPoints; j++) {
        const midCity = randomChoice(CITIES.filter(c => c.name !== startCity.name && c.name !== endCity.name));
        waypoints.push({
          lat: midCity.lat,
          lng: midCity.lng,
          address: `${midCity.name}市 - 中转站`,
          timestamp: startTime.add((j + 1) * estimatedHours / (midPoints + 1), 'hour').toISOString(),
        });
      }

      waypoints.push({
        lat: endCity.lat,
        lng: endCity.lng,
        address: `${endCity.name}市 - ${destination.name}`,
        timestamp: actualArrival?.toISOString() || estimatedArrival.toISOString(),
      });

      transports.push({
        id: uuidv4(),
        transportNo: `TRANS-${startTime.format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
        batchIds: batchGroup.map(b => b.id),
        originCompanyId: origin.id,
        destinationCompanyId: destination.id,
        vehicleId: `V${String(randomInt(10000, 99999))}`,
        driverName: `司机${randomInt(1, 100)}`,
        driverPhone: `1${randomInt(3, 9)}${String(randomInt(100000000, 999999999))}`,
        startTime: startTime.toISOString(),
        estimatedArrivalTime: estimatedArrival.toISOString(),
        actualArrivalTime: actualArrival?.toISOString(),
        status,
        route: { waypoints },
        createdAt: startTime.toISOString(),
        updatedAt: actualArrival?.toISOString() || dayjs().toISOString(),
      });
    }

    return transports;
  }

  static generateAlerts(
    batches: Batch[],
    transports: Transport[],
    temperatureRecords: TemperatureRecord[]
  ): Alert[] {
    const alerts: Alert[] = [];
    
    // 分析温度记录，找出异常
    const recordsByBatch = new Map<string, TemperatureRecord[]>();
    temperatureRecords.forEach(record => {
      if (!recordsByBatch.has(record.batchId)) {
        recordsByBatch.set(record.batchId, []);
      }
      recordsByBatch.get(record.batchId)!.push(record);
    });

    recordsByBatch.forEach((records, batchId) => {
      const batch = batches.find(b => b.id === batchId);
      if (!batch) return;

      const tempMin = batch.temperatureRequirement.min;
      const tempMax = batch.temperatureRequirement.max;

      // 检查温度异常
      records.forEach((record, index) => {
        if (record.temperature < tempMin || record.temperature > tempMax) {
          // 检查是否是连续异常
          const consecutiveAbnormal = records
            .slice(Math.max(0, index - 10), index + 1)
            .filter(r => r.temperature < tempMin || r.temperature > tempMax).length;

          if (consecutiveAbnormal >= 3) {
            const severity = consecutiveAbnormal >= 20 ? 'critical' : consecutiveAbnormal >= 10 ? 'high' : 'medium';
            const alertType = record.temperature > tempMax ? 'temperature_high' : 'temperature_low';

            alerts.push({
              id: uuidv4(),
              batchId,
              transportId: transports.find(t => t.batchIds.includes(batchId))?.id,
              deviceId: record.deviceId,
              alertType,
              severity,
              title: `批次 ${batch.batchNo} 温度${alertType === 'temperature_high' ? '过高' : '过低'}`,
              description: `检测到批次 ${batch.batchNo} 在 ${dayjs(record.timestamp).format('YYYY-MM-DD HH:mm')} 温度异常：${record.temperature}°C，超出范围 [${tempMin}°C, ${tempMax}°C]`,
              temperature: record.temperature,
              expectedRange: { min: tempMin, max: tempMax },
              status: severity === 'critical' ? 'active' : randomChoice(['active', 'acknowledged', 'resolved']),
              createdAt: record.timestamp,
              updatedAt: record.timestamp,
            });
          }
        }
      });
    });

    // 生成一些其他类型的告警
    transports.forEach(transport => {
      if (transport.status === 'abnormal') {
        alerts.push({
          id: uuidv4(),
          batchId: transport.batchIds[0],
          transportId: transport.id,
          deviceId: uuidv4(),
          alertType: 'delayed',
          severity: 'medium',
          title: `运输 ${transport.transportNo} 延迟`,
          description: `运输任务 ${transport.transportNo} 预计到达时间已过，但尚未到达目的地`,
          status: randomChoice(['active', 'acknowledged', 'resolved']),
          createdAt: transport.estimatedArrivalTime,
          updatedAt: transport.updatedAt,
        });
      }
    });

    return alerts;
  }

  static generateTraceRecords(batches: Batch[], companies: Company[]): TraceRecord[] {
    const records: TraceRecord[] = [];
    const producers = companies.filter(c => c.type === 'producer');
    const distributors = companies.filter(c => c.type === 'distributor');
    const hospitals = companies.filter(c => c.type === 'hospital' || c.type === 'pharmacy');

    batches.forEach(batch => {
      const producer = producers.find(c => c.id === batch.manufacturerId);
      if (!producer) return;

      let currentTime = dayjs(batch.productionDate);
      let currentCompany = producer;
      let currentCompanyName = producer.name;

      // 生产事件
      records.push({
        id: uuidv4(),
        batchId: batch.id,
        eventType: 'production',
        location: producer.address,
        companyId: producer.id,
        companyName: producer.name,
        operator: `操作员${randomInt(1, 50)}`,
        operatorId: uuidv4(),
        timestamp: currentTime.toISOString(),
        quantity: batch.quantity,
        notes: `批次 ${batch.batchNo} 生产完成`,
        createdAt: currentTime.toISOString(),
      });

      // 入库
      currentTime = currentTime.add(randomInt(1, 6), 'hour');
      records.push({
        id: uuidv4(),
        batchId: batch.id,
        eventType: 'storage_in',
        location: `${producer.name}冷库`,
        companyId: producer.id,
        companyName: producer.name,
        operator: `仓库管理员${randomInt(1, 20)}`,
        operatorId: uuidv4(),
        timestamp: currentTime.toISOString(),
        temperature: randomFloat(batch.temperatureRequirement.min, batch.temperatureRequirement.max),
        quantity: batch.quantity,
        notes: `批次 ${batch.batchNo} 入库`,
        createdAt: currentTime.toISOString(),
      });

      // 出库
      if (batch.status !== 'in_production') {
        currentTime = currentTime.add(randomInt(1, 30), 'day');
        records.push({
          id: uuidv4(),
          batchId: batch.id,
          eventType: 'storage_out',
          location: `${producer.name}冷库`,
          companyId: producer.id,
          companyName: producer.name,
          operator: `仓库管理员${randomInt(1, 20)}`,
          operatorId: uuidv4(),
          timestamp: currentTime.toISOString(),
          temperature: randomFloat(batch.temperatureRequirement.min, batch.temperatureRequirement.max),
          quantity: batch.quantity,
          notes: `批次 ${batch.batchNo} 出库`,
          createdAt: currentTime.toISOString(),
        });

        // 如果是配送，记录配送商
        if (batch.status === 'in_transit' || batch.status === 'delivered') {
          const distributor = randomChoice(distributors);
          currentTime = currentTime.add(randomInt(1, 6), 'hour');
          records.push({
            id: uuidv4(),
            batchId: batch.id,
            eventType: 'transport_start',
            location: distributor.address,
            companyId: distributor.id,
            companyName: distributor.name,
            operator: `物流员${randomInt(1, 30)}`,
            operatorId: uuidv4(),
            timestamp: currentTime.toISOString(),
            temperature: randomFloat(batch.temperatureRequirement.min, batch.temperatureRequirement.max),
            notes: `批次 ${batch.batchNo} 开始运输`,
            createdAt: currentTime.toISOString(),
          });

          // 送达
          if (batch.status === 'delivered') {
            const destination = randomChoice([...distributors, ...hospitals].filter(c => c.id !== distributor.id));
            currentTime = currentTime.add(randomInt(4, 12), 'hour');
            records.push({
              id: uuidv4(),
              batchId: batch.id,
              eventType: 'delivery',
              location: destination.address,
              companyId: destination.id,
              companyName: destination.name,
              operator: `收货员${randomInt(1, 20)}`,
              operatorId: uuidv4(),
              timestamp: currentTime.toISOString(),
              temperature: randomFloat(batch.temperatureRequirement.min, batch.temperatureRequirement.max),
              quantity: batch.quantity,
              notes: `批次 ${batch.batchNo} 送达`,
              createdAt: currentTime.toISOString(),
            });
          }
        }
      }
    });

    return records;
  }
}

