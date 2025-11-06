import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  User,
  Company,
  EmissionFactor,
  ActivityData,
  CarbonInventory,
  ProductCarbonFootprint,
  ReductionProject,
  ESGReport,
  Verification,
  SupplierCarbonData,
} from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StorageData {
  users: User[];
  companies: Company[];
  emissionFactors: EmissionFactor[];
  activityData: ActivityData[];
  carbonInventories: CarbonInventory[];
  productCarbonFootprints: ProductCarbonFootprint[];
  reductionProjects: ReductionProject[];
  esgReports: ESGReport[];
  verifications: Verification[];
  supplierCarbonData: SupplierCarbonData[];
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
      emissionFactors: [],
      activityData: [],
      carbonInventories: [],
      productCarbonFootprints: [],
      reductionProjects: [],
      esgReports: [],
      verifications: [],
      supplierCarbonData: [],
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

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
    };
    this.data.companies.push(company);
    this.saveData();
    return company;
  }

  async findCompany(query: { id?: string; unifiedSocialCreditCode?: string }): Promise<Company | null> {
    if (query.id) {
      return this.data.companies.find(c => c.id === query.id) || null;
    }
    if (query.unifiedSocialCreditCode) {
      return this.data.companies.find(c => c.unifiedSocialCreditCode === query.unifiedSocialCreditCode) || null;
    }
    return null;
  }

  async findAllCompanies(filter?: { search?: string }): Promise<Company[]> {
    let result = [...this.data.companies];
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.unifiedSocialCreditCode.includes(searchLower)
      );
    }
    return result;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    const index = this.data.companies.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.companies[index] = {
      ...this.data.companies[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.companies[index];
  }

  // Emission Factors
  async createEmissionFactor(factorData: Omit<EmissionFactor, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmissionFactor> {
    const factor: EmissionFactor = {
      id: uuidv4(),
      ...factorData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.emissionFactors.push(factor);
    this.saveData();
    return factor;
  }

  async findEmissionFactors(filter?: { category?: string; search?: string }): Promise<EmissionFactor[]> {
    let result = [...this.data.emissionFactors];
    if (filter?.category) {
      result = result.filter(f => f.category === filter.category);
    }
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(searchLower));
    }
    return result;
  }

  // Activity Data
  async createActivityData(data: Omit<ActivityData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActivityData> {
    const activityData: ActivityData = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.activityData.push(activityData);
    this.saveData();
    return activityData;
  }

  async findActivityData(filter: { companyId: string; period?: string }): Promise<ActivityData[]> {
    let result = this.data.activityData.filter(ad => ad.companyId === filter.companyId);
    if (filter.period) {
      result = result.filter(ad => ad.period === filter.period);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Carbon Inventories
  async createCarbonInventory(inventory: Omit<CarbonInventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarbonInventory> {
    const carbonInventory: CarbonInventory = {
      id: uuidv4(),
      ...inventory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.carbonInventories.push(carbonInventory);
    this.saveData();
    return carbonInventory;
  }

  async findCarbonInventories(filter: { companyId?: string; period?: string; status?: string }): Promise<CarbonInventory[]> {
    let result = [...this.data.carbonInventories];
    if (filter.companyId) {
      result = result.filter(ci => ci.companyId === filter.companyId);
    }
    if (filter.period) {
      result = result.filter(ci => ci.period === filter.period);
    }
    if (filter.status) {
      result = result.filter(ci => ci.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findCarbonInventory(id: string): Promise<CarbonInventory | null> {
    return this.data.carbonInventories.find(ci => ci.id === id) || null;
  }

  async updateCarbonInventory(id: string, updates: Partial<CarbonInventory>): Promise<CarbonInventory | null> {
    const index = this.data.carbonInventories.findIndex(ci => ci.id === id);
    if (index === -1) return null;
    this.data.carbonInventories[index] = {
      ...this.data.carbonInventories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.carbonInventories[index];
  }

  // Product Carbon Footprints
  async createProductCarbonFootprint(data: Omit<ProductCarbonFootprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductCarbonFootprint> {
    const pcf: ProductCarbonFootprint = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.productCarbonFootprints.push(pcf);
    this.saveData();
    return pcf;
  }

  async findProductCarbonFootprints(filter: { companyId?: string; verified?: boolean }): Promise<ProductCarbonFootprint[]> {
    let result = [...this.data.productCarbonFootprints];
    if (filter.companyId) {
      result = result.filter(pcf => pcf.companyId === filter.companyId);
    }
    if (filter.verified !== undefined) {
      result = result.filter(pcf => pcf.verified === filter.verified);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findProductCarbonFootprint(id: string): Promise<ProductCarbonFootprint | null> {
    return this.data.productCarbonFootprints.find(pcf => pcf.id === id) || null;
  }

  async updateProductCarbonFootprint(id: string, updates: Partial<ProductCarbonFootprint>): Promise<ProductCarbonFootprint | null> {
    const index = this.data.productCarbonFootprints.findIndex(pcf => pcf.id === id);
    if (index === -1) return null;
    this.data.productCarbonFootprints[index] = {
      ...this.data.productCarbonFootprints[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.productCarbonFootprints[index];
  }

  // Reduction Projects
  async createReductionProject(project: Omit<ReductionProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReductionProject> {
    const rp: ReductionProject = {
      id: uuidv4(),
      ...project,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.reductionProjects.push(rp);
    this.saveData();
    return rp;
  }

  async findReductionProjects(filter: { companyId?: string; status?: string; vintage?: string }): Promise<ReductionProject[]> {
    let result = [...this.data.reductionProjects];
    if (filter.companyId) {
      result = result.filter(rp => rp.companyId === filter.companyId);
    }
    if (filter.status) {
      result = result.filter(rp => rp.status === filter.status);
    }
    if (filter.vintage) {
      result = result.filter(rp => rp.vintage === filter.vintage);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findReductionProject(id: string): Promise<ReductionProject | null> {
    return this.data.reductionProjects.find(rp => rp.id === id) || null;
  }

  async updateReductionProject(id: string, updates: Partial<ReductionProject>): Promise<ReductionProject | null> {
    const index = this.data.reductionProjects.findIndex(rp => rp.id === id);
    if (index === -1) return null;
    this.data.reductionProjects[index] = {
      ...this.data.reductionProjects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.reductionProjects[index];
  }

  // ESG Reports
  async createESGReport(report: Omit<ESGReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<ESGReport> {
    const esgReport: ESGReport = {
      id: uuidv4(),
      ...report,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.esgReports.push(esgReport);
    this.saveData();
    return esgReport;
  }

  async findESGReports(filter: { companyId?: string; year?: number; status?: string }): Promise<ESGReport[]> {
    let result = [...this.data.esgReports];
    if (filter.companyId) {
      result = result.filter(r => r.companyId === filter.companyId);
    }
    if (filter.year) {
      result = result.filter(r => r.year === filter.year);
    }
    if (filter.status) {
      result = result.filter(r => r.status === filter.status);
    }
    return result.sort((a, b) => b.year - a.year || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findESGReport(id: string): Promise<ESGReport | null> {
    return this.data.esgReports.find(r => r.id === id) || null;
  }

  async updateESGReport(id: string, updates: Partial<ESGReport>): Promise<ESGReport | null> {
    const index = this.data.esgReports.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.data.esgReports[index] = {
      ...this.data.esgReports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.esgReports[index];
  }

  // Verifications
  async createVerification(verification: Omit<Verification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Verification> {
    const ver: Verification = {
      id: uuidv4(),
      ...verification,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.verifications.push(ver);
    this.saveData();
    return ver;
  }

  async findVerifications(filter?: { resourceType?: string; resourceId?: string; status?: string }): Promise<Verification[]> {
    let result = [...this.data.verifications];
    if (filter?.resourceType) {
      result = result.filter(v => v.resourceType === filter.resourceType);
    }
    if (filter?.resourceId) {
      result = result.filter(v => v.resourceId === filter.resourceId);
    }
    if (filter?.status) {
      result = result.filter(v => v.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Supplier Carbon Data
  async createSupplierCarbonData(data: Omit<SupplierCarbonData, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierCarbonData> {
    const scd: SupplierCarbonData = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.supplierCarbonData.push(scd);
    this.saveData();
    return scd;
  }

  async findSupplierCarbonData(filter: { supplierId?: string; buyerId?: string }): Promise<SupplierCarbonData[]> {
    let result = [...this.data.supplierCarbonData];
    if (filter.supplierId) {
      result = result.filter(scd => scd.supplierId === filter.supplierId);
    }
    if (filter.buyerId) {
      result = result.filter(scd => scd.buyerId === filter.buyerId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new FileStorage();
export default storage;
