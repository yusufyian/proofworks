import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  BusinessRecord,
  PaymentRecord,
  ReconciliationRecord,
  DiscrepancyTicket,
  SettlementRecord,
  ReconciliationRule,
  User,
} from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StorageData {
  users: User[];
  businessRecords: BusinessRecord[];
  paymentRecords: PaymentRecord[];
  reconciliationRecords: ReconciliationRecord[];
  discrepancyTickets: DiscrepancyTicket[];
  settlementRecords: SettlementRecord[];
  reconciliationRules: ReconciliationRule[];
}

class FileStorage {
  private dataFile: string;
  private data: StorageData;

  constructor() {
    this.dataFile = path.join(DATA_DIR, 'storage.json');
    this.data = this.loadData();
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(this.dataFile)) {
        const content = fs.readFileSync(this.dataFile, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
    return {
      users: [],
      businessRecords: [],
      paymentRecords: [],
      reconciliationRecords: [],
      discrepancyTickets: [],
      settlementRecords: [],
      reconciliationRules: [],
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  // Users
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  async findUser(query: { email?: string; id?: string }): Promise<User | null> {
    if (query.email) {
      return this.data.users.find(u => u.email === query.email) || null;
    }
    if (query.id) {
      return this.data.users.find(u => u.id === query.id) || null;
    }
    return null;
  }

  // Business Records
  async createBusinessRecord(record: Omit<BusinessRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessRecord> {
    const businessRecord: BusinessRecord = {
      id: uuidv4(),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.businessRecords.push(businessRecord);
    this.saveData();
    return businessRecord;
  }

  async findBusinessRecords(filter?: {
    source?: string;
    storeId?: string;
    orderId?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<BusinessRecord[]> {
    let result = [...this.data.businessRecords];
    if (filter) {
      if (filter.source) {
        result = result.filter(r => r.source === filter.source);
      }
      if (filter.storeId) {
        result = result.filter(r => r.storeId === filter.storeId);
      }
      if (filter.orderId) {
        result = result.filter(r => r.orderId === filter.orderId);
      }
      if (filter.paymentMethod) {
        result = result.filter(r => r.paymentMethod === filter.paymentMethod);
      }
      if (filter.startDate) {
        result = result.filter(r => r.businessTime >= filter.startDate!);
      }
      if (filter.endDate) {
        result = result.filter(r => r.businessTime <= filter.endDate!);
      }
    }
    return result.sort((a, b) => new Date(b.businessTime).getTime() - new Date(a.businessTime).getTime());
  }

  async findBusinessRecord(id: string): Promise<BusinessRecord | null> {
    return this.data.businessRecords.find(r => r.id === id) || null;
  }

  // Payment Records
  async createPaymentRecord(record: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    const paymentRecord: PaymentRecord = {
      id: uuidv4(),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.paymentRecords.push(paymentRecord);
    this.saveData();
    return paymentRecord;
  }

  async findPaymentRecords(filter?: {
    channel?: string;
    merchantOrderNo?: string;
    channelOrderNo?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentRecord[]> {
    let result = [...this.data.paymentRecords];
    if (filter) {
      if (filter.channel) {
        result = result.filter(r => r.channel === filter.channel);
      }
      if (filter.merchantOrderNo) {
        result = result.filter(r => r.merchantOrderNo === filter.merchantOrderNo);
      }
      if (filter.channelOrderNo) {
        result = result.filter(r => r.channelOrderNo === filter.channelOrderNo);
      }
      if (filter.startDate) {
        result = result.filter(r => r.payTime >= filter.startDate!);
      }
      if (filter.endDate) {
        result = result.filter(r => r.payTime <= filter.endDate!);
      }
    }
    return result.sort((a, b) => new Date(b.payTime).getTime() - new Date(a.payTime).getTime());
  }

  async findPaymentRecord(id: string): Promise<PaymentRecord | null> {
    return this.data.paymentRecords.find(r => r.id === id) || null;
  }

  // Reconciliation Records
  async createReconciliationRecord(record: Omit<ReconciliationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReconciliationRecord> {
    const reconRecord: ReconciliationRecord = {
      id: uuidv4(),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.reconciliationRecords.push(reconRecord);
    this.saveData();
    return reconRecord;
  }

  async findReconciliationRecords(filter?: {
    reconDate?: string;
    matchStatus?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ReconciliationRecord[]> {
    let result = [...this.data.reconciliationRecords];
    if (filter) {
      if (filter.reconDate) {
        result = result.filter(r => r.reconDate === filter.reconDate);
      }
      if (filter.matchStatus) {
        result = result.filter(r => r.matchStatus === filter.matchStatus);
      }
      if (filter.startDate) {
        result = result.filter(r => r.reconDate >= filter.startDate!);
      }
      if (filter.endDate) {
        result = result.filter(r => r.reconDate <= filter.endDate!);
      }
    }
    return result.sort((a, b) => new Date(b.reconDate).getTime() - new Date(a.reconDate).getTime());
  }

  async updateReconciliationRecord(id: string, updates: Partial<ReconciliationRecord>): Promise<ReconciliationRecord | null> {
    const index = this.data.reconciliationRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.data.reconciliationRecords[index] = {
      ...this.data.reconciliationRecords[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.reconciliationRecords[index];
  }

  // Discrepancy Tickets
  async createDiscrepancyTicket(ticket: Omit<DiscrepancyTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiscrepancyTicket> {
    const discrepancyTicket: DiscrepancyTicket = {
      id: uuidv4(),
      ...ticket,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.discrepancyTickets.push(discrepancyTicket);
    this.saveData();
    return discrepancyTicket;
  }

  async findDiscrepancyTickets(filter?: {
    type?: string;
    status?: string;
    handler?: string;
  }): Promise<DiscrepancyTicket[]> {
    let result = [...this.data.discrepancyTickets];
    if (filter) {
      if (filter.type) {
        result = result.filter(t => t.type === filter.type);
      }
      if (filter.status) {
        result = result.filter(t => t.status === filter.status);
      }
      if (filter.handler) {
        result = result.filter(t => t.handler === filter.handler);
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateDiscrepancyTicket(id: string, updates: Partial<DiscrepancyTicket>): Promise<DiscrepancyTicket | null> {
    const index = this.data.discrepancyTickets.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.data.discrepancyTickets[index] = {
      ...this.data.discrepancyTickets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.discrepancyTickets[index];
  }

  // Settlement Records
  async createSettlementRecord(record: Omit<SettlementRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SettlementRecord> {
    const settlementRecord: SettlementRecord = {
      id: uuidv4(),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.settlementRecords.push(settlementRecord);
    this.saveData();
    return settlementRecord;
  }

  async findSettlementRecords(filter?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SettlementRecord[]> {
    let result = [...this.data.settlementRecords];
    if (filter) {
      if (filter.status) {
        result = result.filter(r => r.status === filter.status);
      }
      if (filter.startDate) {
        result = result.filter(r => r.settlementTime >= filter.startDate!);
      }
      if (filter.endDate) {
        result = result.filter(r => r.settlementTime <= filter.endDate!);
      }
    }
    return result.sort((a, b) => new Date(b.settlementTime).getTime() - new Date(a.settlementTime).getTime());
  }

  // Reconciliation Rules
  async createReconciliationRule(rule: Omit<ReconciliationRule, 'id'>): Promise<ReconciliationRule> {
    const reconciliationRule: ReconciliationRule = {
      id: uuidv4(),
      ...rule,
    };
    this.data.reconciliationRules.push(reconciliationRule);
    this.saveData();
    return reconciliationRule;
  }

  async findReconciliationRules(channel?: string): Promise<ReconciliationRule[]> {
    if (channel) {
      return this.data.reconciliationRules.filter(r => r.channel === channel);
    }
    return this.data.reconciliationRules;
  }

  async updateReconciliationRule(id: string, updates: Partial<ReconciliationRule>): Promise<ReconciliationRule | null> {
    const index = this.data.reconciliationRules.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.data.reconciliationRules[index] = {
      ...this.data.reconciliationRules[index],
      ...updates,
    };
    this.saveData();
    return this.data.reconciliationRules[index];
  }

  // Statistics
  async getReconciliationSummary(reconDate: string) {
    // 基于业务记录统计，而不是对账记录
    const startOfDay = `${reconDate}T00:00:00.000Z`;
    const endOfDay = `${reconDate}T23:59:59.999Z`;
    
    const businessRecords = await this.findBusinessRecords({
      startDate: startOfDay,
      endDate: endOfDay,
    });
    
    const totalTransactions = businessRecords.length;
    let totalAmount = 0;
    
    // 获取所有对账记录
    const reconRecords = await this.findReconciliationRecords({ reconDate });
    const reconMap = new Map<string, any>();
    reconRecords.forEach(r => {
      reconMap.set(r.businessRecordId, r);
    });
    
    let matchedCount = 0;
    let matchedAmount = 0;
    const channelStats: { [key: string]: { total: number; matched: number; unmatched: number } } = {};
    
    for (const businessRecord of businessRecords) {
      totalAmount += businessRecord.amount;
      const channel = businessRecord.paymentMethod;
      
      if (!channelStats[channel]) {
        channelStats[channel] = { total: 0, matched: 0, unmatched: 0 };
      }
      channelStats[channel].total++;
      
      const reconRecord = reconMap.get(businessRecord.id);
      if (reconRecord && reconRecord.matchStatus === 'MATCHED') {
        matchedCount++;
        matchedAmount += businessRecord.amount;
        channelStats[channel].matched++;
      } else {
        channelStats[channel].unmatched++;
      }
    }

    return {
      reconDate,
      totalTransactions,
      matchedCount,
      unmatchedCount: totalTransactions - matchedCount,
      totalAmount,
      matchedAmount,
      unmatchedAmount: totalAmount - matchedAmount,
      matchRate: totalTransactions > 0 ? (matchedCount / totalTransactions) * 100 : 0,
      channelStats: Object.entries(channelStats).map(([channel, stats]) => ({
        channel,
        ...stats,
        matchRate: stats.total > 0 ? (stats.matched / stats.total) * 100 : 0,
      })),
    };
  }
}

export const storage = new FileStorage();
export default storage;

