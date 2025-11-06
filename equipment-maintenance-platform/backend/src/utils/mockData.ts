import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import fileStorage from '../storage/fileStorage';
import { createBlockchainRecord, createBlockchainHash } from './blockchain';
import {
  User,
  Equipment,
  MaintenancePlan,
  WorkOrder,
  SparePart,
  HealthAssessment,
  KnowledgeBase,
  BlockchainRecord,
} from '../types';

// 中文姓名库
const FIRST_NAMES = ['明', '强', '磊', '军', '洋', '勇', '艳', '杰', '华', '娜', '秀英', '敏', '静', '丽', '浩', '伟', '勇', '超', '鹏', '飞'];
const LAST_NAMES = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];

// 设备供应商
const SUPPLIERS = [
  '海天精密机械制造有限公司',
  '沈阳机床集团股份有限公司',
  '大连机床集团有限责任公司',
  '秦川机床工具集团股份有限公司',
  '山东威达重工股份有限公司',
  '江苏亚威机床股份有限公司',
  '浙江日发精密机械股份有限公司',
  '安徽中鼎密封件股份有限公司',
  '北京精雕科技集团有限公司',
  '广州数控设备有限公司',
];

// 车间名称
const WORKSHOPS = ['生产车间A', '生产车间B', '装配车间', '机加工车间', '焊接车间', '涂装车间', '动力车间', '包装车间'];
const POSITIONS = ['1号工位', '2号工位', '3号工位', '4号工位', '5号工位', 'A区', 'B区', 'C区', 'D区'];

// 部门名称
const DEPARTMENTS = ['生产部', '设备部', '质量部', '技术部', '安全部', '物流部'];

// 设备类型和型号
const EQUIPMENT_TYPES = [
  {
    category: '数控机床',
    models: ['CNC-X500', 'CNC-X600', 'CNC-T800', 'CNC-M1000'],
    names: ['数控车床', '数控铣床', '加工中心', '数控磨床'],
  },
  {
    category: '注塑设备',
    models: ['IM-200T', 'IM-350T', 'IM-500T'],
    names: ['注塑机', '挤出机', '吹塑机'],
  },
  {
    category: '焊接设备',
    models: ['WELD-300A', 'WELD-400A', 'WELD-500A'],
    names: ['焊接机器人', '氩弧焊机', '二保焊机'],
  },
  {
    category: '空压设备',
    models: ['AIR-37KW', 'AIR-55KW', 'AIR-75KW'],
    names: ['空压机', '冷干机', '储气罐'],
  },
  {
    category: '叉车',
    models: ['FORK-2T', 'FORK-3T', 'FORK-5T'],
    names: ['电动叉车', '内燃叉车', '仓储叉车'],
  },
  {
    category: '检测设备',
    models: ['TEST-001', 'TEST-002', 'TEST-003'],
    names: ['三坐标测量机', '硬度计', '光谱仪'],
  },
];

