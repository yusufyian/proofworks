export interface User {
  id: string;
  username: string;
  password: string; // 加密后的密码
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'operator';
  department: string;
  phone?: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  equipmentNo: string; // 设备编号
  name: string; // 设备名称
  model: string; // 规格型号
  serialNumber: string; // 序列号
  category: string; // 设备类别
  supplier: string; // 供应商
  purchaseDate: string; // 采购日期
  purchasePrice: number; // 原值
  status: 'normal' | 'maintenance' | 'repair' | 'scrapped'; // 设备状态
  location: {
    workshop: string; // 所属车间
    position: string; // 安装位置
  };
  responsibility: {
    department: string; // 责任部门
    person: string; // 责任人
  };
  technicalParams?: {
    power?: number; // 功率 kW
    weight?: number; // 重量 kg
    [key: string]: any;
  };
  healthScore?: number; // 健康度分数 0-100
  runtimeHours?: number; // 运行时长
  workCycles?: number; // 工作循环次数
  lastMaintenanceDate?: string; // 上次维保日期
  qrCode?: string; // 二维码内容
  blockchainHash?: string; // 区块链存证哈希
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePlan {
  id: string;
  equipmentId: string;
  equipmentNo: string;
  equipmentName: string;
  planType: 'preventive' | 'corrective'; // 预防性/纠正性
  maintenanceType: 'calendar' | 'runtime' | 'cycle'; // 基于日历/运行时长/工作循环
  cycleDays?: number; // 周期天数
  cycleHours?: number; // 周期小时数
  cycleCount?: number; // 周期次数
  lastMaintenanceDate?: string;
  nextMaintenanceDate: string;
  tasks: MaintenanceTask[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string; // 执行人ID
  createdAt: string;
}

export interface MaintenanceTask {
  id: string;
  name: string; // 任务名称
  description: string; // 标准作业程序
  estimatedHours: number; // 预计工时
  required?: boolean; // 是否必做
}

export interface WorkOrder {
  id: string;
  orderNo: string; // 工单编号
  equipmentId: string;
  equipmentNo: string;
  equipmentName: string;
  type: 'repair' | 'maintenance' | 'inspection'; // 维修/保养/巡检
  priority: 'urgent' | 'important' | 'normal' | 'low'; // 紧急/重要/一般/低优先级
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  reportedBy: string; // 报修人
  reportedAt: string;
  assignedTo?: string; // 维修工ID
  assignedAt?: string;
  faultDescription?: string; // 故障描述
  faultPhenomenon?: string; // 故障现象
  diagnosticResult?: string; // 诊断结果
  repairActions?: string; // 维修措施
  spareParts?: Array<{
    partId: string;
    partName: string;
    quantity: number;
  }>;
  startTime?: string;
  endTime?: string;
  downtimeHours?: number; // 停机时长
  cost?: number; // 维修成本
  acceptance?: {
    acceptedBy: string;
    acceptedAt: string;
    comment?: string;
  };
  blockchainHash?: string; // 区块链存证哈希
  createdAt: string;
  updatedAt: string;
}

export interface SparePart {
  id: string;
  partNo: string; // 备件编号
  name: string; // 备件名称
  model: string; // 型号规格
  category: string; // 分类
  unit: string; // 单位
  currentStock: number; // 当前库存
  minStock: number; // 最低库存
  safeStock: number; // 安全库存
  maxStock: number; // 最高库存
  unitPrice: number; // 单价
  supplier: string; // 供应商
  applicableEquipment?: string[]; // 适用设备型号
  abcClass: 'A' | 'B' | 'C'; // ABC分类
  location?: string; // 存放位置
  createdAt: string;
  updatedAt: string;
}

export interface HealthAssessment {
  id: string;
  equipmentId: string;
  equipmentNo: string;
  assessmentDate: string;
  healthScore: number; // 0-100
  indicators: {
    vibration?: {
      value: number;
      normal: boolean;
      score: number;
    };
    temperature?: {
      value: number;
      normal: boolean;
      score: number;
    };
    current?: {
      value: number;
      normal: boolean;
      score: number;
    };
    noise?: {
      value: number;
      normal: boolean;
      score: number;
    };
    performance?: {
      value: number;
      normal: boolean;
      score: number;
    };
  };
  level: 'excellent' | 'good' | 'fair' | 'poor'; // 优秀/良好/一般/差
  recommendation?: string; // 检修建议
  createdAt: string;
}

export interface KnowledgeBase {
  id: string;
  equipmentType: string; // 设备类型
  faultCode?: string; // 故障代码
  symptom: string; // 故障现象
  possibleCauses: string[]; // 可能原因
  diagnosticSteps: string[]; // 诊断步骤
  solutions: Array<{
    cause: string;
    solution: string;
    spareParts: string[]; // 所需备件
    estimatedTime: string;
    skillRequired: string; // 所需技能
  }>;
  relatedCases?: string[]; // 相关案例ID
  videos?: string[]; // 视频URL
  documents?: string[]; // 文档URL
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainRecord {
  id: string;
  txHash: string; // 交易哈希
  recordType: 'equipment' | 'maintenance' | 'repair' | 'health';
  recordId: string; // 关联记录ID
  dataHash: string; // 数据哈希
  timestamp: string;
  blockNumber?: number;
  createdAt: string;
}
