import { storage } from './fileStorage';
import bcrypt from 'bcryptjs';

// 初始化基础数据
export async function initializeStorage() {
  // 检查是否已有数据 - 通过尝试查找用户来判断
  try {
    const testUser = await storage.findUser({ email: 'test@test.com' });
    // 如果有任何用户存在，说明数据已初始化
    const allCompanies = await storage.findAllCompanies();
    if (allCompanies.length > 0) {
      console.log('数据已存在，跳过初始化');
      return;
    }
  } catch (error) {
    // 如果出错，继续初始化
  }

  // 创建默认排放因子
  const defaultFactors = [
    { name: '电力（华北电网）', category: 'energy' as const, unit: 'kgCO2/kWh', factor: 0.8843, source: '生态环境部2023年', version: '2023', year: 2023, region: '华北' },
    { name: '天然气', category: 'energy' as const, unit: 'kgCO2/m³', factor: 2.1622, source: '国家标准', version: '2021', year: 2021 },
    { name: '汽油', category: 'energy' as const, unit: 'kgCO2/L', factor: 2.925, source: '国家标准', version: '2021', year: 2021 },
    { name: '柴油', category: 'energy' as const, unit: 'kgCO2/L', factor: 3.0956, source: '国家标准', version: '2021', year: 2021 },
    { name: '煤炭（烟煤）', category: 'energy' as const, unit: 'kgCO2/kg', factor: 1.9003, source: '国家标准', version: '2021', year: 2021 },
    { name: '公路运输', category: 'transport' as const, unit: 'kgCO2/(t·km)', factor: 0.12, source: 'IPCC', version: '2019', year: 2019 },
    { name: '铁路运输', category: 'transport' as const, unit: 'kgCO2/(t·km)', factor: 0.018, source: 'IPCC', version: '2019', year: 2019 },
  ];

  for (const factor of defaultFactors) {
    await storage.createEmissionFactor(factor);
  }

  console.log('存储初始化完成');
}
