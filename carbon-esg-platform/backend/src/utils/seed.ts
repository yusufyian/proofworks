import bcrypt from 'bcryptjs';
import { storage } from '../storage/fileStorage';
import { mockBlockchainCertify } from './blockchain';
import type { Company, User } from '../types';

// 逼真的中文人名库
const CHINESE_NAMES = [
  '张伟', '王芳', '李娜', '刘强', '陈静', '杨洋', '赵敏', '黄磊', '周杰', '吴磊',
  '徐静', '朱琳', '马超', '胡军', '郭涛', '何静', '罗强', '高翔', '林峰', '郑洁',
  '韩雪', '冯军', '于洋', '董静', '萧峰', '程雪', '曹阳', '袁芳', '邓超', '许巍',
  '傅雷', '沈腾', '曾志', '彭勃', '吕方', '卢俊', '蒋雯', '蔡明', '贾玲', '丁磊',
  '魏晨', '薛凯', '叶青', '阎维', '余文', '潘虹', '杜江', '戴军', '夏雨', '钟丽',
  '汪涵', '田亮', '任泉', '姜文', '方文', '石磊', '姚晨', '谭晶', '廖凡', '邹凯',
  '熊黛', '金晨', '白百', '关晓', '杨幂', '刘诗', '唐嫣', '佟丽', '赵丽', '迪丽',
  '古力', '欧阳', '司马', '上官', '诸葛', '东方', '尉迟', '令狐', '慕容', '完颜',
];

// 逼真的公司名库
const COMPANY_NAMES = [
  '北京绿色能源科技有限公司', '上海环保新材料股份有限公司', '深圳低碳制造集团',
  '广州碳中和实业有限公司', '杭州新能源技术开发公司', '成都绿色建筑科技股份公司',
  '西安节能环保产业集团', '武汉清洁能源有限公司', '南京环保工程股份有限公司',
  '苏州低碳科技发展有限公司', '天津绿色化工集团', '重庆环保新材料科技有限公司',
  '青岛新能源装备制造有限公司', '大连节能技术股份公司', '济南绿色建筑材料有限公司',
  '长沙新能源技术开发集团', '郑州环保科技股份有限公司', '合肥低碳产业集团',
  '福州绿色能源科技有限公司', '南昌环保新材料股份公司', '石家庄新能源开发有限公司',
  '太原节能环保科技集团', '哈尔滨绿色化工有限公司', '长春新能源技术股份公司',
  '沈阳环保材料制造集团', '昆明低碳科技发展有限公司', '贵阳绿色建筑材料股份公司',
  '南宁新能源装备有限公司', '海口环保科技开发集团', '兰州节能技术股份有限公司',
];

const INDUSTRIES = [
  '制造业', '能源行业', '化工行业', '建筑材料', '电力行业', '交通运输',
  '冶金行业', '电子制造', '食品饮料', '纺织服装', '造纸印刷', '汽车制造',
];

const REGIONS = [
  '北京', '上海', '深圳', '广州', '杭州', '成都', '西安', '武汉', '南京', '苏州',
  '天津', '重庆', '青岛', '大连', '济南', '长沙', '郑州', '合肥', '福州', '南昌',
];

// 生成统一社会信用代码
function generateCreditCode(): string {
  const prefix = '91110'; // 北京地区代码
  const random = Math.random().toString().slice(2, 18).padEnd(13, '0');
  return prefix + random.slice(0, 13);
}

// 英文名字库（用于生成邮箱，使用通用常见名字，避免与真实人物混淆）
const ENGLISH_NAMES = [
  'user', 'admin', 'manager', 'staff', 'person', 'member', 'contact', 'support',
  'test', 'demo', 'sample', 'example', 'account', 'client', 'customer', 'operator',
  'agent', 'assistant', 'coordinator', 'executive', 'director', 'officer', 'representative', 'specialist',
  'analyst', 'consultant', 'engineer', 'technician', 'associate', 'partner', 'supervisor', 'coordinator',
  'handler', 'processor', 'validator', 'reviewer', 'auditor', 'inspector', 'examiner', 'evaluator',
  'monitor', 'tracker', 'reporter', 'recorder', 'archivist', 'librarian', 'curator', 'cataloger'
];