// 备件类型
const SPARE_PART_TYPES = [
  { category: '轴承', names: ['主轴轴承', '滚珠轴承', '滚针轴承'], suppliers: ['SKF', 'NSK', 'FAG'] },
  { category: '液压件', names: ['液压泵', '液压阀', '油缸'], suppliers: ['力士乐', '派克', '伊顿'] },
  { category: '刀具', names: ['铣刀', '钻头', '车刀'], suppliers: ['株洲钻石', '山特维克', '瓦尔特'] },
  { category: '电气件', names: ['接触器', '继电器', '断路器'], suppliers: ['施耐德', '西门子', 'ABB'] },
  { category: '密封件', names: ['密封圈', '油封', '垫片'], suppliers: ['中鼎', '恩福', 'NOK'] },
  { category: '润滑油', names: ['导轨油', '液压油', '齿轮油'], suppliers: ['壳牌', '美孚', '嘉实多'] },
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generateChineseName(): string {
  return randomChoice(LAST_NAMES) + randomChoice(FIRST_NAMES);
}

function generateEmail(name: string): string {
  const domains = ['@factory.com', '@manufacturing.com', '@industrial.com'];
  const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + randomInt(100, 999);
  return username + randomChoice(domains);
}

function generatePhone(): string {
  const prefixes = ['138', '139', '150', '151', '152', '188', '189'];
  return randomChoice(prefixes) + randomInt(10000000, 99999999).toString();
}

function generateEquipmentNo(category: string, index: number): string {
  const prefix = category.slice(0, 2).toUpperCase();
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

function generateSerialNumber(): string {
  const prefix = ['SN', 'SR', 'SX'];
  return randomChoice(prefix) + randomInt(100000, 999999).toString();
}

export function generateMockData() {
  console.log('开始生成设备管理平台模拟数据...');

  // 1. 生成用户
  const users: User[] = [];
  
  // 管理员 (3个)
  for (let i = 0; i < 3; i++) {
    const name = generateChineseName();
    users.push({
      id: uuidv4(),
      username: `admin${i + 1}`,
      password: bcrypt.hashSync('123456', 10),
      name,
      email: generateEmail(name),
      role: 'admin',
      department: '设备部',
      phone: generatePhone(),
      createdAt: dayjs().subtract(randomInt(100, 365), 'days').toISOString(),
    });
  }

  // 设备管理员 (8个)
  for (let i = 0; i < 8; i++) {
    const name = generateChineseName();
    users.push({
      id: uuidv4(),
      username: `manager${i + 1}`,
      password: bcrypt.hashSync('123456', 10),
      name,
      email: generateEmail(name),
      role: 'manager',
      department: randomChoice(DEPARTMENTS),
      phone: generatePhone(),
      createdAt: dayjs().subtract(randomInt(50, 200), 'days').toISOString(),
    });
  }

  // 维修技师 (20个)
  for (let i = 0; i < 20; i++) {
    const name = generateChineseName();
    users.push({
      id: uuidv4(),
      username: `tech${i + 1}`,
      password: bcrypt.hashSync('123456', 10),
      name,
      email: generateEmail(name),
      role: 'technician',
      department: '设备部',
      phone: generatePhone(),
      createdAt: dayjs().subtract(randomInt(30, 180), 'days').toISOString(),
    });
  }

  // 操作工 (50个)
  for (let i = 0; i < 50; i++) {
    const name = generateChineseName();
    users.push({
      id: uuidv4(),
      username: `operator${i + 1}`,
      password: bcrypt.hashSync('123456', 10),
      name,
      email: generateEmail(name),
      role: 'operator',
      department: randomChoice(['生产部', '装配车间']),
      phone: generatePhone(),
      createdAt: dayjs().subtract(randomInt(10, 120), 'days').toISOString(),
    });
  }

  fileStorage.saveUsers(users);
  console.log(`✓ 生成 ${users.length} 个用户`);

  // 2. 生成设备 (150台)
  const equipment: Equipment[] = [];
  const technicians = users.filter(u => u.role === 'technician');
  const operators = users.filter(u => u.role === 'operator');
  const managers = users.filter(u => u.role === 'manager');

  for (let i = 0; i < 150; i++) {
    const eqType = randomChoice(EQUIPMENT_TYPES);
    const model = randomChoice(eqType.models);
    const name = randomChoice(eqType.names) + `-${String(i + 1).padStart(3, '0')}`;
    const purchaseDate = dayjs().subtract(randomInt(30, 1800), 'days');
    const status = randomChoice(['normal', 'normal', 'normal', 'maintenance', 'repair'] as const);
    
    const eq: Equipment = {
      id: uuidv4(),
      equipmentNo: generateEquipmentNo(eqType.category, i + 1),
      name,
      model,
      serialNumber: generateSerialNumber(),
      category: eqType.category,
      supplier: randomChoice(SUPPLIERS),
      purchaseDate: purchaseDate.toISOString(),
      purchasePrice: randomInt(50000, 2000000),
      status,
      location: {
        workshop: randomChoice(WORKSHOPS),
        position: randomChoice(POSITIONS),
      },
      responsibility: {
        department: randomChoice(DEPARTMENTS),
        person: randomChoice(operators).name,
      },
      technicalParams: {
        power: eqType.category === '空压设备' ? randomInt(30, 100) : randomInt(5, 50),
        weight: randomInt(500, 5000),
      },
      healthScore: randomInt(60, 98),
      runtimeHours: randomInt(500, 8000),
      workCycles: randomInt(1000, 50000),
      lastMaintenanceDate: dayjs().subtract(randomInt(1, 90), 'days').toISOString(),
      qrCode: `EQUIP-${i + 1}-${Date.now()}`,
      createdAt: purchaseDate.toISOString(),
      updatedAt: dayjs().subtract(randomInt(0, 7), 'days').toISOString(),
    };

    // 为部分设备添加区块链存证
    if (Math.random() > 0.3) {
      const bcRecord = createBlockchainRecord('equipment', eq.id, {
        equipmentNo: eq.equipmentNo,
        name: eq.name,
        purchaseDate: eq.purchaseDate,
        supplier: eq.supplier,
      });
      eq.blockchainHash = bcRecord.dataHash;
    }

    equipment.push(eq);
  }

  fileStorage.saveEquipment(equipment);
  console.log(`✓ 生成 ${equipment.length} 台设备`);

  // 3. 生成维保计划 (200个)
  const maintenancePlans: MaintenancePlan[] = [];
  const maintenanceTasks: Array<{ name: string; description: string; estimatedHours: number }> = [
    { name: '润滑系统检查', description: '1.检查油位\n2.清洁滤网\n3.加注润滑油', estimatedHours: 0.5 },
    { name: '导轨清洁', description: '1.停机断电\n2.擦拭导轨\n3.涂抹润滑脂', estimatedHours: 1 },
    { name: '空滤更换', description: '1.拆卸旧空滤\n2.清洁安装位\n3.安装新空滤', estimatedHours: 0.3 },
    { name: '紧固件检查', description: '1.检查所有螺栓\n2.按扭矩要求紧固\n3.标记检查日期', estimatedHours: 0.5 },
    { name: '精度检测', description: '1.校准测量设备\n2.检测加工精度\n3.记录数据', estimatedHours: 2 },
  ];

  for (let i = 0; i < 200; i++) {
    const eq = randomChoice(equipment);
    const maintenanceType = randomChoice(['calendar', 'runtime', 'cycle'] as const);
    const daysAgo = randomInt(1, 180);
    const lastMaintenance = dayjs().subtract(daysAgo, 'days');
    const nextMaintenance = lastMaintenance.add(
      maintenanceType === 'calendar' ? randomInt(30, 90) : 0,
      'days'
    );
    
    const plan: MaintenancePlan = {
      id: uuidv4(),
      equipmentId: eq.id,
      equipmentNo: eq.equipmentNo,
      equipmentName: eq.name,
      planType: 'preventive',
      maintenanceType,
      cycleDays: maintenanceType === 'calendar' ? randomInt(30, 90) : undefined,
      cycleHours: maintenanceType === 'runtime' ? randomInt(500, 2000) : undefined,
      cycleCount: maintenanceType === 'cycle' ? randomInt(1000, 10000) : undefined,
      lastMaintenanceDate: lastMaintenance.toISOString(),
      nextMaintenanceDate: nextMaintenance.toISOString(),
      tasks: maintenanceTasks.slice(0, randomInt(2, 4)).map(t => ({
        id: uuidv4(),
        ...t,
        required: Math.random() > 0.3,
      })),
      status: nextMaintenance.isBefore(dayjs()) 
        ? 'overdue' 
        : (nextMaintenance.diff(dayjs(), 'days') <= 7 ? 'scheduled' : 'scheduled'),
      assignedTo: randomChoice(technicians).id,
      createdAt: dayjs().subtract(randomInt(10, 100), 'days').toISOString(),
    };

    maintenancePlans.push(plan);
  }

  fileStorage.saveMaintenancePlans(maintenancePlans);
  console.log(`✓ 生成 ${maintenancePlans.length} 个维保计划`);

  // 4. 生成工单 (300个)
  const workOrders: WorkOrder[] = [];
  const faultDescriptions = [
    '设备运行时出现异响',
    '加工精度不达标',
    '设备无法启动',
    '温度异常升高',
    '振动过大',
    '漏油漏气',
    '电气故障',
    '机械卡滞',
  ];

  for (let i = 0; i < 300; i++) {
    const eq = randomChoice(equipment);
    const type = randomChoice(['repair', 'maintenance', 'inspection'] as const);
    const priority = randomChoice(['urgent', 'important', 'normal', 'normal', 'normal', 'low'] as const);
    const statuses: WorkOrder['status'][] = ['pending', 'assigned', 'in_progress', 'completed', 'completed'];
    const status = randomChoice(statuses);
    const reportedAt = dayjs().subtract(randomInt(1, 180), 'days');
    const completed = status === 'completed';
    
    const order: WorkOrder = {
      id: uuidv4(),
      orderNo: `WO-${dayjs(reportedAt).format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
      equipmentId: eq.id,
      equipmentNo: eq.equipmentNo,
      equipmentName: eq.name,
      type,
      priority,
      status,
      reportedBy: randomChoice(operators).id,
      reportedAt: reportedAt.toISOString(),
      assignedTo: status !== 'pending' ? randomChoice(technicians).id : undefined,
      assignedAt: status !== 'pending' ? dayjs(reportedAt).add(randomInt(10, 120), 'minutes').toISOString() : undefined,
      faultDescription: type === 'repair' ? randomChoice(faultDescriptions) : undefined,
      faultPhenomenon: type === 'repair' ? '详细故障现象描述...' : undefined,
      diagnosticResult: completed ? '诊断完成，已确定故障原因' : undefined,
      repairActions: completed ? '已完成维修，更换相关部件' : undefined,
      startTime: status !== 'pending' ? dayjs(reportedAt).add(randomInt(30, 180), 'minutes').toISOString() : undefined,
      endTime: completed ? dayjs(reportedAt).add(randomInt(2, 8), 'hours').toISOString() : undefined,
      downtimeHours: completed ? randomFloat(0.5, 8) : undefined,
      cost: completed ? randomInt(500, 50000) : undefined,
      acceptance: completed ? {
        acceptedBy: randomChoice(operators).id,
        acceptedAt: dayjs(reportedAt).add(randomInt(2, 8), 'hours').add(randomInt(10, 60), 'minutes').toISOString(),
        comment: '维修完成，设备运行正常',
      } : undefined,
      createdAt: reportedAt.toISOString(),
      updatedAt: completed ? dayjs(reportedAt).add(randomInt(2, 8), 'hours').toISOString() : reportedAt.toISOString(),
    };

    // 为完成的工单添加区块链存证
    if (completed && Math.random() > 0.4) {
      const bcRecord = createBlockchainRecord('repair', order.id, {
        orderNo: order.orderNo,
        equipmentNo: order.equipmentNo,
        repairActions: order.repairActions,
        cost: order.cost,
        downtimeHours: order.downtimeHours,
      });
      order.blockchainHash = bcRecord.dataHash;
    }

    workOrders.push(order);
  }

  fileStorage.saveWorkOrders(workOrders);
  console.log(`✓ 生成 ${workOrders.length} 个工单`);

  // 5. 生成备件 (100个)
  const spareParts: SparePart[] = [];
  
  SPARE_PART_TYPES.forEach((partType, typeIndex) => {
    partType.names.forEach((name, nameIndex) => {
      const part: SparePart = {
        id: uuidv4(),
        partNo: `SP-${String(typeIndex + 1).padStart(2, '0')}-${String(nameIndex + 1).padStart(3, '0')}`,
        name,
        model: `MODEL-${randomInt(100, 999)}`,
        category: partType.category,
        unit: partType.category === '润滑油' ? '升' : '件',
        currentStock: randomInt(10, 500),
        minStock: randomInt(5, 50),
        safeStock: randomInt(20, 100),
        maxStock: randomInt(200, 1000),
        unitPrice: randomInt(50, 5000),
        supplier: randomChoice(partType.suppliers),
        abcClass: randomChoice(['A', 'B', 'C'] as const),
        location: `仓库-${randomInt(1, 5)}区-${randomInt(1, 20)}号货架`,
        createdAt: dayjs().subtract(randomInt(10, 200), 'days').toISOString(),
        updatedAt: dayjs().subtract(randomInt(0, 10), 'days').toISOString(),
      };
      spareParts.push(part);
    });
  });

  fileStorage.saveSpareParts(spareParts);
  console.log(`✓ 生成 ${spareParts.length} 个备件`);

  // 6. 生成健康度评估 (500个)
  const healthAssessments: HealthAssessment[] = [];
  
  for (let i = 0; i < 500; i++) {
    const eq = randomChoice(equipment);
    const vibration = randomFloat(0.5, 8);
    const temperature = randomFloat(30, 90);
    const current = randomFloat(80, 120);
    const noise = randomFloat(60, 95);
    const performance = randomFloat(0.005, 0.05);

    const vibrationScore = vibration < 2 ? 100 : (vibration < 5 ? 70 : 40);
    const tempScore = temperature < 60 ? 100 : (temperature < 80 ? 70 : 40);
    const currentScore = Math.abs(current - 100) < 10 ? 100 : (Math.abs(current - 100) < 20 ? 70 : 40);
    const noiseScore = noise < 75 ? 100 : (noise < 85 ? 70 : 40);
    const perfScore = performance < 0.01 ? 100 : (performance < 0.05 ? 70 : 40);

    const healthScore = Math.round(
      vibrationScore * 0.3 + tempScore * 0.25 + currentScore * 0.2 + noiseScore * 0.15 + perfScore * 0.1
    );

    const level = healthScore >= 90 ? 'excellent' 
      : healthScore >= 70 ? 'good'
      : healthScore >= 50 ? 'fair'
      : 'poor';

    const assessment: HealthAssessment = {
      id: uuidv4(),
      equipmentId: eq.id,
      equipmentNo: eq.equipmentNo,
      assessmentDate: dayjs().subtract(randomInt(1, 30), 'days').toISOString(),
      healthScore,
      indicators: {
        vibration: {
          value: vibration,
          normal: vibration < 5,
          score: vibrationScore,
        },
        temperature: {
          value: temperature,
          normal: temperature < 80,
          score: tempScore,
        },
        current: {
          value: current,
          normal: Math.abs(current - 100) < 20,
          score: currentScore,
        },
        noise: {
          value: noise,
          normal: noise < 85,
          score: noiseScore,
        },
        performance: {
          value: performance,
          normal: performance < 0.05,
          score: perfScore,
        },
      },
      level,
      recommendation: healthScore < 60 ? '建议立即检修，更换相关部件' : undefined,
      createdAt: dayjs().subtract(randomInt(1, 30), 'days').toISOString(),
    };

    healthAssessments.push(assessment);
  }

  fileStorage.saveHealthAssessments(healthAssessments);
  console.log(`✓ 生成 ${healthAssessments.length} 个健康度评估`);

  // 7. 生成知识库 (50条)
  const knowledgeBase: KnowledgeBase[] = [];
  const symptoms = [
    '主轴异响',
    '加工精度下降',
    '设备无法启动',
    '温度异常',
    '振动过大',
    '漏油',
    '电气故障',
    '卡滞',
  ];

  for (let i = 0; i < 50; i++) {
    const eqType = randomChoice(EQUIPMENT_TYPES);
    const symptom = randomChoice(symptoms);
    
    const knowledge: KnowledgeBase = {
      id: uuidv4(),
      equipmentType: eqType.category,
      faultCode: `FC-${randomInt(1000, 9999)}`,
      symptom,
      possibleCauses: [
        '轴承磨损',
        '润滑不良',
        '部件松动',
        '电气故障',
      ].slice(0, randomInt(2, 4)),
      diagnosticSteps: [
        '1. 目视检查设备外观',
        '2. 听声音判断异响位置',
        '3. 检查相关部件',
        '4. 测量关键参数',
      ].slice(0, randomInt(3, 5)),
      solutions: [
        {
          cause: '轴承磨损',
          solution: '更换主轴轴承',
          spareParts: ['主轴轴承-NSK-7010'],
          estimatedTime: '4小时',
          skillRequired: '高级技师',
        },
      ],
      createdAt: dayjs().subtract(randomInt(10, 200), 'days').toISOString(),
      updatedAt: dayjs().subtract(randomInt(0, 50), 'days').toISOString(),
    };

    knowledgeBase.push(knowledge);
  }

  fileStorage.saveKnowledgeBase(knowledgeBase);
  console.log(`✓ 生成 ${knowledgeBase.length} 条知识库记录`);

  // 8. 生成区块链记录
  const blockchainRecords: BlockchainRecord[] = [];
  
  // 从设备和工单中提取区块链记录
  equipment.forEach(eq => {
    if (eq.blockchainHash) {
      const bcRecord = createBlockchainRecord('equipment', eq.id, {
        equipmentNo: eq.equipmentNo,
        name: eq.name,
        purchaseDate: eq.purchaseDate,
      });
      blockchainRecords.push(bcRecord);
    }
  });

  workOrders.forEach(wo => {
    if (wo.blockchainHash) {
      const bcRecord = createBlockchainRecord('repair', wo.id, {
        orderNo: wo.orderNo,
        equipmentNo: wo.equipmentNo,
        repairActions: wo.repairActions,
      });
      blockchainRecords.push(bcRecord);
    }
  });

  fileStorage.saveBlockchainRecords(blockchainRecords);
  console.log(`✓ 生成 ${blockchainRecords.length} 条区块链记录`);

  console.log('模拟数据生成完成！');
}

