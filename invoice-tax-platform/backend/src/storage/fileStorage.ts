import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  User, Company, Invoice, PurchaseOrder, Receipt,
  ThreeWayMatch, Reimbursement, SalesInvoice, RiskRule, AuditLog
} from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StorageData {
  users: User[];
  companies: Company[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  receipts: Receipt[];
  threeWayMatches: ThreeWayMatch[];
  reimbursements: Reimbursement[];
  salesInvoices: SalesInvoice[];
  riskRules: RiskRule[];
  auditLogs: AuditLog[];
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
      companies: [],
      invoices: [],
      purchaseOrders: [],
      receipts: [],
      threeWayMatches: [],
      reimbursements: [],
      salesInvoices: [],
      riskRules: [],
      auditLogs: []
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
      updatedAt: new Date().toISOString()
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

  async findAllUsers(): Promise<User[]> {
    return [...this.data.users];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.users[index];
  }

  // Companies
  async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const company: Company = {
      id: uuidv4(),
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.companies.push(company);
    this.saveData();
    return company;
  }

  async findCompany(query: { id?: string; taxNumber?: string }): Promise<Company | null> {
    if (query.id) {
      return this.data.companies.find(c => c.id === query.id) || null;
    }
    if (query.taxNumber) {
      return this.data.companies.find(c => c.taxNumber === query.taxNumber) || null;
    }
    return null;
  }

  async findAllCompanies(): Promise<Company[]> {
    return [...this.data.companies];
  }

  // Invoices
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const invoice: Invoice = {
      id: uuidv4(),
      ...invoiceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.invoices.push(invoice);
    this.saveData();
    return invoice;
  }

  async findInvoice(id: string): Promise<Invoice | null> {
    return this.data.invoices.find(i => i.id === id) || null;
  }

  async findInvoiceByFingerprint(fingerprint: string): Promise<Invoice | null> {
    return this.data.invoices.find(i => i.fingerprint === fingerprint) || null;
  }

  async findInvoices(filter?: {
    uploadedBy?: string;
    verifyStatus?: string;
    matchStatus?: string;
    riskLevel?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Invoice[]> {
    let result = [...this.data.invoices];
    if (filter) {
      if (filter.uploadedBy) {
        result = result.filter(i => i.uploadedBy === filter.uploadedBy);
      }
      if (filter.verifyStatus) {
        result = result.filter(i => i.verifyStatus === filter.verifyStatus);
      }
      if (filter.matchStatus) {
        result = result.filter(i => i.matchStatus === filter.matchStatus);
      }
      if (filter.riskLevel) {
        result = result.filter(i => i.riskLevel === filter.riskLevel);
      }
      if (filter.startDate) {
        result = result.filter(i => i.issueDate >= filter.startDate!);
      }
      if (filter.endDate) {
        result = result.filter(i => i.issueDate <= filter.endDate!);
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(i => {
          return i.invoiceCode.includes(searchLower) ||
                 i.invoiceNo.includes(searchLower) ||
                 i.seller.name.toLowerCase().includes(searchLower) ||
                 i.buyer.name.toLowerCase().includes(searchLower);
        });
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const index = this.data.invoices.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.data.invoices[index] = {
      ...this.data.invoices[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.invoices[index];
  }

  // Purchase Orders
  async createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    const order: PurchaseOrder = {
      id: uuidv4(),
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.purchaseOrders.push(order);
    this.saveData();
    return order;
  }

  async findPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    return this.data.purchaseOrders.find(o => o.id === id) || null;
  }

  async findPurchaseOrders(filter?: {
    supplierId?: string;
    buyerId?: string;
    status?: string;
    search?: string;
  }): Promise<PurchaseOrder[]> {
    let result = [...this.data.purchaseOrders];
    if (filter) {
      if (filter.supplierId) {
        result = result.filter(o => o.supplierId === filter.supplierId);
      }
      if (filter.buyerId) {
        result = result.filter(o => o.buyerId === filter.buyerId);
      }
      if (filter.status) {
        result = result.filter(o => o.status === filter.status);
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(o => {
          return o.orderNo.toLowerCase().includes(searchLower) ||
                 o.supplierName.toLowerCase().includes(searchLower) ||
                 o.buyerName.toLowerCase().includes(searchLower);
        });
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Receipts
  async createReceipt(receiptData: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt> {
    const receipt: Receipt = {
      id: uuidv4(),
      ...receiptData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.receipts.push(receipt);
    this.saveData();
    return receipt;
  }

  async findReceipt(id: string): Promise<Receipt | null> {
    return this.data.receipts.find(r => r.id === id) || null;
  }

  async findReceipts(filter?: {
    orderId?: string;
    supplierId?: string;
    status?: string;
  }): Promise<Receipt[]> {
    let result = [...this.data.receipts];
    if (filter) {
      if (filter.orderId) {
        result = result.filter(r => r.orderId === filter.orderId);
      }
      if (filter.supplierId) {
        result = result.filter(r => r.supplierId === filter.supplierId);
      }
      if (filter.status) {
        result = result.filter(r => r.status === filter.status);
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Three Way Matches
  async createThreeWayMatch(matchData: Omit<ThreeWayMatch, 'id'>): Promise<ThreeWayMatch> {
    const match: ThreeWayMatch = {
      id: uuidv4(),
      ...matchData
    };
    this.data.threeWayMatches.push(match);
    this.saveData();
    return match;
  }

  async findThreeWayMatches(filter?: { invoiceId?: string }): Promise<ThreeWayMatch[]> {
    let result = [...this.data.threeWayMatches];
    if (filter?.invoiceId) {
      result = result.filter(m => m.invoiceId === filter.invoiceId);
    }
    return result.sort((a, b) => new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime());
  }

  // Reimbursements
  async createReimbursement(reimbData: Omit<Reimbursement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reimbursement> {
    const reimbursement: Reimbursement = {
      id: uuidv4(),
      ...reimbData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.reimbursements.push(reimbursement);
    this.saveData();
    return reimbursement;
  }

  async findReimbursement(id: string): Promise<Reimbursement | null> {
    return this.data.reimbursements.find(r => r.id === id) || null;
  }

  async findReimbursements(filter?: {
    applicantId?: string;
    approvalStatus?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<Reimbursement[]> {
    let result = [...this.data.reimbursements];
    if (filter) {
      if (filter.applicantId) {
        result = result.filter(r => r.applicantId === filter.applicantId);
      }
      if (filter.approvalStatus) {
        result = result.filter(r => r.approvalStatus === filter.approvalStatus);
      }
      if (filter.paymentStatus) {
        result = result.filter(r => r.paymentStatus === filter.paymentStatus);
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(r => {
          return r.reimbursementNo.toLowerCase().includes(searchLower) ||
                 r.applicantName.toLowerCase().includes(searchLower);
        });
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateReimbursement(id: string, updates: Partial<Reimbursement>): Promise<Reimbursement | null> {
    const index = this.data.reimbursements.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.data.reimbursements[index] = {
      ...this.data.reimbursements[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.reimbursements[index];
  }

  // Sales Invoices
  async createSalesInvoice(invoiceData: Omit<SalesInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalesInvoice> {
    const invoice: SalesInvoice = {
      id: uuidv4(),
      ...invoiceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.salesInvoices.push(invoice);
    this.saveData();
    return invoice;
  }

  async findSalesInvoices(filter?: {
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SalesInvoice[]> {
    let result = [...this.data.salesInvoices];
    if (filter) {
      if (filter.customerId) {
        result = result.filter(i => i.customerId === filter.customerId);
      }
      if (filter.status) {
        result = result.filter(i => i.status === filter.status);
      }
      if (filter.startDate) {
        result = result.filter(i => i.issueDate >= filter.startDate!);
      }
      if (filter.endDate) {
        result = result.filter(i => i.issueDate <= filter.endDate!);
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Audit Logs
  async createAuditLog(logData: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const log: AuditLog = {
      id: uuidv4(),
      ...logData,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.push(log);
    this.saveData();
    return log;
  }

  async findAuditLogs(filter?: {
    userId?: string;
    action?: string;
    resourceType?: string;
  }): Promise<AuditLog[]> {
    let result = [...this.data.auditLogs];
    if (filter) {
      if (filter.userId) {
        result = result.filter(l => l.userId === filter.userId);
      }
      if (filter.action) {
        result = result.filter(l => l.action === filter.action);
      }
      if (filter.resourceType) {
        result = result.filter(l => l.resourceType === filter.resourceType);
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Statistics
  async getStatistics(): Promise<any> {
    const invoices = this.data.invoices;
    const reimbursements = this.data.reimbursements;
    const salesInvoices = this.data.salesInvoices;

    return {
      totalInvoices: invoices.length,
      verifiedInvoices: invoices.filter(i => i.verifyStatus === 'verified').length,
      matchedInvoices: invoices.filter(i => i.matchStatus === 'matched').length,
      highRiskInvoices: invoices.filter(i => i.riskLevel === 'high').length,
      totalReimbursements: reimbursements.length,
      pendingReimbursements: reimbursements.filter(r => r.approvalStatus === 'pending').length,
      totalSalesInvoices: salesInvoices.length,
      totalInvoiceAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
      totalReimbursementAmount: reimbursements.reduce((sum, r) => sum + r.totalAmount, 0),
      totalSalesAmount: salesInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
    };
  }
}

export const storage = new FileStorage();
export default storage;

