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
  dataExportAssessments: any[];
  standardContracts: any[];
  dataTransmissions: any[];
  crossBorderPayments: any[];
  supplyChainOrders: any[];
  regulatoryReports: any[];
  blockchainRecords: any[];
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
      dataExportAssessments: [],
      standardContracts: [],
      dataTransmissions: [],
      crossBorderPayments: [],
      supplyChainOrders: [],
      regulatoryReports: [],
      blockchainRecords: [],
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

  async findAllUsers(filter?: { companyId?: string; role?: string }): Promise<any[]> {
    let result = [...this.data.users];
    if (filter) {
      if (filter.companyId) {
        result = result.filter(u => u.companyId === filter.companyId);
      }
      if (filter.role) {
        result = result.filter(u => u.role === filter.role);
      }
    }
    return result;
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

  async findCompany(query: { id?: string; registrationNumber?: string }): Promise<any | null> {
    let company = null;
    if (query.id) {
      company = this.data.companies.find(c => c.id === query.id);
    } else if (query.registrationNumber) {
      company = this.data.companies.find(c => c.registrationNumber === query.registrationNumber);
    }
    return company ? { ...company } : null;
  }

  async findAllCompanies(filter?: { type?: string; region?: string }): Promise<any[]> {
    let result = [...this.data.companies];
    if (filter) {
      if (filter.type) {
        result = result.filter(c => c.type === filter.type);
      }
      if (filter.region) {
        result = result.filter(c => c.region === filter.region);
      }
    }
    return result;
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

  // Data Export Assessments
  async createDataExportAssessment(data: any): Promise<any> {
    const assessment = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.dataExportAssessments.push(assessment);
    this.saveData();
    return assessment;
  }

  async findDataExportAssessment(id: string): Promise<any | null> {
    const assessment = this.data.dataExportAssessments.find(a => a.id === id);
    return assessment ? { ...assessment } : null;
  }

  async findDataExportAssessments(filter?: any): Promise<any[]> {
    let result = [...this.data.dataExportAssessments];
    if (filter) {
      if (filter.status) {
        result = result.filter(a => a.status === filter.status);
      }
      if (filter.path) {
        result = result.filter(a => a.path === filter.path);
      }
    }
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  async updateDataExportAssessment(id: string, updates: Partial<any>): Promise<any | null> {
    const index = this.data.dataExportAssessments.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.data.dataExportAssessments[index] = {
      ...this.data.dataExportAssessments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.dataExportAssessments[index];
  }

  // Standard Contracts
  async createStandardContract(data: any): Promise<any> {
    const contract = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.standardContracts.push(contract);
    this.saveData();
    return contract;
  }

  async findStandardContract(id: string): Promise<any | null> {
    const contract = this.data.standardContracts.find(c => c.id === id);
    return contract ? { ...contract } : null;
  }

  async findStandardContracts(filter?: any): Promise<any[]> {
    let result = [...this.data.standardContracts];
    if (filter) {
      if (filter.status) {
        result = result.filter(c => c.status === filter.status);
      }
    }
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  // Data Transmissions
  async createDataTransmission(data: any): Promise<any> {
    const transmission = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.dataTransmissions.push(transmission);
    this.saveData();
    return transmission;
  }

  async findDataTransmission(id: string): Promise<any | null> {
    const transmission = this.data.dataTransmissions.find(t => t.id === id);
    return transmission ? { ...transmission } : null;
  }

  async findDataTransmissions(filter?: any): Promise<any[]> {
    let result = [...this.data.dataTransmissions];
    if (filter) {
      if (filter.status) {
        result = result.filter(t => t.status === filter.status);
      }
    }
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  // Cross Border Payments
  async createCrossBorderPayment(data: any): Promise<any> {
    const payment = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.crossBorderPayments.push(payment);
    this.saveData();
    return payment;
  }

  async findCrossBorderPayment(id: string): Promise<any | null> {
    const payment = this.data.crossBorderPayments.find(p => p.id === id);
    return payment ? { ...payment } : null;
  }

  async findCrossBorderPayments(filter?: any): Promise<any[]> {
    let result = [...this.data.crossBorderPayments];
    if (filter) {
      if (filter.status) {
        result = result.filter(p => p.status === filter.status);
      }
    }
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  async updateCrossBorderPayment(id: string, updates: Partial<any>): Promise<any | null> {
    const index = this.data.crossBorderPayments.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.crossBorderPayments[index] = {
      ...this.data.crossBorderPayments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.crossBorderPayments[index];
  }

  // Supply Chain Orders
  async createSupplyChainOrder(data: any): Promise<any> {
    const order = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.supplyChainOrders.push(order);
    this.saveData();
    return order;
  }

  async findSupplyChainOrder(id: string): Promise<any | null> {
    const order = this.data.supplyChainOrders.find(o => o.id === id);
    return order ? { ...order } : null;
  }

  async findSupplyChainOrders(filter?: any): Promise<any[]> {
    let result = [...this.data.supplyChainOrders];
    if (filter) {
      if (filter.status) {
        result = result.filter(o => o.status === filter.status);
      }
    }
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  async updateSupplyChainOrder(id: string, updates: Partial<any>): Promise<any | null> {
    const index = this.data.supplyChainOrders.findIndex(o => o.id === id);
    if (index === -1) return null;
    this.data.supplyChainOrders[index] = {
      ...this.data.supplyChainOrders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.supplyChainOrders[index];
  }

  // Regulatory Reports
  async createRegulatoryReport(data: any): Promise<any> {
    const report = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.regulatoryReports.push(report);
    this.saveData();
    return report;
  }

  async findRegulatoryReport(id: string): Promise<any | null> {
    const report = this.data.regulatoryReports.find(r => r.id === id);
    return report ? { ...report } : null;
  }

  async findRegulatoryReports(filter?: any): Promise<any[]> {
    let result = [...this.data.regulatoryReports];
    if (filter) {
      if (filter.agency) {
        result = result.filter(r => r.agency === filter.agency);
      }
    }
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  // Blockchain Records
  async createBlockchainRecord(data: any): Promise<any> {
    const record = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString()
    };
    this.data.blockchainRecords.push(record);
    this.saveData();
    return record;
  }

  async findBlockchainRecords(filter?: any): Promise<any[]> {
    let result = [...this.data.blockchainRecords];
    if (filter) {
      if (filter.dataType) {
        result = result.filter(r => r.dataType === filter.dataType);
      }
    }
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
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
      if (filter.action) {
        result = result.filter(l => l.action === filter.action);
      }
    }
    return result.reverse();
  }
}

export const storage = new FileStorage();
export default storage;

