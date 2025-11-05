// 产品类别
export type ProductCategory = '水果' | '蔬菜' | '肉类' | '水产' | '乳制品' | '粮油' | '其他';

// 产品状态
export type ProductStatus = '生产中' | '合格' | '不合格' | '已召回' | '已售罄';

// 流转事件类型
export type EventType = 
  | '播种' | '施肥' | '收获' | '加工' | '包装'
  | '农残检测' | '营养成分' | '微生物检测'
  | '入库' | '出库' | '装车' | '运输' | '到货' | '上架'
  | '温度异常' | '质检不合格' | '货损' | '召回';

// 运输方式
export type TransportType = '冷链车' | '常温车' | '空运' | '铁路';

// 产品档案
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  specification: string;
  manufacturer: {
    name: string;
    creditCode: string;
    license: string;
    address: string;
  };
  origin: {
    province: string;
    city: string;
    district: string;
    gps: [number, number];
    certifications: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// 批次档案
export interface Batch {
  id: string;
  batchNumber: string;
  traceCodePrefix: string;
  productId: string;
  productionDate: string;
  expiryDays: number;
  quantity: number;
  unit: string;
  ingredients: Array<{
    name: string;
    batchNumber: string;
    amount: number;
  }>;
  qualityReports: Array<{
    testItem: string;
    result: string;
    agency: string;
    reportNumber: string;
    reportHash: string;
    testDate: string;
  }>;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// 流转事件
export interface TransferEvent {
  id: string;
  traceCode: string;
  batchId: string;
  eventType: EventType;
  timestamp: string;
  operator: {
    name: string;
    company: string;
    role: string;
  };
  location: {
    name: string;
    gps: [number, number];
  };
  content: Record<string, any>;
  attachments: string[];
  signature: string;
  blockHeight?: number;
  txHash?: string;
}

// IoT传感器数据
export interface IoTData {
  id: string;
  traceCode: string;
  batchId: string;
  sensorType: 'temperature' | 'humidity' | 'gps' | 'light' | 'soil';
  value: number | [number, number];
  timestamp: string;
  deviceId: string;
  location?: {
    name: string;
    gps: [number, number];
  };
}

// 召回记录
export interface Recall {
  id: string;
  batchId: string;
  batchNumber: string;
  reason: string;
  riskLevel: '低' | '中' | '高' | '紧急';
  initiatedBy: string;
  initiatedAt: string;
  status: '进行中' | '已完成' | '已取消';
  recallProgress: {
    totalQuantity: number;
    recalledQuantity: number;
    locations: Array<{
      name: string;
      quantity: number;
      status: string;
    }>;
  };
  completedAt?: string;
}

// 追溯查询结果
export interface TraceResult {
  product: Product;
  batch: Batch;
  events: TransferEvent[];
  iotData: IoTData[];
  recall?: Recall;
}

