import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Company,
  Device,
  Batch,
  TemperatureData,
  Alert,
  Transport,
  Incident,
} from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StorageData {
  users: User[];
  companies: Company[];
  devices: Device[];
  batches: Batch[];
  temperatureData: TemperatureData[];
  alerts: Alert[];
  transports: Transport[];
  incidents: Incident[];
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
      devices: [],
      batches: [],
      temperatureData: [],
      alerts: [],
      transports: [],
      incidents: [],
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

  async findAllUsers(): Promise<User[]> {
    return this.data.users;
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

  async findCompany(id: string): Promise<Company | null> {
    return this.data.companies.find(c => c.id === id) || null;
  }

  async findAllCompanies(filter?: { type?: string }): Promise<Company[]> {
    let result = [...this.data.companies];
    if (filter?.type) {
      result = result.filter(c => c.type === filter.type);
    }
    return result;
  }

  // Devices
  async createDevice(deviceData: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> {
    const device: Device = {
      id: uuidv4(),
      ...deviceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.devices.push(device);
    this.saveData();
    return device;
  }

  async findDevice(id: string): Promise<Device | null> {
    return this.data.devices.find(d => d.id === id) || null;
  }

  async findDevices(filter?: { type?: string; status?: string }): Promise<Device[]> {
    let result = [...this.data.devices];
    if (filter?.type) {
      result = result.filter(d => d.type === filter.type);
    }
    if (filter?.status) {
      result = result.filter(d => d.status === filter.status);
    }
    return result;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | null> {
    const index = this.data.devices.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.data.devices[index] = {
      ...this.data.devices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.devices[index];
  }

  // Batches
  async createBatch(batchData: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Batch> {
    const batch: Batch = {
      id: uuidv4(),
      ...batchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.batches.push(batch);
    this.saveData();
    return batch;
  }

  async findBatch(id: string): Promise<Batch | null> {
    return this.data.batches.find(b => b.id === id) || null;
  }

  async findBatches(filter?: { producerId?: string; status?: string; search?: string }): Promise<Batch[]> {
    let result = [...this.data.batches];
    if (filter?.producerId) {
      result = result.filter(b => b.producerId === filter.producerId);
    }
    if (filter?.status) {
      result = result.filter(b => b.status === filter.status);
    }
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(b => 
        b.batchNo.toLowerCase().includes(searchLower) ||
        b.productName.toLowerCase().includes(searchLower) ||
        b.traceCode?.toLowerCase().includes(searchLower)
      );
    }
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch | null> {
    const index = this.data.batches.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.data.batches[index] = {
      ...this.data.batches[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.batches[index];
  }

  // TemperatureData
  async createTemperatureData(data: Omit<TemperatureData, 'id' | 'createdAt'>): Promise<TemperatureData> {
    const tempData: TemperatureData = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.data.temperatureData.push(tempData);
    this.saveData();
    return tempData;
  }

  async findTemperatureData(filter: {
    deviceId?: string;
    batchId?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<TemperatureData[]> {
    let result = [...this.data.temperatureData];
    
    if (filter.deviceId) {
      result = result.filter(t => t.deviceId === filter.deviceId);
    }
    if (filter.batchId) {
      result = result.filter(t => t.batchId === filter.batchId);
    }
    if (filter.startTime) {
      const startDate = new Date(filter.startTime);
      result = result.filter(t => {
        const tDate = new Date(t.timestamp);
        return tDate >= startDate;
      });
    }
    if (filter.endTime) {
      const endDate = new Date(filter.endTime);
      result = result.filter(t => {
        const tDate = new Date(t.timestamp);
        return tDate <= endDate;
      });
    }
    
    const sorted = result.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // 只记录查询结果，避免日志过多
    if (filter.batchId && sorted.length === 0) {
      console.log('No temperature data found for batch:', filter.batchId, 'with filter:', filter);
    }
    
    return sorted;
  }

  // Alerts
  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    const alert: Alert = {
      id: uuidv4(),
      ...alertData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.alerts.push(alert);
    this.saveData();
    return alert;
  }

  async findAlert(id: string): Promise<Alert | null> {
    return this.data.alerts.find(a => a.id === id) || null;
  }

  async findAlerts(filter?: {
    batchId?: string;
    deviceId?: string;
    status?: string;
    level?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<Alert[]> {
    let result = [...this.data.alerts];
    if (filter?.batchId) {
      result = result.filter(a => a.batchId === filter.batchId);
    }
    if (filter?.deviceId) {
      result = result.filter(a => a.deviceId === filter.deviceId);
    }
    if (filter?.status) {
      result = result.filter(a => a.status === filter.status);
    }
    if (filter?.level) {
      result = result.filter(a => a.level === filter.level);
    }
    if (filter?.startTime) {
      result = result.filter(a => a.createdAt >= filter.startTime!);
    }
    if (filter?.endTime) {
      result = result.filter(a => a.createdAt <= filter.endTime!);
    }
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
    const index = this.data.alerts.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.data.alerts[index] = {
      ...this.data.alerts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.alerts[index];
  }

  // Transports
  async createTransport(transportData: Omit<Transport, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transport> {
    const transport: Transport = {
      id: uuidv4(),
      ...transportData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.transports.push(transport);
    this.saveData();
    return transport;
  }

  async findTransport(id: string): Promise<Transport | null> {
    return this.data.transports.find(t => t.id === id) || null;
  }

  async findTransports(filter?: {
    fromCompanyId?: string;
    toCompanyId?: string;
    status?: string;
    search?: string;
  }): Promise<Transport[]> {
    let result = [...this.data.transports];
    if (filter?.fromCompanyId) {
      result = result.filter(t => t.fromCompanyId === filter.fromCompanyId);
    }
    if (filter?.toCompanyId) {
      result = result.filter(t => t.toCompanyId === filter.toCompanyId);
    }
    if (filter?.status) {
      result = result.filter(t => t.status === filter.status);
    }
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(t => 
        t.transportNo.toLowerCase().includes(searchLower)
      );
    }
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateTransport(id: string, updates: Partial<Transport>): Promise<Transport | null> {
    const index = this.data.transports.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.data.transports[index] = {
      ...this.data.transports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.transports[index];
  }

  // Incidents
  async createIncident(incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const incident: Incident = {
      id: uuidv4(),
      ...incidentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.incidents.push(incident);
    this.saveData();
    return incident;
  }

  async findIncident(id: string): Promise<Incident | null> {
    return this.data.incidents.find(i => i.id === id) || null;
  }

  async findIncidents(filter?: {
    batchId?: string;
    transportId?: string;
    severity?: string;
  }): Promise<Incident[]> {
    let result = [...this.data.incidents];
    if (filter?.batchId) {
      result = result.filter(i => i.batchId === filter.batchId);
    }
    if (filter?.transportId) {
      result = result.filter(i => i.transportId === filter.transportId);
    }
    if (filter?.severity) {
      result = result.filter(i => i.severity === filter.severity);
    }
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const index = this.data.incidents.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.data.incidents[index] = {
      ...this.data.incidents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.incidents[index];
  }
}

export const storage = new FileStorage();
export default storage;
