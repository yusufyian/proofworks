// 用户角色
export type UserRole = 'data_provider' | 'data_consumer' | 'admin' | 'auditor';

// 用户
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  organization: string;
  role: UserRole;
  createdAt: string;
}

// 数据分类级别
export type DataClassificationLevel = 1 | 2 | 3 | 4 | 5;

// 数据资产
export interface DataAsset {
  id: string;
  name: string;
  description: string;
  organization: string;
  category: string; // 数据类别：用户行为、交易数据、征信数据等
  classification: DataClassificationLevel; // 分类级别
  fields: DataField[];
  recordCount: number;
  createdAt: string;
  updatedAt: string;
  owner: string; // 用户ID
}

// 数据字段
export interface DataField {
  name: string;
  type: string;
  classification: DataClassificationLevel;
  description: string;
  isPersonalInfo: boolean;
  isSensitive: boolean;
}

// 授权状态
export type AuthorizationStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';

// 授权记录
export interface Authorization {
  id: string;
  grantor: string; // 授权方用户ID
  grantee: string; // 被授权方用户ID
  dataAssetId: string;
  purpose: string; // 使用目的
  fields: string[]; // 授权字段列表
  dataScope: string; // 数据范围
  validFrom: string;
  validTo: string;
  usageLimit?: number; // 使用次数限制
  resultType: 'aggregated_only' | 'detailed'; // 结果类型
  status: AuthorizationStatus;
  createdAt: string;
  approvedAt?: string;
  blockchainHash?: string; // 区块链存证哈希
}

// 隐私计算类型
export type ComputingMethod = 'MPC' | 'TEE' | 'FederatedLearning' | 'DifferentialPrivacy' | 'PSI';

// 计算任务状态
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// 隐私计算任务
export interface ComputingTask {
  id: string;
  name: string;
  description: string;
  method: ComputingMethod;
  initiator: string; // 发起方用户ID
  participants: string[]; // 参与方用户ID列表
  authorizationIds: string[]; // 使用的授权ID列表
  inputHash: string; // 输入数据哈希
  outputHash?: string; // 输出结果哈希
  status: TaskStatus;
  result?: any; // 计算结果
  blockchainHash?: string; // 区块链存证哈希
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// 审计记录
export interface AuditRecord {
  id: string;
  userId: string;
  action: string; // 操作类型
  resourceType: string; // 资源类型
  resourceId: string; // 资源ID
  details: any; // 详细信息
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// 区块链存证记录
export interface BlockchainRecord {
  id: string;
  recordType: 'authorization' | 'computing' | 'audit';
  recordId: string; // 关联的记录ID
  hash: string; // 存证哈希
  blockHeight?: number;
  transactionHash?: string;
  timestamp: string;
}

// 统计数据
export interface DashboardStats {
  totalDataAssets: number;
  totalAuthorizations: number;
  activeAuthorizations: number;
  totalComputingTasks: number;
  completedTasks: number;
  totalBlockchainRecords: number;
  complianceRate: number; // 合规率
  recentActivities: AuditRecord[];
}

