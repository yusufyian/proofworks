import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import fileStorage from '../storage/fileStorage';
import { generateTxHash, calculateFileHash, generateBlockHeight, generateEvidenceHash, generateCertificateId } from './blockchain';
import { User, Asset, InfringementCase, RightsProtection, License, Device } from '../types';

// 中文姓名库
const FIRST_NAMES = ['明', '强', '磊', '军', '洋', '勇', '艳', '杰', '华', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳'];
const LAST_NAMES = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];

// 机构名称库
const ORGANIZATIONS = [
  '创新设计工作室', '智能科技研发中心', '视觉创意传媒', '工业设计研究院', '数字艺术创作社',
  '云智软件开发公司', '前沿技术咨询', '创意素材库', '建筑设计事务所', '产品设计公司',
  '华泰律师事务所', '正义法律咨询', '维权法律服务中心', '知识产权律师事务所', '商事法律事务所',
  '北京知识产权法院', '上海中级人民法院', '深圳知识产权法庭', '杭州互联网法院', '成都高新区法院'
];

// 资产类型和文件名
const ASSET_TYPES = [
  { type: '设计图纸', formats: ['DWG', 'SKP', '3DMAX'], prefix: '产品设计', suffix: ['v1', 'v2', 'v3', 'final', 'revised'] },
  { type: '创意素材', formats: ['PSD', 'AI', 'JPG', 'PNG'], prefix: '创意设计', suffix: ['设计', '海报', '插画', 'logo', '品牌'] },
  { type: '技术文档', formats: ['PDF', 'DOCX'], prefix: '技术文档', suffix: ['说明书', '规范', '方案', '报告', '专利申请书'] },
  { type: '视频作品', formats: ['MP4', 'MOV'], prefix: '视频', suffix: ['宣传片', '教程', '广告', '演示', '纪录片'] },
  { type: '源代码', formats: ['ZIP', 'GIT'], prefix: '代码库', suffix: ['前端', '后端', '算法', 'SDK', 'API'] },
];

// 平台名称
const PLATFORMS = ['淘宝', '京东', '拼多多', '抖音', '小红书', '微信公众号', 'B站', '站酷', '花瓣网', 'Dribbble'];

