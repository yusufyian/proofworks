import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StorageData {
  users: any[];
  companies: any[];
  certificates: any[];
  transfers: any[];
  financings: any[];
  auditLogs: any[];
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
      certificates: [],
      transfers: [],
      financings: [],
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
  async createUser(userData: any): Promise<any> {
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  async findUser(query: { email?: string; id?: string }): Promise<any | null> {
    if (query.email) {
      const user = this.data.users.find(u => u.email === query.email);
      return user ? { ...user } : null;
    }
    if (query.id) {
      const user = this.data.users.find(u => u.id === query.id);
      return user ? { ...user } : null;
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<any>): Promise<any | null> {
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
  async createCompany(companyData: any): Promise<any> {
    const company = {
      id: uuidv4(),
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.companies.push(company);
    this.saveData();
    return company;
  }

  async findCompany(query: { id?: string; unifiedSocialCreditCode?: string }): Promise<any | null> {
    let company = null;
    if (query.id) {
      company = this.data.companies.find(c => c.id === query.id);
    } else if (query.unifiedSocialCreditCode) {
      company = this.data.companies.find(c => c.unifiedSocialCreditCode === query.unifiedSocialCreditCode);
    }
    return company ? { ...company } : null;
  }

  async findAllCompanies(): Promise<any[]> {
    return this.data.companies;
  }

  async updateCompany(id: string, updates: Partial<any>): Promise<any | null> {
    const index = this.data.companies.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.companies[index] = {
      ...this.data.companies[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.companies[index];
  }

  // Certificates
  async createCertificate(certData: any): Promise<any> {
    const certificate = {
      id: uuidv4(),
      ...certData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.certificates.push(certificate);
    this.saveData();
    return certificate;
  }

  async findCertificate(id: string): Promise<any | null> {
    const cert = this.data.certificates.find(c => c.id === id);
    return cert ? { ...cert } : null;
  }

  async findCertificates(filter?: { creditorId?: string; debtorId?: string; status?: string; search?: string }): Promise<any[]> {
    let result = [...this.data.certificates];
    if (filter) {
      if (filter.creditorId) {
        result = result.filter(c => c.creditorId === filter.creditorId);
      }
      if (filter.debtorId) {
        result = result.filter(c => c.debtorId === filter.debtorId);
      }
      if (filter.status) {
        result = result.filter(c => c.status === filter.status);
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(c => {
          const certNum = c.certificateNumber?.toLowerCase() || '';
          const txHash = c.blockchainTxHash?.toLowerCase() || '';
          // 获取关联公司名称进行搜索
          const creditor = this.data.companies.find(comp => comp.id === c.creditorId);
          const debtor = this.data.companies.find(comp => comp.id === c.debtorId);
          const creditorName = creditor?.name?.toLowerCase() || '';
          const debtorName = debtor?.name?.toLowerCase() || '';
          
          return certNum.includes(searchLower) ||
                 txHash.includes(searchLower) ||
                 creditorName.includes(searchLower) ||
                 debtorName.includes(searchLower);
        });
      }
    }
    // 按创建时间倒序排列（最新的在前）
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  async updateCertificate(id: string, updates: Partial<any>): Promise<any | null> {
    const index = this.data.certificates.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.certificates[index] = {
      ...this.data.certificates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.certificates[index];
  }

  // Transfers
  async createTransfer(transferData: any): Promise<any> {
    const transfer = {
      id: uuidv4(),
      ...transferData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.transfers.push(transfer);
    this.saveData();
    return transfer;
  }

  async findTransfer(id: string): Promise<any | null> {
    const transfer = this.data.transfers.find(t => t.id === id);
    return transfer ? { ...transfer } : null;
  }

  async findTransfers(filter?: { fromCompanyId?: string; toCompanyId?: string; status?: string; search?: string }): Promise<any[]> {
    let result = [...this.data.transfers];
    if (filter) {
      if (filter.fromCompanyId) {
        result = result.filter(t => t.fromCompanyId === filter.fromCompanyId);
      }
      if (filter.toCompanyId) {
        result = result.filter(t => t.toCompanyId === filter.toCompanyId);
      }
      if (filter.status) {
        result = result.filter(t => t.status === filter.status);
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(t => {
          const cert = this.data.certificates.find(c => c.id === t.certificateId);
          const certNum = cert?.certificateNumber?.toLowerCase() || '';
          const txHash = t.blockchainTxHash?.toLowerCase() || '';
          const fromCompany = this.data.companies.find(comp => comp.id === t.fromCompanyId);
          const toCompany = this.data.companies.find(comp => comp.id === t.toCompanyId);
          const fromName = fromCompany?.name?.toLowerCase() || '';
          const toName = toCompany?.name?.toLowerCase() || '';
          
          return certNum.includes(searchLower) ||
                 txHash.includes(searchLower) ||
                 fromName.includes(searchLower) ||
                 toName.includes(searchLower);
        });
      }
    }
    // 按创建时间倒序排列（最新的在前）
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  async updateTransfer(id: string, updates: Partial<any>): Promise<any | null> {
    const index = this.data.transfers.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.data.transfers[index] = {
      ...this.data.transfers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.transfers[index];
  }

  // Financings
  async createFinancing(financingData: any): Promise<any> {
    const financing = {
      id: uuidv4(),
      ...financingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.financings.push(financing);
    this.saveData();
    return financing;
  }

  async findFinancing(id: string): Promise<any | null> {
    const financing = this.data.financings.find(f => f.id === id);
    return financing ? { ...financing } : null;
  }

  async findFinancings(filter?: { applicantId?: string; financierId?: string; status?: string; search?: string }): Promise<any[]> {
    let result = [...this.data.financings];
    if (filter) {
      if (filter.applicantId) {
        result = result.filter(f => f.applicantId === filter.applicantId);
      }
      if (filter.financierId) {
        result = result.filter(f => f.financierId === filter.financierId);
      }
      if (filter.status) {
        result = result.filter(f => f.status === filter.status);
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(f => {
          const cert = this.data.certificates.find(c => c.id === f.certificateId);
          const certNum = cert?.certificateNumber?.toLowerCase() || '';
          const applicant = this.data.companies.find(comp => comp.id === f.applicantId);
          const financier = this.data.companies.find(comp => comp.id === f.financierId);
          const applicantName = applicant?.name?.toLowerCase() || '';
          const financierName = financier?.name?.toLowerCase() || '';
          
          return certNum.includes(searchLower) ||
                 applicantName.includes(searchLower) ||
                 financierName.includes(searchLower);
        });
      }
    }
    // 按创建时间倒序排列（最新的在前）
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  async updateFinancing(id: string, updates: Partial<any>): Promise<any | null> {
    const index = this.data.financings.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.data.financings[index] = {
      ...this.data.financings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.financings[index];
  }

  // Audit Logs
  async createAuditLog(logData: any): Promise<any> {
    const log = {
      id: uuidv4(),
      ...logData,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.push(log);
    this.saveData();
    return log;
  }

  async findAuditLogs(filter?: any): Promise<any[]> {
    let result = [...this.data.auditLogs];
    if (filter) {
      if (filter.resourceType) {
        result = result.filter(l => l.resourceType === filter.resourceType);
      }
      if (filter.action) {
        result = result.filter(l => l.action === filter.action);
      }
      if (filter.status) {
        result = result.filter(l => l.status === filter.status);
      }
    }
    return result.reverse(); // 最新的在前
  }

  // 统计方法
  async countCertificates(filter?: { creditorId?: string; debtorId?: string; status?: string }): Promise<number> {
    const certificates = await this.findCertificates(filter);
    return certificates.length;
  }

  async sumCertificates(field: 'initialAmount' | 'remainingAmount', filter?: any): Promise<number> {
    const certificates = await this.findCertificates(filter);
    return certificates.reduce((sum, c) => sum + (parseFloat(c[field]) || 0), 0);
  }

  async countFinancings(filter?: any): Promise<number> {
    const financings = await this.findFinancings(filter);
    return financings.length;
  }

  async sumFinancings(field: 'amount', filter?: any): Promise<number> {
    const financings = await this.findFinancings(filter);
    return financings.reduce((sum, f) => sum + (parseFloat(f[field]) || 0), 0);
  }
}

export const storage = new FileStorage();
export default storage;

