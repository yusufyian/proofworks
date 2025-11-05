import bcrypt from 'bcryptjs';
import { storage } from './fileStorage';
import { logger } from '../utils/logger';

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

  // 创建核心企业
  const coreCompany = await storage.createCompany({
    name: '华夏科技集团股份有限公司',
    unifiedSocialCreditCode: '91110000MA00123456',
    type: 'core_enterprise',
    creditRating: 'AAA',
    creditLimit: 500000000,
    usedCreditLimit: 0,
    address: '北京市朝阳区科技园区1号',
    contactPerson: '张总',
    contactPhone: '010-88888888',
    status: 'active'
  });

  // 创建多个供应商
  const suppliers = [
    {
      name: '华东电子材料有限公司',
      code: '91110000MA00234567',
      rating: 'AA',
    },
    {
      name: '华南精密制造股份有限公司',
      code: '91110000MA00345678',
      rating: 'A',
    },
    {
      name: '华北物流服务有限公司',
      code: '91110000MA00456789',
      rating: 'BBB',
    },
    {
      name: '西南金属加工有限公司',
      code: '91110000MA00567890',
      rating: 'A',
    },
    {
      name: '东北化工原料有限公司',
      code: '91110000MA00678901',
      rating: 'AA',
    },
  ];

  const supplierCompanies = [];
  for (const supplier of suppliers) {
    const company = await storage.createCompany({
      name: supplier.name,
      unifiedSocialCreditCode: supplier.code,
      type: 'supplier',
      creditRating: supplier.rating,
      status: 'active'
    });
    supplierCompanies.push(company);
  }

  // 创建银行
  const banks = [
    {
      name: '工商银行供应链金融部',
      code: '91110000MA00789012',
    },
    {
      name: '建设银行数字金融中心',
      code: '91110000MA00890123',
    },
  ];

  const bankCompanies = [];
  for (const bank of banks) {
    const company = await storage.createCompany({
      name: bank.name,
      unifiedSocialCreditCode: bank.code,
      type: 'bank',
      creditRating: 'AAA',
      status: 'active'
    });
    bankCompanies.push(company);
  }

  // 创建用户
  await storage.createUser({
    email: 'admin@example.com',
    password: hashedPassword,
    companyId: coreCompany.id,
    role: 'core_enterprise',
    name: '张总经理',
    phone: '13800138000',
    status: 'active'
  });

  // 为每个供应商创建用户
  for (let i = 0; i < supplierCompanies.length; i++) {
    await storage.createUser({
      email: `supplier${i + 1}@example.com`,
      password: hashedPassword,
      companyId: supplierCompanies[i].id,
      role: 'supplier',
      name: `供应商${i + 1}用户`,
      phone: `1380013800${i + 1}`,
      status: 'active'
    });
  }

  // 为每个银行创建用户
  for (let i = 0; i < bankCompanies.length; i++) {
    await storage.createUser({
      email: `bank${i + 1}@example.com`,
      password: hashedPassword,
      companyId: bankCompanies[i].id,
      role: 'bank',
      name: `银行${i + 1}用户`,
      phone: `1380013801${i}`,
      status: 'active'
    });
  }

  // 创建凭证
  const now = new Date();
  const certificates = [];
  
  // 为每个供应商创建2-3个凭证
  for (let i = 0; i < supplierCompanies.length; i++) {
    const supplier = supplierCompanies[i];
    const certCount = 2 + (i % 2); // 2或3个
    
    for (let j = 0; j < certCount; j++) {
      const daysAgo = i * 7 + j * 3; // 分散在不同日期
      const issueDate = new Date(now);
      issueDate.setDate(issueDate.getDate() - daysAgo);
      
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(expiryDate.getDate() + 90 + j * 30); // 90-150天到期
      
      const amount = 500000 + (i + 1) * 100000 + j * 50000; // 50万-120万
      
      const cert = await storage.createCertificate({
        certificateNumber: `SCF-${Date.now()}-${i}${j}${Math.floor(Math.random() * 1000)}`,
        creditorId: coreCompany.id,
        debtorId: supplier.id,
        initialAmount: amount,
        remainingAmount: amount - (j === 0 ? amount * 0.3 : 0), // 第一个凭证可能有部分已使用
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        status: j === 0 && i < 2 ? 'pledged' : 'holding', // 前两个供应商的第一个凭证已质押
        contractHash: `contract_${Date.now()}_${i}_${j}`,
        invoiceHash: `invoice_${Date.now()}_${i}_${j}`,
        receiptHash: `receipt_${Date.now()}_${i}_${j}`,
        signature: `signature_${Date.now()}_${i}_${j}`,
        blockchainTxHash: `tx_${Date.now()}_${i}_${j}_${Math.random().toString(36).substr(2, 9)}`
      });
      certificates.push(cert);
    }
  }

  // 创建转让记录
  if (certificates.length >= 4) {
    // 转让1：供应商1转让给供应商2
    await storage.createTransfer({
      certificateId: certificates[2].id,
      fromCompanyId: supplierCompanies[0].id,
      toCompanyId: supplierCompanies[1].id,
      amount: certificates[2].remainingAmount,
      transferType: 'full',
      status: 'completed',
      blockchainTxHash: `tx_transfer_${Date.now()}_1`
    });

    // 转让2：供应商2拆分转让给供应商3
    const splitAmount = certificates[3].remainingAmount * 0.5;
    await storage.createTransfer({
      certificateId: certificates[3].id,
      fromCompanyId: supplierCompanies[1].id,
      toCompanyId: supplierCompanies[2].id,
      amount: splitAmount,
      transferType: 'split',
      status: 'completed',
      blockchainTxHash: `tx_transfer_${Date.now()}_2`
    });
  }

  // 创建融资记录
  if (certificates.length >= 2 && bankCompanies.length > 0) {
    // 融资1：已批准
    await storage.createFinancing({
      certificateId: certificates[0].id,
      applicantId: supplierCompanies[0].id,
      financierId: bankCompanies[0].id,
      amount: certificates[0].remainingAmount * 0.7,
      interestRate: 5.0,
      term: 90,
      status: 'approved',
      riskScore: 85,
      riskRating: 'AA',
      approvalDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainTxHash: `tx_financing_${Date.now()}_1`
    });

    // 融资2：已放款
    await storage.createFinancing({
      certificateId: certificates[1].id,
      applicantId: supplierCompanies[1].id,
      financierId: bankCompanies[0].id,
      amount: certificates[1].remainingAmount * 0.6,
      interestRate: 5.5,
      term: 60,
      status: 'disbursed',
      riskScore: 78,
      riskRating: 'A',
      approvalDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      disbursementDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      paymentTxHash: `tx_payment_${Date.now()}_1`,
      blockchainTxHash: `tx_financing_${Date.now()}_2`
    });

    // 融资3：待审批
    await storage.createFinancing({
      certificateId: certificates[4]?.id || certificates[0].id,
      applicantId: supplierCompanies[2]?.id || supplierCompanies[0].id,
      financierId: bankCompanies[1]?.id || bankCompanies[0].id,
      amount: (certificates[4]?.remainingAmount || certificates[0].remainingAmount) * 0.65,
      interestRate: 5.2,
      term: 75,
      status: 'pending',
      riskScore: 82,
      riskRating: 'AA',
      blockchainTxHash: `tx_financing_${Date.now()}_3`
    });
  }

  logger.info('初始测试数据创建完成');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('核心企业账号：admin@example.com / 123456');
  logger.info('供应商账号：supplier1@example.com / 123456 (共5个供应商)');
  logger.info('银行账号：bank1@example.com / 123456 (共2个银行)');
  logger.info(`已创建 ${certificates.length} 个凭证`);
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
