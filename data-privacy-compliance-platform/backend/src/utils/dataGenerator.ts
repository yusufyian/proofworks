import { User, DataAsset, DataField, Authorization, ComputingTask, AuditRecord, BlockchainRecord, AuthorizationStatus, TaskStatus, ComputingMethod } from '../types';

const chineseNames = [
  // 常见的中文姓名，避免使用任何著名人物
  '张伟', '王芳', '李娜', '刘强', '陈静', '杨洋', '赵敏', '黄磊', '周杰', '吴秀',
  '徐静', '孙丽', '马伊', '朱军', '胡歌', '林玲', '郭德', '何明', '谢明', '汪强',
  '马建国', '王建华', '李志强', '刘明', '雷刚', '丁强', '张朝', '王兴', '程维', '周强',
  '郑成功', '钱学', '邓建', '袁强', '钟南', '李兰', '张文', '王辰', '陈薇', '张伯',
  '李建国', '王建军', '张建华', '刘志强', '陈明', '杨强', '赵刚', '黄建', '周明', '吴强',
  '徐建', '孙明', '马强', '朱刚', '胡建', '林明', '郭强', '何建', '谢建', '汪明',
  '张明', '王强', '李刚', '刘建', '陈强', '杨明', '赵建', '黄强', '周建', '吴明',
  '李强', '王明', '张强', '刘明', '陈建', '杨强', '赵明', '黄建', '周强', '吴建',
  '王建国', '李建军', '张明华', '刘志明', '陈建华', '杨志强', '赵明强', '黄志明', '周建军', '吴建明',
  '徐建国', '孙建军', '马志强', '朱建明', '胡志强', '林建明', '郭志强', '何建明', '谢志强', '汪建明',
  '王明强', '李志明', '张建军', '刘建强', '陈志明', '杨建强', '赵志明', '黄建强', '周志明', '吴建强',
  '王强', '李明', '张强', '刘明', '陈强', '杨明', '赵强', '黄明', '周强', '吴明',
  '王伟', '李芳', '张娜', '刘静', '陈强', '杨明', '赵丽', '黄强', '周芳', '吴静',
  '王娜', '李静', '张芳', '刘丽', '陈娜', '杨静', '赵芳', '黄静', '周娜', '吴芳',
  '王丽', '李丽', '张丽', '刘芳', '陈丽', '杨丽', '赵静', '黄丽', '周丽', '吴丽'
];

const chineseCompanies = [
  '中国工商银行', '中国建设银行', '中国农业银行', '中国银行', '交通银行',
  '招商银行', '浦发银行', '民生银行', '兴业银行', '平安银行',
  '华联科技集团', '数字云控股', '智慧科技公司', '创新电商集团', '快达科技',
  '云端数据科技', '智能出行科技', '星辰科技', '创新技术公司', '华讯通讯',
  '北京第一人民医院', '上海交通大学附属医院', '复旦大学附属医院',
  '北京大学附属医院', '中山大学附属医院', '四川大学附属医院',
  '国家电力公司', '中国通信集团', '中国网络通信', '中国电信集团', '中石化集团',
  '中华保险集团', '人民人寿保险', '大华保险', '新光保险', '泰安保险',
  '华东科技公司', '华南数据科技', '北方信息科技', '西部云计算', '东部智能科技',
  '新创科技公司', '未来科技集团', '智能数据科技', '创新金融科技', '数字科技公司'
];

