export interface BusinessRecord {
  id: string;
  recordId: string;
  source: 'POS' | 'ECOM' | 'O2O' | 'MEMBER' | 'PROCUREMENT';
  storeId: string;
  storeName: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: 'WECHAT' | 'ALIPAY' | 'BANK_CARD' | 'E_CNY' | 'CASH';
  businessTime: string;
  operator: string;
  operatorName: string;
  customerId?: string;
  customerName?: string;
  items?: any[];
  rawData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  recordId: string;
  channel: 'WECHAT' | 'ALIPAY' | 'BANK_CARD' | 'E_CNY';
  merchantOrderNo: string;
  channelOrderNo: string;
  payAmount: number;
  fee: number;
  payTime: string;
  payStatus: 'SUCCESS' | 'PENDING' | 'FAILED';
  rawData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationRecord {
  id: string;
  recordId: string;
  reconDate: string;
  businessRecordId: string;
  paymentRecordId?: string;
  matchStatus: 'MATCHED' | 'UNMATCHED' | 'PENDING';
  matchRule?: string;
  matchTime?: string;
  amountDiff?: number;
  timeDiff?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscrepancyTicket {
  id: string;
  ticketId: string;
  type: 'LONG_AMOUNT' | 'SHORT_AMOUNT' | 'AMOUNT_DIFF' | 'TIME_DIFF' | 'NOT_FOUND';
  businessRecordId?: string;
  paymentRecordId?: string;
  amount: number;
  diffAmount?: number;
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'CLOSED';
  handler?: string;
  handlerName?: string;
  description?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementRecord {
  id: string;
  settlementId: string;
  orderId: string;
  totalAmount: number;
  splits: SettlementSplit[];
  settlementTime: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  blockchainTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementSplit {
  account: string;
  accountName: string;
  type: 'PERCENTAGE' | 'FIXED' | 'REMAINDER';
  value?: number;
  amount: number;
  description: string;
}

export interface ReconciliationRule {
  id: string;
  channel: string;
  matchFields: string[];
  timeTolerance: number;
  amountTolerance: number;
  feeRate: number;
  reconCycle: 'T+0' | 'T+1' | 'T+3';
  specialHandling?: string;
}

export interface ReconciliationSummary {
  reconDate: string;
  totalTransactions: number;
  matchedCount: number;
  unmatchedCount: number;
  totalAmount: number;
  matchedAmount: number;
  unmatchedAmount: number;
  matchRate: number;
  channelStats: {
    channel: string;
    total: number;
    matched: number;
    unmatched: number;
    matchRate: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'FINANCE' | 'OPERATOR';
  createdAt: string;
  updatedAt: string;
}

