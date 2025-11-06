import bcrypt from 'bcryptjs';
import { storage } from './fileStorage';
import { logger } from '../utils/logger';
import {
  generateChineseName,
  generateDomesticCompanyName,
  generateForeignCompanyName,
  generateBlockchainTxHash,
  generatePhoneNumber,
  generateEmail,
  randomDate,
  randomAmount,
  generateDataClassification,
  maskData,
} from '../utils/dataGenerator';

const defaultPassword = '123456';

export async function initializeStorage() {
  try {
    logger.info('初始化文件存储...');

    // 检查是否已有数据
    const existingUsers = await storage.findUser({ email: 'admin@example.com' });
    if (!existingUsers) {
      logger.info('创建初始测试数据...');
      await createInitialData();
    } else {
      logger.info('使用现有数据');
    }

    logger.info('文件存储初始化完成');
  } catch (error) {
    logger.error('文件存储初始化失败:', error);
    throw error;
  }
}

async function createInitialData() {
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // 创建境内公司
  const domesticCompanies = [];
  for (let i = 0; i < 10; i++) {
    const name = generateDomesticCompanyName();
    const company = await storage.createCompany({
      name,
      registrationNumber: `91110000MA${String(10000000 + i).padStart(8, '0')}`,
      type: 'domestic',
      region: 'mainland',
      address: `北京市朝阳区科技园区${i + 1}号`,
      contactPerson: generateChineseName(),
      contactPhone: generatePhoneNumber('domestic'),
      status: 'active',
      createdAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
    });
    domesticCompanies.push(company);
  }

  // 创建境外公司（香港、新加坡、美国）
  const foreignCompanies = [];
  const regions: Array<'hk' | 'sg' | 'us'> = ['hk', 'sg', 'us'];
  
  for (let i = 0; i < 15; i++) {
    const region = regions[i % 3];
    const name = generateForeignCompanyName(region);
    const regionMap = { hk: '香港', sg: '新加坡', us: '美国' };
    const company = await storage.createCompany({
      name,
      registrationNumber: `${region.toUpperCase()}-${String(100000 + i).padStart(6, '0')}`,
      type: 'foreign',
      region: regionMap[region],
      address: region === 'hk' ? `香港中环${i + 1}号` : region === 'sg' ? `新加坡乌节路${i + 1}号` : `New York, ${i + 1}th Ave`,
      contactPerson: generateChineseName(),
      contactPhone: generatePhoneNumber('foreign'),
      status: 'active',
      createdAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
    });
    foreignCompanies.push(company);
  }

  // 创建用户
  const mainCompany = domesticCompanies[0];
  
  // 管理员
  await storage.createUser({
    email: 'admin@example.com',
    password: hashedPassword,
    companyId: mainCompany.id,
    role: 'admin',
    name: '管理员',
    phone: generatePhoneNumber('domestic'),
    status: 'active',
  });

  // 合规团队
  for (let i = 0; i < 5; i++) {
    const name = generateChineseName();
    await storage.createUser({
      email: `compliance${i + 1}@example.com`,
      password: hashedPassword,
      companyId: mainCompany.id,
      role: 'compliance',
      name,
      phone: generatePhoneNumber('domestic'),
      status: 'active',
    });
  }

  // 业务部门
  for (let i = 0; i < 8; i++) {
    const name = generateChineseName();
    await storage.createUser({
      email: `business${i + 1}@example.com`,
      password: hashedPassword,
      companyId: mainCompany.id,
      role: 'business',
      name,
      phone: generatePhoneNumber('domestic'),
      status: 'active',
    });
  }

  // 法务部门
  for (let i = 0; i < 3; i++) {
    const name = generateChineseName();
    await storage.createUser({
      email: `legal${i + 1}@example.com`,
      password: hashedPassword,
      companyId: mainCompany.id,
      role: 'legal',
      name,
      phone: generatePhoneNumber('domestic'),
      status: 'active',
    });
  }

  // 生成数据出境评估记录
  const assessmentPaths = ['security_assessment', 'standard_contract', 'certification'];
  const assessmentStatuses = ['approved', 'pending', 'rejected', 'expired'];
  
  for (let i = 0; i < 50; i++) {
    const path = assessmentPaths[Math.floor(Math.random() * assessmentPaths.length)];
    const status = assessmentStatuses[Math.floor(Math.random() * assessmentStatuses.length)];
    const foreignCompany = foreignCompanies[Math.floor(Math.random() * foreignCompanies.length)];
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());
    
    let approvedAt: string | null = null;
    let expiredAt: string | null = null;
    if (status === 'approved') {
      approvedAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      expiredAt = new Date(createdAt.getTime() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString();
    }

    await storage.createDataExportAssessment({
      assessmentNumber: `DEA-${createdAt.getFullYear()}${String(i + 1).padStart(6, '0')}`,
      path,
      status,
      dataType: generateDataClassification(),
      dataVolume: randomAmount(10000, 1000000),
      destinationRegion: foreignCompany.region,
      destinationCompany: foreignCompany.name,
      destinationCompanyId: foreignCompany.id,
      approvalNumber: status === 'approved' ? `APP-${createdAt.getFullYear()}${String(i + 1).padStart(6, '0')}` : null,
      approvedAt,
      expiredAt,
      blockchainTxHash: generateBlockchainTxHash(),
      createdAt: createdAt.toISOString(),
    });
  }

  // 生成标准合同
  for (let i = 0; i < 40; i++) {
    const foreignCompany = foreignCompanies[Math.floor(Math.random() * foreignCompanies.length)];
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());
    const statuses = ['signed', 'pending', 'expired'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let signedAt: string | null = null;
    let expiredAt: string | null = null;
    if (status === 'signed') {
      signedAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      expiredAt = new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    await storage.createStandardContract({
      contractNumber: `SC-${createdAt.getFullYear()}${String(i + 1).padStart(6, '0')}`,
      domesticParty: mainCompany.name,
      domesticPartyId: mainCompany.id,
      foreignParty: foreignCompany.name,
      foreignPartyId: foreignCompany.id,
      dataType: generateDataClassification(),
      dataVolume: randomAmount(5000, 500000),
      purpose: '跨境订单处理',
      status,
      signedAt,
      expiredAt,
      contractHash: generateBlockchainTxHash(),
      blockchainTxHash: status === 'signed' ? generateBlockchainTxHash() : null,
      createdAt: createdAt.toISOString(),
    });
  }

  // 生成跨境数据传输记录
  const transmissionStatuses = ['completed', 'pending', 'failed'];
  for (let i = 0; i < 200; i++) {
    const foreignCompany = foreignCompanies[Math.floor(Math.random() * foreignCompanies.length)];
    const status = transmissionStatuses[Math.floor(Math.random() * transmissionStatuses.length)];
    const createdAt = randomDate(new Date(2024, 5, 1), new Date());
    
    let completedAt: string | null = null;
    if (status === 'completed') {
      completedAt = new Date(createdAt.getTime() + Math.random() * 3600000).toISOString();
    }

    await storage.createDataTransmission({
      transmissionNumber: `DT-${createdAt.getFullYear()}${String(i + 1).padStart(8, '0')}`,
      sourceCompany: mainCompany.name,
      sourceCompanyId: mainCompany.id,
      destinationCompany: foreignCompany.name,
      destinationCompanyId: foreignCompany.id,
      dataType: generateDataClassification(),
      dataSize: randomAmount(100, 10000),
      status,
      desensitized: true,
      encrypted: true,
      completedAt,
      blockchainTxHash: status === 'completed' ? generateBlockchainTxHash() : null,
      createdAt: createdAt.toISOString(),
    });
  }

  // 生成跨境支付记录
  const paymentStatuses = ['completed', 'pending', 'rejected', 'processing'];
  const paymentChannels = ['SWIFT', 'Western Union', 'Hong Kong Bank', 'e-CNY'];
  
  for (let i = 0; i < 150; i++) {
    const foreignCompany = foreignCompanies[Math.floor(Math.random() * foreignCompanies.length)];
    const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    const channel = paymentChannels[Math.floor(Math.random() * paymentChannels.length)];
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());
    
    let completedAt: string | null = null;
    let rejectedReason: string | null = null;
    if (status === 'completed') {
      completedAt = new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString();
    } else if (status === 'rejected') {
      rejectedReason = '贸易背景材料不完整';
    }

    await storage.createCrossBorderPayment({
      paymentNumber: `CBP-${createdAt.getFullYear()}${String(i + 1).padStart(8, '0')}`,
      payerCompany: mainCompany.name,
      payerCompanyId: mainCompany.id,
      payeeCompany: foreignCompany.name,
      payeeCompanyId: foreignCompany.id,
      amount: randomAmount(10000, 50000000),
      currency: 'USD',
      channel,
      status,
      tradeBackground: '货物贸易',
      completedAt,
      rejectedReason,
      swiftReference: status === 'completed' && channel === 'SWIFT' ? `SWFT${Math.random().toString(36).substring(2, 15).toUpperCase()}` : null,
      blockchainTxHash: status === 'completed' ? generateBlockchainTxHash() : null,
      createdAt: createdAt.toISOString(),
    });
  }

  // 生成跨境供应链订单
  const orderStatuses = ['pending', 'confirmed', 'shipped', 'customs_cleared', 'delivered', 'completed'];
  
  for (let i = 0; i < 180; i++) {
    const foreignCompany = foreignCompanies[Math.floor(Math.random() * foreignCompanies.length)];
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());
    
    let customsStatus: string | null = null;
    let deliveryDate: string | null = null;
    if (status === 'customs_cleared' || status === 'delivered' || status === 'completed') {
      customsStatus = 'cleared';
    }
    if (status === 'delivered' || status === 'completed') {
      deliveryDate = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    await storage.createSupplyChainOrder({
      orderNumber: `SCO-${createdAt.getFullYear()}${String(i + 1).padStart(8, '0')}`,
      buyerCompany: mainCompany.name,
      buyerCompanyId: mainCompany.id,
      supplierCompany: foreignCompany.name,
      supplierCompanyId: foreignCompany.id,
      productName: `产品${i + 1}`,
      quantity: Math.floor(Math.random() * 1000) + 10,
      amount: randomAmount(50000, 2000000),
      currency: 'USD',
      status,
      customsStatus,
      billOfLading: status !== 'pending' ? `BL-${Math.random().toString(36).substring(2, 15).toUpperCase()}` : null,
      deliveryDate,
      blockchainTxHash: status !== 'pending' ? generateBlockchainTxHash() : null,
      createdAt: createdAt.toISOString(),
    });
  }

  // 生成监管报送记录
  const agencies = ['网信办', '海关', '外管局'];
  
  for (let i = 0; i < 60; i++) {
    const agency = agencies[Math.floor(Math.random() * agencies.length)];
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());
    const reportTypes = {
      '网信办': ['数据出境报告', '安全事件报告', '年度合规报告'],
      '海关': ['报关单数据', '舱单数据', '进出口许可证'],
      '外管局': ['大额交易报告', '可疑交易报告', '外汇收支申报'],
    };
    const reportType = reportTypes[agency as keyof typeof reportTypes][Math.floor(Math.random() * reportTypes[agency as keyof typeof reportTypes].length)];

    await storage.createRegulatoryReport({
      reportNumber: `RR-${agency}-${createdAt.getFullYear()}${String(i + 1).padStart(6, '0')}`,
      agency,
      reportType,
      period: `${createdAt.getFullYear()}Q${Math.floor((createdAt.getMonth() + 3) / 3)}`,
      status: 'submitted',
      submittedAt: createdAt.toISOString(),
      blockchainTxHash: generateBlockchainTxHash(),
      createdAt: createdAt.toISOString(),
    });
  }

  // 生成区块链记录
  const blockchainDataTypes = ['assessment', 'contract', 'transmission', 'payment', 'order', 'report'];
  
  for (let i = 0; i < 500; i++) {
    const dataType = blockchainDataTypes[Math.floor(Math.random() * blockchainDataTypes.length)];
    const createdAt = randomDate(new Date(2024, 0, 1), new Date());

    await storage.createBlockchainRecord({
      txHash: generateBlockchainTxHash(),
      dataType,
      blockNumber: Math.floor(Math.random() * 1000000) + 10000,
      blockHash: generateBlockchainTxHash(),
      timestamp: createdAt.toISOString(),
      createdAt: createdAt.toISOString(),
    });
  }

  logger.info('初始测试数据创建完成');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('管理员账号：admin@example.com / 123456');
  logger.info(`已创建 ${domesticCompanies.length} 个境内公司`);
  logger.info(`已创建 ${foreignCompanies.length} 个境外公司`);
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

