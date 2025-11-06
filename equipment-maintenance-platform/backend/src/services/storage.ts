import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');
const STORAGE_FILE = path.join(DATA_DIR, 'storage.json');

interface StorageData {
  users: any[];
  equipment: any[];
  maintenancePlans: any[];
  workOrders: any[];
  spareParts: any[];
  healthRecords: any[];
  iotData: any[];
  blockchainRecords: any[];
  maintenanceHistory: any[];
}

let cache: StorageData | null = null;

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化存储文件
if (!fs.existsSync(STORAGE_FILE)) {
  const initialData: StorageData = {
    users: [],
    equipment: [],
    maintenancePlans: [],
    workOrders: [],
    spareParts: [],
    healthRecords: [],
    iotData: [],
    blockchainRecords: [],
    maintenanceHistory: [],
  };
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(initialData, null, 2));
}

export class StorageService {
  private static loadData(): StorageData {
    if (cache) {
      return cache;
    }
    
    try {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      cache = JSON.parse(data);
      return cache!;
    } catch (error) {
      console.error('Failed to load storage:', error);
      throw new Error('Failed to load storage data');
    }
  }

  private static saveData(data: StorageData): void {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
      cache = data;
    } catch (error) {
      console.error('Failed to save storage:', error);
      throw new Error('Failed to save storage data');
    }
  }

  static getData(): StorageData {
    return this.loadData();
  }

  static getCollection<T extends keyof StorageData>(collection: T): StorageData[T] {
    const data = this.loadData();
    return data[collection];
  }

  static setCollection<T extends keyof StorageData>(
    collection: T,
    value: StorageData[T]
  ): void {
    const data = this.loadData();
    data[collection] = value;
    this.saveData(data);
  }

  static addToCollection<T extends keyof StorageData>(
    collection: T,
    item: StorageData[T][number]
  ): StorageData[T][number] {
    const data = this.loadData();
    const items = [...data[collection], item];
    data[collection] = items as StorageData[T];
    this.saveData(data);
    return item;
  }

  static updateInCollection<T extends keyof StorageData>(
    collection: T,
    id: string,
    updates: Partial<StorageData[T][number]>
  ): StorageData[T][number] | null {
    const data = this.loadData();
    const index = data[collection].findIndex((item: any) => item.id === id);
    if (index === -1) {
      return null;
    }
    const updated = { ...data[collection][index], ...updates };
    const items = [...data[collection]];
    items[index] = updated;
    data[collection] = items as StorageData[T];
    this.saveData(data);
    return updated as StorageData[T][number];
  }

  static deleteFromCollection<T extends keyof StorageData>(
    collection: T,
    id: string
  ): boolean {
    const data = this.loadData();
    const index = data[collection].findIndex((item: any) => item.id === id);
    if (index === -1) {
      return false;
    }
    const items = data[collection].filter((item: any) => item.id !== id);
    data[collection] = items as StorageData[T];
    this.saveData(data);
    return true;
  }

  static findInCollection<T extends keyof StorageData>(
    collection: T,
    predicate: (item: StorageData[T][number]) => boolean
  ): StorageData[T][number] | undefined {
    const data = this.loadData();
    return data[collection].find(predicate as any);
  }

  static filterCollection<T extends keyof StorageData>(
    collection: T,
    predicate: (item: StorageData[T][number]) => boolean
  ): StorageData[T][] {
    const data = this.loadData();
    return data[collection].filter(predicate as any) as any[];
  }
}

