import bcrypt from 'bcryptjs';
import { storage } from '../storage/fileStorage';

// 中文姓名库
const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'];
const givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀', '霞', '平', '刚', '桂', '英', '华', '文', '红', '建', '鹏', '飞', '辉', '雪'];

// 设备类型和名称
const equipmentTypes = [
  { name: '数控车床', model: 'CNC-X500', category: '加工设备' },
  { name: '数控铣床', model: 'CNC-Y800', category: '加工设备' },
  { name: '加工中心', model: 'MC-1000', category: '加工设备' },
  { name: '空压机', model: 'AC-200', category: '动力设备' },
  { name: '变压器', model: 'TR-1000KVA', category: '电力设备' },
  { name: '冷却塔', model: 'CT-500', category: '辅助设备' },
  { name: '叉车', model: 'FC-3T', category: '运输设备' },
  { name: '电梯', model: 'EL-1500KG', category: '运输设备' },
  { name: '压力机', model: 'PR-500T', category: '加工设备' },
  { name: '焊接机', model: 'WL-400A', category: '加工设备' },
];

// 供应商名称
const suppliers = [
  '上海精密机械制造有限公司',
  '北京工业设备股份有限公司',
  '深圳智能装备科技有限公司',
  '苏州机械设备有限公司',
  '广州重工机械有限公司',
  '杭州数控设备有限公司',
  '成都精密仪器有限公司',
  '武汉自动化设备有限公司',
];

// 部门名称
const departments = ['生产部', '工程部', '设备部', '维修部', '质量部', '技术部', '动力车间', '机加工车间'];