// 生成随机邮箱（只使用英文字母和数字）
function generateEmail(name: string, company: string, index?: number): string {
  const domains = ['carbon-esg.com', 'green-energy.cn', 'ecotech.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  // 使用英文名字库和索引生成唯一邮箱
  const firstName = ENGLISH_NAMES[Math.floor(Math.random() * ENGLISH_NAMES.length)];
  const lastName = ENGLISH_NAMES[Math.floor(Math.random() * ENGLISH_NAMES.length)];
  const number = index !== undefined ? index : Math.floor(Math.random() * 10000);
  
  // 确保邮箱只包含英文字母、数字、点号和连字符
  return `${firstName}.${lastName}${number}@${domain}`;
}

// 生成随机手机号
function generatePhone(): string {
  const prefixes = ['138', '139', '150', '151', '152', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

// 生成日期字符串（YYYY-MM）
function generatePeriod(year: number, month: number): string {
  return `${year}-${month.toString().padStart(2, '0')}`;
}

async function generateSeedData() {
  console.log('开始生成模拟数据...');

  // 1. 创建公司
  const companies: Company[] = [];
  for (let i = 0; i < 30; i++) {
    const name = COMPANY_NAMES[i] || `环保科技公司${i + 1}`;
    const company = await storage.createCompany({
      name,
      unifiedSocialCreditCode: generateCreditCode(),
      industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      address: `${REGIONS[Math.floor(Math.random() * REGIONS.length)]}市高新技术开发区科技路${i + 1}号`,
      contactPerson: CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)],
      contactPhone: generatePhone(),
      contactEmail: generateEmail('', name, i),
    });
    companies.push(company);
  }

  // 2. 创建用户
  const users: User[] = [];
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const password = await bcrypt.hash('123456', 10);

    // 企业用户
    const enterpriseUser = await storage.createUser({
      email: generateEmail('', company.name, i * 2),
      password,
      name: CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)],
      role: 'enterprise',
      companyId: company.id,
    });
    users.push(enterpriseUser);

    // 供应商用户（部分公司）
    if (i < 20) {
      const supplierUser = await storage.createUser({
        email: generateEmail('', company.name, i * 2 + 1),
        password,
        name: CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)],
        role: 'supplier',
        companyId: company.id,
      });
      users.push(supplierUser);
    }
  }

  // 创建核证机构用户
  const verifierCompanyNames = [
    '中国质量认证中心',
    '中环联合认证中心',
    '上海环境能源交易所',
  ];
  const verifierCompanyIds: string[] = [];

  for (let vcIndex = 0; vcIndex < verifierCompanyNames.length; vcIndex++) {
    const vcName = verifierCompanyNames[vcIndex];
    const verifierCompany = await storage.createCompany({
      name: vcName,
      unifiedSocialCreditCode: generateCreditCode(),
      industry: '认证服务',
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      address: `${REGIONS[Math.floor(Math.random() * REGIONS.length)]}市认证服务区`,
      contactPerson: CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)],
      contactPhone: generatePhone(),
      contactEmail: generateEmail('', vcName, companies.length + vcIndex),
    });
    verifierCompanyIds.push(verifierCompany.id);

    const password = await bcrypt.hash('123456', 10);
    const verifierUser = await storage.createUser({
      email: generateEmail('', vcName, companies.length * 3 + vcIndex),
      password,
      name: CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)],
      role: 'verifier',
      companyId: verifierCompany.id,
    });
    users.push(verifierUser);
  }

  // 3. 生成碳盘查数据
  const currentYear = 2024;
  const currentMonth = 10; // 10月

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    
    // 为每个公司生成过去12个月的碳盘查数据
    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const year = currentYear - (monthOffset >= currentMonth ? 1 : 0);
      const month = (currentMonth - monthOffset + 12) % 12 || 12;
      const period = generatePeriod(year, month);

      // 范围1排放（直接排放）
      const scope1Base = Math.random() * 3000 + 2000;
      // 范围2排放（外购电力）
      const scope2Base = Math.random() * 8000 + 5000;
      // 范围3排放（其他间接）
      const scope3Base = Math.random() * 5000 + 3000;

      // 添加一些趋势变化
      const trendFactor = 1 - (monthOffset * 0.02); // 逐年下降2%

      const scope1Emissions = Math.round(scope1Base * trendFactor);
      const scope2Emissions = Math.round(scope2Base * trendFactor);
      const scope3Emissions = Math.round(scope3Base * trendFactor);
      const totalEmissions = scope1Emissions + scope2Emissions + scope3Emissions;

      let status: 'draft' | 'submitted' | 'verified' | 'certified' = 'draft';
      if (monthOffset <= 2) {
        status = Math.random() > 0.3 ? 'certified' : 'verified';
      } else if (monthOffset <= 5) {
        status = Math.random() > 0.5 ? 'verified' : 'submitted';
      }

      const inventoryData: any = {
        companyId: company.id,
        period,
        scope1Emissions,
        scope2Emissions,
        scope3Emissions,
        totalEmissions,
        status,
        verifiedBy: status === 'certified' || status === 'verified' 
          ? verifierCompanyIds[Math.floor(Math.random() * verifierCompanyIds.length)] 
          : undefined,
        verifiedAt: status === 'certified' || status === 'verified' 
          ? new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString() 
          : undefined,
        certificationNumber: status === 'certified' 
          ? `CARB-${year}${month.toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` 
          : undefined,
      };

      // 如果已认证，自动上链存证
      if (status === 'certified' || status === 'verified') {
        const blockchainData = mockBlockchainCertify(inventoryData);
        inventoryData.blockchainHash = blockchainData.transactionHash;
      }

      const inventory = await storage.createCarbonInventory(inventoryData);

      // 生成活动数据
      const activitySources = [
        { name: '燃煤锅炉', scope: 'scope1' as const, type: 'coal' },
        { name: '公司车辆', scope: 'scope1' as const, type: 'vehicle' },
        { name: '外购电力', scope: 'scope2' as const, type: 'electricity' },
        { name: '外购热力', scope: 'scope2' as const, type: 'heat' },
        { name: '差旅交通', scope: 'scope3' as const, type: 'travel' },
        { name: '物流运输', scope: 'scope3' as const, type: 'logistics' },
      ];

      for (const source of activitySources) {
        const activityAmount = Math.random() * 10000 + 5000;
        await storage.createActivityData({
          companyId: company.id,
          emissionSourceId: `source-${source.name}`,
          emissionSourceName: source.name,
          scope: source.scope,
          activityType: source.type,
          activityData: Math.round(activityAmount),
          unit: source.type === 'electricity' ? 'kWh' : source.type === 'vehicle' ? 'L' : 'kg',
          period,
          dataSource: Math.random() > 0.3 ? 'iot' : 'manual',
        });
      }
    }
  }

  // 4. 生成产品碳足迹
  const productNames = [
    '智能手机', '笔记本电脑', 'LED灯泡', '太阳能电池板', '电动汽车',
    '节能空调', '新能源汽车', '智能电视', '平板电脑', '智能手表',
    '电动车电池', '风力发电机', '储能电池', '太阳能充电器', '环保包装',
  ];

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const productCount = Math.floor(Math.random() * 5) + 3; // 每个公司3-7个产品

    for (let j = 0; j < productCount; j++) {
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const rawMaterial = Math.random() * 40 + 20;
      const manufacturing = Math.random() * 25 + 15;
      const transportation = Math.random() * 8 + 3;
      const use = Math.random() * 20 + 10;
      const disposal = Math.random() * 7 + 3;
      const lcaResult = rawMaterial + manufacturing + transportation + use + disposal;

      const verified = Math.random() > 0.4;
      let carbonLabel: 'A' | 'B' | 'C' | undefined;
      if (lcaResult < 50) carbonLabel = 'A';
      else if (lcaResult < 100) carbonLabel = 'B';
      else carbonLabel = 'C';

      const productData: any = {
        productId: `PROD-${company.id}-${j}`,
        productName,
        companyId: company.id,
        functionalUnit: '件',
        lcaResult: Math.round(lcaResult * 10) / 10,
        stages: {
          rawMaterial: Math.round(rawMaterial * 10) / 10,
          manufacturing: Math.round(manufacturing * 10) / 10,
          transportation: Math.round(transportation * 10) / 10,
          use: Math.round(use * 10) / 10,
          disposal: Math.round(disposal * 10) / 10,
        },
        carbonLabel,
        verified,
        verifiedBy: verified ? verifierCompanyIds[Math.floor(Math.random() * verifierCompanyIds.length)] : undefined,
        verifiedAt: verified ? new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1).toISOString() : undefined,
      };

      // 如果已核证，自动上链存证
      if (verified) {
        const blockchainData = mockBlockchainCertify(productData);
        productData.blockchainHash = blockchainData.transactionHash;
      }

      await storage.createProductCarbonFootprint(productData);
    }
  }

  // 5. 生成减排项目
  const projectTypes: Array<'renewable_energy' | 'energy_efficiency' | 'forestry' | 'other'> = [
    'renewable_energy', 'energy_efficiency', 'forestry', 'other',
  ];
  const projectNames = [
    '屋顶分布式光伏发电项目', 'LED照明节能改造项目', '工业余热回收利用项目',
    '新能源汽车替换项目', '森林碳汇项目', '建筑节能改造项目',
    '工艺优化减排项目', '可再生能源采购项目', '碳捕捉与封存项目',
  ];

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const projectCount = Math.floor(Math.random() * 4) + 1; // 每个公司1-4个项目

    for (let j = 0; j < projectCount; j++) {
      const projectName = projectNames[Math.floor(Math.random() * projectNames.length)];
      const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
      const baselineEmissions = Math.random() * 5000 + 2000;
      const reductionRate = Math.random() * 0.4 + 0.2; // 减排20%-60%
      const actualEmissions = baselineEmissions * (1 - reductionRate);
      const reductionAmount = baselineEmissions - actualEmissions;

      const statuses: Array<'planning' | 'monitoring' | 'verification' | 'certified' | 'trading'> = [
        'planning', 'monitoring', 'verification', 'certified', 'trading',
      ];
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const status = statuses[statusIndex];

      const projectData: any = {
        companyId: company.id,
        projectName,
        projectType,
        baselineEmissions: Math.round(baselineEmissions),
        actualEmissions: Math.round(actualEmissions),
        reductionAmount: Math.round(reductionAmount),
        vintage: (2024 - Math.floor(Math.random() * 3)).toString(),
        methodology: `CM-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}-V01`,
        status,
        verifiedBy: status === 'certified' || status === 'trading'
          ? verifierCompanyIds[Math.floor(Math.random() * verifierCompanyIds.length)]
          : undefined,
        verifiedAt: status === 'certified' || status === 'trading'
          ? new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1).toISOString()
          : undefined,
        certificationNumber: status === 'certified' || status === 'trading'
          ? `CCER-2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
          : undefined,
      };

      // 如果已认证或交易中，自动上链存证（生成CCER代币）
      if (status === 'certified' || status === 'trading') {
        const blockchainData = mockBlockchainCertify(projectData);
        projectData.blockchainTokenId = blockchainData.transactionHash;
      }

      await storage.createReductionProject(projectData);
    }
  }

  // 6. 生成ESG报告
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const standards: Array<'GRI' | 'TCFD' | 'ISSB' | 'SASB'> = ['GRI', 'TCFD', 'ISSB', 'SASB'];

    // 每个公司生成近3年的报告
    for (let yearOffset = 2; yearOffset >= 0; yearOffset--) {
      const year = currentYear - yearOffset;
      const standard = standards[Math.floor(Math.random() * standards.length)];
      const published = Math.random() > 0.3;

      // 获取该公司该年度的碳盘查数据
      const inventories = await storage.findCarbonInventories({
        companyId: company.id,
        period: `${year}-12`,
      });
      const latestInventory = inventories[0] || null;

      const employeeBase = Math.floor(Math.random() * 5000) + 1000;
      const renewableRate = Math.random() * 0.4 + 0.1; // 10%-50%

      const reportData: any = {
        companyId: company.id,
        year,
        standard,
        environmentalMetrics: {
          ghgScope1: latestInventory?.scope1Emissions || Math.random() * 3000 + 2000,
          ghgScope2: latestInventory?.scope2Emissions || Math.random() * 8000 + 5000,
          ghgScope3: latestInventory?.scope3Emissions || Math.random() * 5000 + 3000,
          waterConsumption: Math.random() * 50000 + 30000,
          wasteGeneration: Math.random() * 5000 + 2000,
          renewableEnergyRate: renewableRate,
        },
        socialMetrics: {
          totalEmployees: employeeBase,
          newHires: Math.floor(employeeBase * (Math.random() * 0.2 + 0.05)),
          turnover: Math.floor(employeeBase * (Math.random() * 0.15 + 0.03)),
          trainingHours: Math.floor(employeeBase * (Math.random() * 20 + 10)),
          accidents: Math.floor(Math.random() * 5),
        },
        governanceMetrics: {
          boardIndependence: Math.random() * 0.3 + 0.3, // 30%-60%
          antiCorruptionCases: Math.floor(Math.random() * 2),
          ethicsTraining: Math.floor(employeeBase * (Math.random() * 0.8 + 0.5)),
        },
        status: published ? 'published' : 'draft',
        publishedAt: published
          ? new Date(year, 11, Math.floor(Math.random() * 28) + 1).toISOString()
          : undefined,
      };

      // 如果已发布，自动上链存证
      if (published) {
        const blockchainData = mockBlockchainCertify(reportData);
        reportData.blockchainHash = blockchainData.transactionHash;
      }

      await storage.createESGReport(reportData);
    }
  }

  // 7. 生成供应商碳数据
  for (let i = 0; i < Math.min(15, companies.length); i++) {
    const supplier = companies[i];
    
    // 为每个供应商匹配几个买家
    const buyerCount = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < buyerCount && i + j + 1 < companies.length; j++) {
      const buyer = companies[i + j + 1];
      
      const carbonFootprint = Math.random() * 1000 + 500;
      const verified = Math.random() > 0.4;
      
      const score = Math.random() * 40 + 60; // 60-100
      let rating: 'A+' | 'A' | 'B' | 'C' | 'D';
      if (score >= 90) rating = 'A+';
      else if (score >= 80) rating = 'A';
      else if (score >= 70) rating = 'B';
      else if (score >= 60) rating = 'C';
      else rating = 'D';

      await storage.createSupplierCarbonData({
        supplierId: supplier.id,
        buyerId: buyer.id,
        carbonFootprint: Math.round(carbonFootprint * 10) / 10,
        unit: 'kgCO2e/件',
        period: generatePeriod(2024, currentMonth),
        verified,
        verificationReport: verified ? `核证报告-${supplier.name}-2024` : undefined,
        rating,
      });
    }
  }

  console.log('模拟数据生成完成！');
  console.log(`- 公司: ${companies.length}`);
  console.log(`- 用户: ${users.length}`);
  console.log(`- 碳盘查: ${(await storage.findCarbonInventories({})).length}`);
  console.log(`- 产品碳足迹: ${(await storage.findProductCarbonFootprints({})).length}`);
  console.log(`- 减排项目: ${(await storage.findReductionProjects({})).length}`);
  console.log(`- ESG报告: ${(await storage.findESGReports({})).length}`);
}

if (require.main === module) {
  generateSeedData().catch(console.error);
}

export { generateSeedData };

