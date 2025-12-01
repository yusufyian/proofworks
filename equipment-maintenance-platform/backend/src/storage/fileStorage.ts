import fs from 'fs';
import path from 'path';
import {
  User,
  Equipment,
  MaintenancePlan,
  WorkOrder,
  SparePart,
  HealthAssessment,
  KnowledgeBase,
  BlockchainRecord,
} from '../types';

const DATA_DIR = path.join(__dirname, '../../data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class FileStorage {
  private usersFile = path.join(DATA_DIR, 'users.json');
  private equipmentFile = path.join(DATA_DIR, 'equipment.json');
  private maintenancePlansFile = path.join(DATA_DIR, 'maintenancePlans.json');
  private workOrdersFile = path.join(DATA_DIR, 'workOrders.json');
  private sparePartsFile = path.join(DATA_DIR, 'spareParts.json');
  private healthAssessmentsFile = path.join(DATA_DIR, 'healthAssessments.json');
  private knowledgeBaseFile = path.join(DATA_DIR, 'knowledgeBase.json');
  private blockchainRecordsFile = path.join(DATA_DIR, 'blockchainRecords.json');

  // Users
  getUsers(): User[] {
    if (!fs.existsSync(this.usersFile)) return [];
    return JSON.parse(fs.readFileSync(this.usersFile, 'utf-8'));
  }

  saveUsers(users: User[]): void {
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
  }

  // Equipment
  getEquipment(): Equipment[] {
    if (!fs.existsSync(this.equipmentFile)) return [];
    return JSON.parse(fs.readFileSync(this.equipmentFile, 'utf-8'));
  }

  saveEquipment(equipment: Equipment[]): void {
    fs.writeFileSync(this.equipmentFile, JSON.stringify(equipment, null, 2));
  }

  // Maintenance Plans
  getMaintenancePlans(): MaintenancePlan[] {
    if (!fs.existsSync(this.maintenancePlansFile)) return [];
    return JSON.parse(fs.readFileSync(this.maintenancePlansFile, 'utf-8'));
  }

  saveMaintenancePlans(plans: MaintenancePlan[]): void {
    fs.writeFileSync(this.maintenancePlansFile, JSON.stringify(plans, null, 2));
  }

  // Work Orders
  getWorkOrders(): WorkOrder[] {
    if (!fs.existsSync(this.workOrdersFile)) return [];
    return JSON.parse(fs.readFileSync(this.workOrdersFile, 'utf-8'));
  }

  saveWorkOrders(orders: WorkOrder[]): void {
    fs.writeFileSync(this.workOrdersFile, JSON.stringify(orders, null, 2));
  }

  // Spare Parts
  getSpareParts(): SparePart[] {
    if (!fs.existsSync(this.sparePartsFile)) return [];
    return JSON.parse(fs.readFileSync(this.sparePartsFile, 'utf-8'));
  }

  saveSpareParts(parts: SparePart[]): void {
    fs.writeFileSync(this.sparePartsFile, JSON.stringify(parts, null, 2));
  }

  // Health Assessments
  getHealthAssessments(): HealthAssessment[] {
    if (!fs.existsSync(this.healthAssessmentsFile)) return [];
    return JSON.parse(fs.readFileSync(this.healthAssessmentsFile, 'utf-8'));
  }

  saveHealthAssessments(assessments: HealthAssessment[]): void {
    fs.writeFileSync(this.healthAssessmentsFile, JSON.stringify(assessments, null, 2));
  }

  // Knowledge Base
  getKnowledgeBase(): KnowledgeBase[] {
    if (!fs.existsSync(this.knowledgeBaseFile)) return [];
    return JSON.parse(fs.readFileSync(this.knowledgeBaseFile, 'utf-8'));
  }

  saveKnowledgeBase(knowledge: KnowledgeBase[]): void {
    fs.writeFileSync(this.knowledgeBaseFile, JSON.stringify(knowledge, null, 2));
  }

  // Blockchain Records
  getBlockchainRecords(): BlockchainRecord[] {
    if (!fs.existsSync(this.blockchainRecordsFile)) return [];
    return JSON.parse(fs.readFileSync(this.blockchainRecordsFile, 'utf-8'));
  }

  saveBlockchainRecords(records: BlockchainRecord[]): void {
    fs.writeFileSync(this.blockchainRecordsFile, JSON.stringify(records, null, 2));
  }

  // Create methods
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  createEquipment(equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Equipment {
    const equipment = this.getEquipment();
    const newEquipment: Equipment = {
      ...equipmentData,
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    equipment.push(newEquipment);
    this.saveEquipment(equipment);
    return newEquipment;
  }

  createMaintenancePlan(planData: Omit<MaintenancePlan, 'id' | 'createdAt'>): MaintenancePlan {
    const plans = this.getMaintenancePlans();
    const newPlan: MaintenancePlan = {
      ...planData,
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    plans.push(newPlan);
    this.saveMaintenancePlans(plans);
    return newPlan;
  }

  createWorkOrder(orderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): WorkOrder {
    const orders = this.getWorkOrders();
    const newOrder: WorkOrder = {
      ...orderData,
      id: `wo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    this.saveWorkOrders(orders);
    return newOrder;
  }

  createSparePart(partData: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>): SparePart {
    const parts = this.getSpareParts();
    const newPart: SparePart = {
      ...partData,
      id: `sp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    parts.push(newPart);
    this.saveSpareParts(parts);
    return newPart;
  }

  // IoT Data methods
  private iotDataFile = path.join(DATA_DIR, 'iotData.json');

  findIoTData(filter?: { equipmentId?: string; startTime?: string; endTime?: string }): any[] {
    if (!fs.existsSync(this.iotDataFile)) return [];
    const allData = JSON.parse(fs.readFileSync(this.iotDataFile, 'utf-8'));
    if (!filter) return allData;
    
    return allData.filter((item: any) => {
      if (filter.equipmentId && item.equipmentId !== filter.equipmentId) return false;
      if (filter.startTime && item.timestamp < filter.startTime) return false;
      if (filter.endTime && item.timestamp > filter.endTime) return false;
      return true;
    });
  }

  createIoTData(data: any): any {
    const allData = this.findIoTData();
    const newData = {
      ...data,
      id: `iot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    allData.push(newData);
    fs.writeFileSync(this.iotDataFile, JSON.stringify(allData, null, 2));
    return newData;
  }

  createBlockchainRecord(recordData: any): BlockchainRecord {
    const records = this.getBlockchainRecords();
    // Map recordType from generateData format to BlockchainRecord format
    let recordType: 'equipment' | 'maintenance' | 'repair' | 'health' = 'equipment';
    if (recordData.recordType === 'equipment_registration') {
      recordType = 'equipment';
    } else if (recordData.recordType === 'maintenance_record') {
      recordType = 'maintenance';
    } else if (recordData.recordType === 'repair_record') {
      recordType = 'repair';
    }
    
    const newRecord: BlockchainRecord = {
      recordType,
      recordId: recordData.equipmentId || recordData.orderId || `record-${Date.now()}`,
      id: `bc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      txHash: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataHash: `hash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    this.saveBlockchainRecords(records);
    return newRecord;
  }

  findAllWorkOrders(filter?: { status?: string }): WorkOrder[] {
    const orders = this.getWorkOrders();
    if (!filter) return orders;
    if (filter.status) {
      return orders.filter(o => o.status === filter.status);
    }
    return orders;
  }
}

export default new FileStorage();