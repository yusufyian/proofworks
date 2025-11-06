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
}

export default new FileStorage();