// 简单的随机数生成器
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[random(0, arr.length - 1)];
const randomDate = (daysAgo: number = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - random(0, daysAgo));
  return date;
};
const randomPastDate = () => randomDate(365);
const randomRecentDate = () => randomDate(7);
const randomEmail = (name: string) => {
  const domains = ['example.com', 'test.com', 'demo.com', 'sample.org'];
  return `${name.toLowerCase().replace(/\s/g, '')}${random(100, 999)}@${randomItem(domains)}`;
};
const randomIP = () => `${random(1, 255)}.${random(1, 255)}.${random(1, 255)}.${random(1, 255)}`;
const randomUserAgent = () => {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];
  return randomItem(agents);
};
const randomHash = () => `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

const dataCategories = [
  '用户行为数据', '交易数据', '征信数据', '医疗健康数据', '教育数据',
  '金融账户数据', '位置数据', '设备信息', '公共数据', '业务数据'
];

const purposes = [
  '联合风控', '联合营销', '联合建模', '信用评估', '反欺诈',
  '精准投放', '用户画像', '市场分析', '科研研究', '数据统计分析'
];

// 生成随机中文名称
export const randomChineseName = () => randomItem(chineseNames);

// 生成随机公司名称
export const randomCompany = () => randomItem(chineseCompanies);

// 生成随机字段
const generateFields = (category: string): DataField[] => {
  const fields: DataField[] = [];
  
  if (category.includes('用户行为')) {
    fields.push(
      { name: 'user_id', type: 'string', classification: 2, description: '用户ID', isPersonalInfo: true, isSensitive: false },
      { name: 'age_range', type: 'string', classification: 2, description: '年龄段', isPersonalInfo: true, isSensitive: false },
      { name: 'browse_count', type: 'number', classification: 1, description: '浏览次数', isPersonalInfo: false, isSensitive: false },
      { name: 'purchase_amount', type: 'number', classification: 2, description: '购买金额', isPersonalInfo: true, isSensitive: true }
    );
  } else if (category.includes('交易')) {
    fields.push(
      { name: 'transaction_id', type: 'string', classification: 1, description: '交易ID', isPersonalInfo: false, isSensitive: false },
      { name: 'user_id', type: 'string', classification: 2, description: '用户ID', isPersonalInfo: true, isSensitive: false },
      { name: 'amount', type: 'number', classification: 2, description: '交易金额', isPersonalInfo: true, isSensitive: true },
      { name: 'merchant', type: 'string', classification: 1, description: '商户名称', isPersonalInfo: false, isSensitive: false }
    );
  } else if (category.includes('征信')) {
    fields.push(
      { name: 'user_id', type: 'string', classification: 2, description: '用户ID', isPersonalInfo: true, isSensitive: false },
      { name: 'credit_score', type: 'number', classification: 3, description: '征信分数', isPersonalInfo: true, isSensitive: true },
      { name: 'overdue_count', type: 'number', classification: 3, description: '逾期次数', isPersonalInfo: true, isSensitive: true },
      { name: 'loan_amount', type: 'number', classification: 3, description: '贷款总额', isPersonalInfo: true, isSensitive: true }
    );
  } else if (category.includes('医疗')) {
    fields.push(
      { name: 'patient_id', type: 'string', classification: 2, description: '患者ID', isPersonalInfo: true, isSensitive: false },
      { name: 'diagnosis', type: 'string', classification: 3, description: '诊断结果', isPersonalInfo: true, isSensitive: true },
      { name: 'test_result', type: 'string', classification: 3, description: '检测结果', isPersonalInfo: true, isSensitive: true },
      { name: 'medication', type: 'string', classification: 3, description: '用药信息', isPersonalInfo: true, isSensitive: true }
    );
  } else {
    // 通用字段
    fields.push(
      { name: 'id', type: 'string', classification: 1, description: '记录ID', isPersonalInfo: false, isSensitive: false },
      { name: 'name', type: 'string', classification: 2, description: '名称', isPersonalInfo: true, isSensitive: false },
      { name: 'value', type: 'number', classification: 1, description: '数值', isPersonalInfo: false, isSensitive: false }
    );
  }
  
  return fields;
};

// 生成用户
export const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  const roles: Array<'data_provider' | 'data_consumer' | 'admin'> = ['data_provider', 'data_consumer', 'admin'];
  
  // 创建默认管理员
  users.push({
    id: 'admin-001',
    email: 'admin@example.com',
    password: '$2a$10$rOzJqXJf5Zz5Zz5Zz5Zz5OqXJf5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz', // password123
    name: '系统管理员',
    organization: '数据要素合规流通平台',
    role: 'admin',
    createdAt: new Date().toISOString(),
  });
  
  // 创建默认数据提供方
  users.push({
    id: 'provider-001',
    email: 'provider@example.com',
    password: '$2a$10$rOzJqXJf5Zz5Zz5Zz5Zz5OqXJf5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz', // password123
    name: randomChineseName(),
    organization: randomCompany(),
    role: 'data_provider',
    createdAt: new Date().toISOString(),
  });
  
  // 创建默认数据需求方
  users.push({
    id: 'consumer-001',
    email: 'consumer@example.com',
    password: '$2a$10$rOzJqXJf5Zz5Zz5Zz5Zz5OqXJf5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz', // password123
    name: randomChineseName(),
    organization: randomCompany(),
    role: 'data_consumer',
    createdAt: new Date().toISOString(),
  });
  
  for (let i = 0; i < count - 3; i++) {
    const role = randomItem(roles);
    const name = randomChineseName();
    users.push({
      id: `${role}-${String(i + 2).padStart(3, '0')}`,
      email: randomEmail(name),
      password: '$2a$10$rOzJqXJf5Zz5Zz5Zz5Zz5OqXJf5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz',
      name,
      organization: randomCompany(),
      role,
      createdAt: randomPastDate().toISOString(),
    });
  }
  
  return users;
};

// 生成数据资产
export const generateDataAssets = (users: User[], count: number): DataAsset[] => {
  const assets: DataAsset[] = [];
  const providers = users.filter(u => u.role === 'data_provider');
  
  for (let i = 0; i < count; i++) {
    const category = randomItem(dataCategories);
    const fields = generateFields(category);
    const maxClassification = Math.max(...fields.map(f => f.classification));
    const owner = randomItem(providers);
    
    assets.push({
      id: `asset-${String(i + 1).padStart(6, '0')}`,
      name: `${category}-${owner.organization}-${i + 1}`,
      description: `${owner.organization}的${category}资产，包含${fields.length}个字段，共${random(100000, 1000000)}条记录`,
      organization: owner.organization,
      category,
      classification: maxClassification as DataAsset['classification'],
      fields,
      recordCount: random(100000, 1000000),
      createdAt: randomPastDate().toISOString(),
      updatedAt: randomRecentDate().toISOString(),
      owner: owner.id,
    });
  }
  
  return assets;
};

// 生成授权记录
export const generateAuthorizations = (
  users: User[],
  assets: DataAsset[],
  count: number
): Authorization[] => {
  const authorizations: Authorization[] = [];
  const providers = users.filter(u => u.role === 'data_provider');
  const consumers = users.filter(u => u.role === 'data_consumer');
  
  const statuses: AuthorizationStatus[] = ['pending', 'approved', 'rejected', 'expired'];
  
  for (let i = 0; i < count; i++) {
    const grantor = randomItem(providers);
    const grantee = randomItem(consumers);
    const asset = randomItem(assets);
    const status = randomItem(statuses);
    const purpose = randomItem(purposes);
    
    const validFrom = randomPastDate();
    const validTo = new Date(validFrom.getTime() + random(1, 90) * 24 * 60 * 60 * 1000);
    
    const auth: Authorization = {
      id: `auth-${String(i + 1).padStart(6, '0')}`,
      grantor: grantor.id,
      grantee: grantee.id,
      dataAssetId: asset.id,
      purpose,
      fields: asset.fields.slice(0, random(1, asset.fields.length)).map(f => f.name),
      dataScope: `用户ID范围: ${random(100000, 200000)}-${random(200000, 300000)}`,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      usageLimit: random(10000, 100000),
      resultType: Math.random() > 0.5 ? 'aggregated_only' : 'detailed',
      status,
      createdAt: validFrom.toISOString(),
      approvedAt: status === 'approved' ? new Date(validFrom.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
      blockchainHash: status === 'approved' ? randomHash() : undefined,
    };
    
    authorizations.push(auth);
  }
  
  return authorizations;
};

// 生成计算任务
export const generateComputingTasks = (
  users: User[],
  authorizations: Authorization[],
  count: number
): ComputingTask[] => {
  const tasks: ComputingTask[] = [];
  const methods: ComputingMethod[] = ['MPC', 'TEE', 'FederatedLearning', 'DifferentialPrivacy', 'PSI'];
  const statuses: TaskStatus[] = ['pending', 'running', 'completed', 'failed'];
  
  const approvedAuths = authorizations.filter(a => a.status === 'approved');
  
  for (let i = 0; i < count; i++) {
    const method = randomItem(methods);
    const status = randomItem(statuses);
    const initiator = randomItem(users);
    const auth = randomItem(approvedAuths);
    
    const createdAt = randomPastDate();
    const startedAt = status !== 'pending' ? new Date(createdAt.getTime() + 5 * 60 * 1000).toISOString() : undefined;
    const completedAt = status === 'completed' ? new Date(createdAt.getTime() + 30 * 60 * 1000).toISOString() : undefined;
    
    tasks.push({
      id: `task-${String(i + 1).padStart(6, '0')}`,
      name: `${method}计算任务-${i + 1}`,
      description: `使用${method}方法进行${auth.purpose}计算`,
      method,
      initiator: initiator.id,
      participants: [auth.grantor, auth.grantee],
      authorizationIds: [auth.id],
      inputHash: randomHash(),
      outputHash: status === 'completed' ? randomHash() : undefined,
      status,
      result: status === 'completed' ? { score: random(0, 100), count: random(0, 10000) } : undefined,
      blockchainHash: status === 'completed' ? randomHash() : undefined,
      createdAt: createdAt.toISOString(),
      startedAt,
      completedAt,
      error: status === 'failed' ? '计算超时' : undefined,
    });
  }
  
  return tasks;
};

// 生成审计记录
export const generateAuditRecords = (
  users: User[],
  authorizations: Authorization[],
  tasks: ComputingTask[],
  count: number
): AuditRecord[] => {
  const records: AuditRecord[] = [];
  const actions = ['create_authorization', 'approve_authorization', 'create_task', 'complete_task', 'view_data', 'export_data'];
  const resourceTypes = ['authorization', 'computing_task', 'data_asset'];
  
  for (let i = 0; i < count; i++) {
    const user = randomItem(users);
    const action = randomItem(actions);
    const resourceType = randomItem(resourceTypes);
    
    let resourceId = '';
    if (resourceType === 'authorization') {
      resourceId = authorizations.length > 0 ? randomItem(authorizations).id : 'unknown';
    } else if (resourceType === 'computing_task') {
      resourceId = tasks.length > 0 ? randomItem(tasks).id : 'unknown';
    } else {
      resourceId = `asset-${random(1, 1000)}`;
    }
    
    records.push({
      id: `audit-${String(i + 1).padStart(8, '0')}`,
      userId: user.id,
      action,
      resourceType,
      resourceId,
      details: { description: `${user.name}执行了${action}操作` },
      ipAddress: randomIP(),
      userAgent: randomUserAgent(),
      timestamp: randomRecentDate().toISOString(),
    });
  }
  
  return records;
};

// 生成区块链记录
export const generateBlockchainRecords = (
  authorizations: Authorization[],
  tasks: ComputingTask[],
  count: number
): BlockchainRecord[] => {
  const records: BlockchainRecord[] = [];
  
  // 从授权记录生成
  authorizations.filter(a => a.blockchainHash).forEach((auth, i) => {
    records.push({
      id: `blockchain-${String(i + 1).padStart(8, '0')}`,
      recordType: 'authorization',
      recordId: auth.id,
      hash: auth.blockchainHash!,
      blockHeight: random(1000000, 2000000),
      transactionHash: randomHash(),
      timestamp: auth.approvedAt || auth.createdAt,
    });
  });
  
  // 从计算任务生成
  tasks.filter(t => t.blockchainHash).forEach((task, i) => {
    records.push({
      id: `blockchain-${String(authorizations.length + i + 1).padStart(8, '0')}`,
      recordType: 'computing',
      recordId: task.id,
      hash: task.blockchainHash!,
      blockHeight: random(1000000, 2000000),
      transactionHash: randomHash(),
      timestamp: task.completedAt || task.createdAt,
    });
  });
  
  return records.slice(0, count);
};

