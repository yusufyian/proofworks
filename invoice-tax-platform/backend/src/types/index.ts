// 用户类型
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'finance' | 'employee' | 'manager' | 'admin';
  department?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

// 企业类型
export interface Company {
  id: string;
  name: string;
  unifiedSocialCreditCode: string; // 统一社会信用代码
  taxNumber: string; // 税号
  address?: string;
  phone?: string;
  type: 'buyer' | 'seller' | 'both';
  createdAt: string;
  updatedAt: string;
}

// 发票类型
export interface Invoice {
  id: string;
  invoiceCode: string; // 发票代码 12位
  invoiceNo: string; // 发票号码 8位
  invoiceType: 'special' | 'normal' | 'electronic'; // 专票/普票/电票
  issueDate: string; // 开票日期
  seller: {
    name: string;
    taxNo: string;
    address?: string;
    phone?: string;
    bankAccount?: string;
  };
  buyer: {
    name: string;
    taxNo: string;
    address?: string;
    phone?: string;
    bankAccount?: string;
  };
  amount: number; // 不含税金额
  taxRate: number; // 税率 3%/6%/9%/13%
  taxAmount: number; // 税额
  totalAmount: number; // 价税合计
  items?: InvoiceItem[]; // 发票明细
  fingerprint: string; // SHA256(代码+号码+金额+日期)
  verifyStatus: 'pending' | 'verified' | 'invalid' | 'cancelled' | 'red_voided'; // 查验状态
  verifyTime?: string;
  verifyResult?: string;
  ocrResult?: any; // OCR识别结果
  imageUrl?: string; // 发票图片URL
  uploadedBy: string; // 上传人ID
  relatedOrderId?: string; // 关联订单ID
  relatedReceiptId?: string; // 关联入库单ID
  matchStatus?: 'matched' | 'partial' | 'unmatched'; // 三单匹配状态
  riskLevel?: 'low' | 'medium' | 'high'; // 风险等级
  riskReasons?: string[]; // 风险原因
  blockchainTxHash?: string; // 区块链交易哈希
  blockchainHeight?: number; // 区块链高度
  createdAt: string;
  updatedAt: string;
}

// 发票明细
export interface InvoiceItem {
  name: string; // 商品名称
  specification?: string; // 规格型号
  unit?: string; // 单位
  quantity: number; // 数量
  unitPrice: number; // 单价
  amount: number; // 金额
  taxRate: number; // 税率
  taxAmount: number; // 税额
}

// 采购订单
export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  supplierName: string;
  buyerId: string;
  buyerName: string;
  orderDate: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 采购订单明细
export interface PurchaseOrderItem {
  name: string;
  specification?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 入库单
export interface Receipt {
  id: string;
  receiptNo: string;
  orderId: string;
  orderNo: string;
  supplierId: string;
  supplierName: string;
  receiptDate: string;
  items: ReceiptItem[];
  totalAmount: number;
  status: 'pending' | 'verified' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// 入库单明细
export interface ReceiptItem {
  name: string;
  specification?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 三单匹配结果
export interface ThreeWayMatch {
  id: string;
  invoiceId: string;
  orderId: string;
  receiptId: string;
  matchStatus: 'matched' | 'partial' | 'unmatched';
  matchDetails: {
    supplierMatch: boolean;
    amountMatch: boolean;
    receiptAmountMatch?: boolean;
    itemMatch: boolean;
    dateMatch: boolean;
  };
  amountDifference?: number; // 金额差异
  differencePercent?: number; // 差异百分比
  matchTime: string;
  matchedBy?: string;
  notes?: string;
}

// 报销申请
export interface Reimbursement {
  id: string;
  reimbursementNo: string;
  applicantId: string;
  applicantName: string;
  department: string;
  expenseType: 'travel' | 'meals' | 'office' | 'entertainment' | 'other';
  description: string;
  invoices: string[]; // 发票ID列表
  totalAmount: number;
  budgetCheckStatus: 'pending' | 'passed' | 'failed';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalFlow: ApprovalNode[];
  currentApprover?: string;
  rejectReason?: string;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paymentTime?: string;
  createdAt: string;
  updatedAt: string;
}

// 审批节点
export interface ApprovalNode {
  level: number;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  approveTime?: string;
  comment?: string;
}

// 销售开票
export interface SalesInvoice {
  id: string;
  invoiceCode: string;
  invoiceNo: string;
  invoiceType: 'special' | 'normal' | 'electronic';
  issueDate: string;
  customerId: string;
  customerName: string;
  customerTaxNo: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: 'issued' | 'cancelled' | 'red_voided';
  issuedBy: string;
  blockchainTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

// 风控规则
export interface RiskRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'duplicate' | 'amount_pattern' | 'supplier_blacklist' | 'serial_number' | 'date_pattern';
  conditions: any;
  riskLevel: 'low' | 'medium' | 'high';
  action: 'auto_pass' | 'manual_review' | 'auto_reject';
  enabled: boolean;
}

// 审计日志
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