// 位置信息
const workshops = ['A车间', 'B车间', 'C车间', '动力车间', '装配车间'];
const locations = ['A区1号工位', 'A区2号工位', 'A区3号工位', 'B区1号工位', 'B区2号工位', 'C区1号工位'];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateChineseName(): string {
  const surname = randomElement(surnames);
  const givenName1 = randomElement(givenNames);
  const givenName2 = Math.random() > 0.5 ? randomElement(givenNames) : '';
  return surname + givenName1 + givenName2;
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

async function generateData() {
  console.log('开始生成模拟数据...');

  // 1. 生成用户
  console.log('生成用户数据...');
  const roles = ['admin', 'manager', 'technician', 'operator'];
  const users = [];
  for (let i = 0; i < 50; i++) {
    const name = generateChineseName();
    const email = `user${i + 1}@company.com`;
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
      role: randomElement(roles),
      department: randomElement(departments),
      phone: `1${randomInt(3, 9)}${randomInt(100000000, 999999999)}`,
    });
    users.push(user);
  }
  console.log(`已生成 ${users.length} 个用户`);

  // 2. 生成设备
  console.log('生成设备数据...');
  const equipmentList = [];
  for (let i = 0; i < 150; i++) {
    const type = randomElement(equipmentTypes);
    const code = `EQ-${String(i + 1).padStart(4, '0')}`;
    const purchaseDate = randomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
    const warrantyDate = new Date(purchaseDate);
    warrantyDate.setFullYear(warrantyDate.getFullYear() + 2);

    const equipment = await storage.createEquipment({
      code,
      name: `${type.name}-${String(i + 1).padStart(3, '0')}`,
      model: type.model,
      category: type.category,
      serialNumber: `SN-${randomInt(100000, 999999)}`,
      supplier: randomElement(suppliers),
      purchaseDate,
      purchasePrice: randomInt(50000, 500000),
      warrantyExpiryDate: warrantyDate.toISOString(),
      department: randomElement(departments),
      workshop: randomElement(workshops),
      location: randomElement(locations),
      responsiblePerson: randomElement(users).name,
      responsiblePersonId: randomElement(users).id,
      status: randomElement(['normal', 'maintenance', 'repair', 'idle']),
      healthScore: randomInt(60, 100),
      power: randomFloat(10, 100),
      weight: randomFloat(500, 5000),
      installationDate: purchaseDate,
    });
    equipmentList.push(equipment);
  }
  console.log(`已生成 ${equipmentList.length} 台设备`);

  // 3. 生成维保计划
  console.log('生成维保计划数据...');
  const maintenanceTypes = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  for (const equipment of equipmentList.slice(0, 100)) {
    const lastMaintenance = randomDate(new Date(2023, 0, 1), new Date());
    const maintenanceType = randomElement(maintenanceTypes);
    let nextDate = new Date(lastMaintenance);
    
    switch (maintenanceType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    await storage.createMaintenancePlan({
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      maintenanceType,
      scheduledDate: nextDate.toISOString(),
      lastMaintenanceDate: lastMaintenance,
      tasks: ['清洁设备', '检查润滑', '紧固螺栓', '校准精度'],
      status: Math.random() > 0.7 ? 'overdue' : randomElement(['pending', 'completed']),
      assignedTo: randomElement(users).name,
      assignedToId: randomElement(users).id,
      estimatedHours: randomFloat(1, 8, 1),
    });
  }
  console.log('已生成维保计划数据');

  // 4. 生成工单
  console.log('生成工单数据...');
  const priorities = ['urgent', 'high', 'medium', 'low'];
  const workOrderStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'closed'];
  
  for (let i = 0; i < 200; i++) {
    const equipment = randomElement(equipmentList);
    const createDate = randomDate(new Date(2023, 0, 1), new Date());
    const status = randomElement(workOrderStatuses);
    let completeDate: string | undefined;
    
    if (status === 'completed' || status === 'closed') {
      completeDate = randomDate(new Date(createDate), new Date());
    }

    await storage.createWorkOrder({
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      type: Math.random() > 0.3 ? 'repair' : 'maintenance',
      priority: randomElement(priorities),
      status,
      description: Math.random() > 0.5 ? '设备异响，需检查' : '定期保养维护',
      reportedBy: randomElement(users).name,
      reportedById: randomElement(users).id,
      assignedTo: randomElement(users).name,
      assignedToId: randomElement(users).id,
      createdAt: createDate,
      completedAt: completeDate,
      downtime: status === 'completed' || status === 'closed' ? randomInt(30, 480) : undefined,
      cost: status === 'completed' || status === 'closed' ? randomInt(500, 5000) : undefined,
    });
  }
  console.log('已生成工单数据');

  // 5. 生成备件
  console.log('生成备件数据...');
  const sparePartTypes = ['轴承', '密封圈', '过滤器', '皮带', '润滑油', '刀具', '传感器', '电机'];
  for (let i = 0; i < 100; i++) {
    const partType = randomElement(sparePartTypes);
    await storage.createSparePart({
      name: `${partType}-${String(i + 1).padStart(3, '0')}`,
      partNumber: `SP-${String(i + 1).padStart(4, '0')}`,
      category: partType,
      quantity: randomInt(0, 100),
      minQuantity: randomInt(5, 20),
      unit: '件',
      unitPrice: randomFloat(50, 5000, 2),
      supplier: randomElement(suppliers),
      location: randomElement(['A库', 'B库', 'C库']),
      equipmentIds: [randomElement(equipmentList).id],
    });
  }
  console.log('已生成备件数据');

  // 6. 生成IoT数据
  console.log('生成IoT数据...');
  const now = new Date();
  const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7天前
  
  for (const equipment of equipmentList.slice(0, 50)) {
    // 为每台设备生成7天的数据，每小时一条
    for (let i = 0; i < 7 * 24; i++) {
      const timestamp = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      await storage.createIoTData({
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        vibration: randomFloat(0.5, 5.0, 2),
        temperature: randomFloat(30, 80, 1),
        current: randomFloat(10, 50, 1),
        noise: randomFloat(60, 85, 1),
        pressure: randomFloat(0.5, 1.5, 2),
        timestamp: timestamp.toISOString(),
      });
    }
  }
  console.log('已生成IoT数据');

  // 7. 生成区块链记录
  console.log('生成区块链记录...');
  const recordTypes = ['equipment_registration', 'maintenance_record', 'repair_record', 'inspection'];
  
  // 为每台设备生成注册记录
  for (const equipment of equipmentList) {
    await storage.createBlockchainRecord({
      recordType: 'equipment_registration',
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      data: {
        code: equipment.code,
        name: equipment.name,
        purchaseDate: equipment.purchaseDate,
        supplier: equipment.supplier,
      },
    });
  }

  // 为部分工单生成区块链记录
  const completedOrders = (await storage.findAllWorkOrders({ status: 'completed' })).slice(0, 50);
  for (const order of completedOrders) {
    await storage.createBlockchainRecord({
      recordType: 'repair_record',
      equipmentId: order.equipmentId,
      equipmentCode: order.equipmentCode,
      data: {
        orderNumber: order.orderNumber,
        description: order.description,
        completedAt: order.completedAt,
        cost: order.cost,
      },
    });
  }

  console.log('已生成区块链记录');

  console.log('✅ 所有模拟数据生成完成！');
}

// 运行生成
generateData().catch(console.error);
