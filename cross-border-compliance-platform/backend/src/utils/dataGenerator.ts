// 逼真的中文姓名生成
const surnames = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
  '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡',
  '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈',
];

const givenNamesFirst = [
  '伟', '芳', '娜', '秀', '英', '华', '强', '磊', '军', '洋',
  '勇', '艳', '杰', '娟', '涛', '明', '超', '兰', '霞', '平',
  '刚', '桂', '辉', '东', '鹏', '梅', '玲', '静', '丽', '建',
  '文', '斌', '武', '国', '民', '德', '胜', '发', '财', '富',
  '贵', '祥', '瑞', '龙', '虎', '鹰', '志', '智', '信', '仁',
];

const givenNamesSecond = [
  '伟', '芳', '娜', '秀', '英', '华', '强', '磊', '军', '洋',
  '勇', '艳', '杰', '娟', '涛', '明', '超', '兰', '霞', '平',
];

export function generateChineseName(): string {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const isDoubleName = Math.random() > 0.5;
  if (isDoubleName) {
    const first = givenNamesFirst[Math.floor(Math.random() * givenNamesFirst.length)];
    const second = givenNamesSecond[Math.floor(Math.random() * givenNamesSecond.length)];
    return `${surname}${first}${second}`;
  } else {
    const name = givenNamesFirst[Math.floor(Math.random() * givenNamesFirst.length)];
    return `${surname}${name}`;
  }
}

// 境内公司名
const domesticCompanyPrefixes = [
  '华夏', '中正', '东方', '南方', '北方', '西部', '华东', '华南', '华北', '西南',
  '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京',
  '卓越', '恒信', '华润', '国泰', '平安', '招商', '兴业', '建设', '工商', '农业',
];

const domesticCompanyTypes = [
  '科技', '贸易', '制造', '电子', '信息', '软件', '物流', '金融', '咨询', '服务',
  '实业', '投资', '发展', '控股', '集团', '股份', '有限', '国际', '全球', '联合',
];

export function generateDomesticCompanyName(): string {
  const prefix = domesticCompanyPrefixes[Math.floor(Math.random() * domesticCompanyPrefixes.length)];
  const type = domesticCompanyTypes[Math.floor(Math.random() * domesticCompanyTypes.length)];
  const suffix = Math.random() > 0.5 ? '有限公司' : '股份有限公司';
  return `${prefix}${type}${suffix}`;
}

// 境外公司名
const foreignCompanyPrefixes = [
  'Global', 'International', 'Universal', 'Pacific', 'Atlantic', 'Continental',
  'Worldwide', 'Overseas', 'Trans', 'Inter', 'Multi', 'Mega',
];

const foreignCompanyNames = [
  'Technology', 'Trade', 'Trading', 'Manufacturing', 'Holdings', 'Group',
  'Enterprises', 'Corporation', 'Limited', 'Partners', 'International', 'Global',
];

const hongKongSuffixes = ['(HK) Limited', 'Hong Kong Limited', '(Hong Kong) Ltd'];
const singaporeSuffixes = ['(Singapore) Pte Ltd', 'Singapore Limited', 'SG Pte Ltd'];
const usSuffixes = ['Inc.', 'LLC', 'Corp.', 'Ltd.'];

export function generateForeignCompanyName(region: 'hk' | 'sg' | 'us' | 'eu' = 'hk'): string {
  const prefix = foreignCompanyPrefixes[Math.floor(Math.random() * foreignCompanyPrefixes.length)];
  const name = foreignCompanyNames[Math.floor(Math.random() * foreignCompanyNames.length)];
  let suffix: string;
  
  switch (region) {
    case 'hk':
      suffix = hongKongSuffixes[Math.floor(Math.random() * hongKongSuffixes.length)];
      break;
    case 'sg':
      suffix = singaporeSuffixes[Math.floor(Math.random() * singaporeSuffixes.length)];
      break;
    case 'us':
      suffix = usSuffixes[Math.floor(Math.random() * usSuffixes.length)];
      break;
    default:
      suffix = 'Limited';
  }
  
  return `${prefix} ${name} ${suffix}`;
}

// 生成区块链交易哈希
export function generateBlockchainTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// 生成随机日期
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 生成随机金额（人民币，单位：元）
export function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机电话号码
export function generatePhoneNumber(region: 'domestic' | 'foreign' = 'domestic'): string {
  if (region === 'domestic') {
    const prefixes = ['138', '139', '150', '151', '152', '158', '159', '186', '187', '188'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}${suffix}`;
  } else {
    return `+852${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  }
}

// 生成邮箱
export function generateEmail(name: string, company: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domains = ['example.com', 'email.com', 'mail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${cleanName}@${cleanCompany}.${domain}`;
}

// 生成数据分类
export function generateDataClassification(): string {
  const classifications = ['个人信息', '重要数据', '一般数据', '商业秘密', '财务数据'];
  return classifications[Math.floor(Math.random() * classifications.length)];
}

// 生成数据脱敏规则
export function maskData(type: string, original: string): string {
  switch (type) {
    case 'phone':
      return original.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'idCard':
      return original.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    case 'name':
      if (original.length === 2) {
        return `${original[0]}*`;
      } else {
        return `${original[0]}**`;
      }
    case 'address':
      const parts = original.split(/[省市区县]/);
      return parts[0] + (parts[1] ? parts[1].substring(0, 1) : '') + '***';
    case 'email':
      const [local, domain] = original.split('@');
      return `${local.substring(0, 2)}**@${domain}`;
    default:
      return original;
  }
}