// 设备名称
const DEVICE_TYPES = [
  { type: '生产设备', names: ['数控加工中心', '注塑机', '冲压机', '焊接机器人', '装配线'], manufacturers: ['某某机床有限公司', '自动化设备制造', '智能机械科技'] },
  { type: '检测设备', names: ['光谱分析仪', '硬度测试机', '尺寸检测仪', '质量检测系统'], manufacturers: ['精密仪器科技', '检测设备公司', '测量技术公司'] },
  { type: '办公设备', names: ['服务器', '工作站', '打印机', '投影仪'], manufacturers: ['IT设备供应商', '办公设备公司', '科技产品公司'] },
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateChineseName(): string {
  return randomChoice(LAST_NAMES) + randomChoice(FIRST_NAMES);
}

function generateIdCard(): string {
  const prefix = ['110', '310', '440', '510', '330', '320'];
  return randomChoice(prefix) + randomInt(100000, 999999).toString() + randomInt(1000, 9999).toString();
}

function generateEmail(name: string, org?: string): string {
  const domains = ['@example.com', '@design.com', '@tech.com', '@creative.com'];
  const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + randomInt(100, 999);
  return username + randomChoice(domains);
}

function generatePhone(): string {
  const prefixes = ['138', '139', '150', '151', '152', '188', '189'];
  return randomChoice(prefixes) + randomInt(10000000, 99999999).toString();
}

function generateFileHash(): string {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}


export function generateMockData() {
  console.log('开始生成模拟数据...');

  // 1. 生成用户
  const users: User[] = [];
  
  // 生成创作者用户 (50个)
  for (let i = 0; i < 50; i++) {
    const name = generateChineseName();
    users.push({
      id: uuidv4(),
      username: `creator${i + 1}`,
      email: generateEmail(name),
      password: bcrypt.hashSync('123456', 10),
      name,
      role: 'creator',
      organization: randomChoice(ORGANIZATIONS).slice(0, 6) + '工作室',
      phone: generatePhone(),
      createdAt: dayjs().subtract(randomInt(0, 365), 'days').toISOString(),
    });
  }

  // 生成律师用户 (10个)
  for (let i = 0; i < 10; i++) {
    const name = generateChineseName();
    users.push({
      id: uuidv4(),
      username: `lawyer${i + 1}`,
      email: generateEmail(name, 'lawyer'),
      password: bcrypt.hashSync('123456', 10),
      name,
      role: 'lawyer',
      organization: randomChoice(ORGANIZATIONS.filter(org => org.includes('律师'))),
      phone: generatePhone(),
      createdAt: dayjs().subtract(randomInt(0, 365), 'days').toISOString(),
    });
  }

  // 生成管理员 (5个)
  for (let i = 0; i < 5; i++) {
    const name = generateChineseName();
    users.push({
      id: uuidv4(),
      username: `admin${i + 1}`,
      email: generateEmail(name, 'admin'),
      password: bcrypt.hashSync('admin123', 10),
      name,
      role: 'admin',
      organization: '知识产权管理平台',
      phone: generatePhone(),
      createdAt: dayjs().subtract(randomInt(30, 365), 'days').toISOString(),
    });
  }

  fileStorage.saveUsers(users);
  console.log(`生成 ${users.length} 个用户`);

  // 2. 生成资产
  const assets: Asset[] = [];
  const creatorUsers = users.filter(u => u.role === 'creator');
  
  for (let i = 0; i < 200; i++) {
    const assetTypeConfig = randomChoice(ASSET_TYPES);
    const format = randomChoice(assetTypeConfig.formats);
    const suffix = randomChoice(assetTypeConfig.suffix);
    const fileName = `${assetTypeConfig.prefix}${suffix}.${format.toLowerCase()}`;
    const author = randomChoice(creatorUsers);
    const createdAt = dayjs().subtract(randomInt(0, 180), 'days').toISOString();
    
      const certId = generateCertificateId();
      assets.push({
        id: uuidv4(),
        certificateId: certId,
        assetType: assetTypeConfig.type,
      fileName,
      fileHash: generateFileHash(),
      fileSize: randomInt(1024 * 1024, 50 * 1024 * 1024), // 1MB - 50MB
      author: {
        name: author.name,
        idCard: generateIdCard(),
        ca_cert: `CA-${randomInt(100000, 999999)}`,
      },
      timestamp: {
        tsa: '国家授时中心',
        time: createdAt,
        tsa_signature: generateFileHash(),
      },
      blockchain: {
        chain: 'Hyperledger Fabric',
        txHash: generateTxHash(),
        blockHeight: generateBlockHeight(),
        node: 'ip-registry-node1.example.com',
      },
      metadata: {
        description: `${assetTypeConfig.type}文件：${fileName}`,
        tags: [assetTypeConfig.type, format],
        license: randomChoice(['保留所有权利', 'CC BY', 'CC BY-NC', 'CC BY-SA']),
      },
      ownerId: author.id,
      status: randomChoice(['registered', 'licensed', 'transferred', 'expired']),
      createdAt,
    });
  }

  fileStorage.saveAssets(assets);
  console.log(`生成 ${assets.length} 个资产`);

  // 3. 生成侵权案例
  const infringements: InfringementCase[] = [];
  const registeredAssets = assets.filter(a => a.status === 'registered' || a.status === 'licensed');
  
  for (let i = 0; i < 80; i++) {
    const asset = randomChoice(registeredAssets);
    const platform = randomChoice(PLATFORMS);
    const similarity = randomInt(75, 99);
    const createdAt = dayjs().subtract(randomInt(0, 90), 'days').toISOString();
    
    infringements.push({
      id: uuidv4(),
      assetId: asset.id,
      asset,
      suspectUrl: `https://www.${platform.toLowerCase()}.com/product/${randomInt(100000, 999999)}`,
      suspectPlatform: platform,
      similarity,
      evidence: {
        screenshots: [`/evidence/screenshot_${i}_1.jpg`, `/evidence/screenshot_${i}_2.jpg`],
        sourceCode: `网页源代码哈希: ${generateFileHash()}`,
        productInfo: {
          seller: generateChineseName(),
          sales: randomInt(10, 10000),
          price: randomInt(50, 5000),
        },
      },
      blockchain: {
        evidenceHash: generateEvidenceHash({ assetId: asset.id, platform }),
        txHash: generateTxHash(),
        blockHeight: generateBlockHeight(),
      },
      status: randomChoice(['monitoring', 'pending', 'investigating', 'settled', 'litigation', 'closed']),
      createdAt,
      updatedAt: dayjs(createdAt).add(randomInt(1, 30), 'days').toISOString(),
    });
  }

  fileStorage.saveInfringements(infringements);
  console.log(`生成 ${infringements.length} 个侵权案例`);

  // 4. 生成维权记录
  const rightsProtections: RightsProtection[] = [];
  const pendingInfringements = infringements.filter(i => i.status === 'pending' || i.status === 'investigating');
  const lawyers = users.filter(u => u.role === 'lawyer');
  
  for (let i = 0; i < 40; i++) {
    const infringement = randomChoice(pendingInfringements);
    const applicant = infringement.asset.ownerId ? users.find(u => u.id === infringement.asset.ownerId) : creatorUsers[0];
    const lawyer = randomChoice(lawyers);
    const createdAt = dayjs(infringement.createdAt).add(randomInt(1, 7), 'days').toISOString();
    
    rightsProtections.push({
      id: uuidv4(),
      caseId: infringement.id,
      infringementCase: infringement,
      applicantId: applicant!.id,
      lawyerId: lawyer.id,
      evidence: {
        originalCertificate: infringement.asset.certificateId,
        infringementEvidence: `/evidence/infringement_${i}.pdf`,
        economicLoss: randomInt(10000, 500000),
      },
      notary: randomInt(0, 10) > 3 ? {
        certificateNumber: `NOTARY-${randomInt(100000, 999999)}`,
        issueDate: dayjs(createdAt).add(randomInt(3, 14), 'days').toISOString(),
        organization: '某某公证处',
      } : undefined,
      status: randomChoice(['submitted', 'lawyer_reviewing', 'notary_applied', 'letter_sent', 'negotiating', 'litigation', 'settled', 'closed']),
      lawyerLetter: randomInt(0, 10) > 5 ? `/documents/lawyer_letter_${i}.pdf` : undefined,
      settlement: randomInt(0, 10) > 7 ? {
        amount: randomInt(10000, 200000),
        agreement: `/documents/settlement_${i}.pdf`,
        txHash: generateTxHash(),
      } : undefined,
      createdAt,
      updatedAt: dayjs(createdAt).add(randomInt(1, 60), 'days').toISOString(),
    });
  }

  fileStorage.saveRightsProtections(rightsProtections);
  console.log(`生成 ${rightsProtections.length} 个维权记录`);

  // 5. 生成授权交易
  const licenses: License[] = [];
  const licensableAssets = assets.filter(a => a.status === 'registered');
  
  for (let i = 0; i < 60; i++) {
    const asset = randomChoice(licensableAssets);
    const licensor = users.find(u => u.id === asset.ownerId) || creatorUsers[0];
    const licensee = randomChoice(creatorUsers.filter(u => u.id !== licensor!.id));
    const licenseType = randomChoice(['non_exclusive', 'exclusive', 'sole', 'regional', 'temporal']);
    const duration = randomChoice([1, 3, 5, 10]); // 年
    const basePrice = randomInt(1000, 50000);
    const createdAt = dayjs().subtract(randomInt(0, 120), 'days').toISOString();
    
    licenses.push({
      id: uuidv4(),
      assetId: asset.id,
      asset,
      licensorId: licensor!.id,
      licenseeId: licensee.id,
      licenseType: licenseType as any,
      price: basePrice,
      duration,
      scope: randomChoice(['全球', '中国大陆', '港澳台', '海外']),
      nftTokenId: `NFT-${randomInt(100000, 999999)}`,
      status: randomChoice(['listed', 'active', 'expired', 'revoked']),
      blockchain: {
        txHash: generateTxHash(),
        blockHeight: generateBlockHeight(),
      },
      createdAt,
      expiresAt: dayjs(createdAt).add(duration, 'years').toISOString(),
    });
  }

  fileStorage.saveLicenses(licenses);
  console.log(`生成 ${licenses.length} 个授权交易`);

  // 6. 生成设备台账
  const devices: Device[] = [];
  
  for (let i = 0; i < 100; i++) {
    const deviceTypeConfig = randomChoice(DEVICE_TYPES);
    const deviceName = randomChoice(deviceTypeConfig.names);
    const manufacturer = randomChoice(deviceTypeConfig.manufacturers);
    const owner = randomChoice(users.filter(u => u.role === 'creator'));
    const serialNumber = `SN-${dayjs().format('YYYY')}-${String(randomInt(1, 9999)).padStart(4, '0')}`;
    const purchaseDate = dayjs().subtract(randomInt(0, 730), 'days').toISOString();
    
    devices.push({
      id: uuidv4(),
      tokenId: `DEVICE-${dayjs().format('YYYYMMDD')}-${String(randomInt(1, 9999)).padStart(4, '0')}`,
      assetType: deviceTypeConfig.type,
      name: `${deviceName} ${randomChoice(['CNC-X500', 'Pro-3000', 'Smart-200', 'AUTO-500'])}`,
      serialNumber,
      manufacturer,
      purchaseDate,
      originalValue: randomInt(50000, 1000000),
      location: randomChoice(['车间A-区域1', '车间A-区域2', '车间B-区域3', '仓库区', '实验室']),
      status: randomChoice(['normal', 'maintenance', 'transferred', 'scrapped']),
      owner: owner.id,
      metadata: {
        model: randomChoice(['X500', 'Pro-3000', 'Smart-200', 'AUTO-500']),
        weight: `${randomInt(500, 5000)}kg`,
        power: `${randomInt(5, 50)}kW`,
        warranty: `${randomChoice([1, 2, 3])}年`,
      },
      iot_deviceId: `IOT-${randomInt(10000, 99999)}`,
      images: [`/devices/image_${i}_1.jpg`, `/devices/image_${i}_2.jpg`],
      documents: [`/documents/purchase_contract_${i}.pdf`, `/documents/acceptance_report_${i}.pdf`],
      createdAt: purchaseDate,
      updatedAt: dayjs(purchaseDate).add(randomInt(0, 365), 'days').toISOString(),
    });
  }

  fileStorage.saveDevices(devices);
  console.log(`生成 ${devices.length} 个设备`);

  console.log('模拟数据生成完成！');
}

