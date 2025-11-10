import * as fs from 'fs';
import * as path from 'path';
import { Product, Batch, TransferEvent, IoTData, Recall } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BATCHES_FILE = path.join(DATA_DIR, 'batches.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const IOT_DATA_FILE = path.join(DATA_DIR, 'iot-data.json');
const RECALLS_FILE = path.join(DATA_DIR, 'recalls.json');

// 内存缓存
let cache: {
  products?: Product[];
  batches?: Batch[];
  events?: TransferEvent[];
  iotData?: IoTData[];
  recalls?: Recall[];
  productsTimestamp?: number;
  batchesTimestamp?: number;
  eventsTimestamp?: number;
  iotDataTimestamp?: number;
  recallsTimestamp?: number;
} = {};

const CACHE_TTL = 60000; // 缓存60秒

// 获取文件修改时间
function getFileMtime(filePath: string): number {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

// 读取JSON文件（带缓存）
function readJsonFile<T>(filePath: string, defaultValue: T[], cacheKey: keyof typeof cache): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const mtime = getFileMtime(filePath);
      const cacheTimestampKey = `${cacheKey}Timestamp` as keyof typeof cache;
      const cachedTimestamp = cache[cacheTimestampKey] as number | undefined;
      
      // 如果缓存存在且文件未修改，直接返回缓存
      if (cache[cacheKey] && cachedTimestamp && mtime <= cachedTimestamp + CACHE_TTL) {
        return cache[cacheKey] as T[];
      }
      
      // 读取文件
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // 更新缓存
      cache[cacheKey] = data;
      (cache as any)[cacheTimestampKey] = Date.now();
      
      return data;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

// 写入JSON文件（清除相关缓存）
function writeJsonFile<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    // 清除相关缓存
    if (filePath === PRODUCTS_FILE) {
      delete cache.products;
      delete cache.productsTimestamp;
    } else if (filePath === BATCHES_FILE) {
      delete cache.batches;
      delete cache.batchesTimestamp;
    } else if (filePath === EVENTS_FILE) {
      delete cache.events;
      delete cache.eventsTimestamp;
    } else if (filePath === IOT_DATA_FILE) {
      delete cache.iotData;
      delete cache.iotDataTimestamp;
    } else if (filePath === RECALLS_FILE) {
      delete cache.recalls;
      delete cache.recallsTimestamp;
    }
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

export class FileStorage {
  // 产品管理
  static getProducts(): Product[] {
    return readJsonFile<Product>(PRODUCTS_FILE, [], 'products');
  }

  static getProduct(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  static saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    writeJsonFile(PRODUCTS_FILE, products);
  }

  static saveProducts(products: Product[]): void {
    writeJsonFile(PRODUCTS_FILE, products);
  }

  // 批次管理
  static getBatches(): Batch[] {
    return readJsonFile<Batch>(BATCHES_FILE, [], 'batches');
  }

  static getBatch(id: string): Batch | undefined {
    return this.getBatches().find(b => b.id === id);
  }

  static getBatchByTraceCode(traceCode: string): Batch | undefined {
    const batches = this.getBatches();
    return batches.find(b => traceCode.startsWith(b.traceCodePrefix));
  }

  static saveBatch(batch: Batch): void {
    const batches = this.getBatches();
    const index = batches.findIndex(b => b.id === batch.id);
    if (index >= 0) {
      batches[index] = batch;
    } else {
      batches.push(batch);
    }
    writeJsonFile(BATCHES_FILE, batches);
  }

  static saveBatches(batches: Batch[]): void {
    writeJsonFile(BATCHES_FILE, batches);
  }

  // 流转事件
  static getEvents(): TransferEvent[] {
    return readJsonFile<TransferEvent>(EVENTS_FILE, [], 'events');
  }

  static getEventsByTraceCode(traceCode: string): TransferEvent[] {
    return this.getEvents().filter(e => e.traceCode === traceCode);
  }

  static getEventsByBatchId(batchId: string): TransferEvent[] {
    return this.getEvents().filter(e => e.batchId === batchId);
  }

  static saveEvent(event: TransferEvent): void {
    const events = this.getEvents();
    events.push(event);
    writeJsonFile(EVENTS_FILE, events);
  }

  static saveEvents(events: TransferEvent[]): void {
    writeJsonFile(EVENTS_FILE, events);
  }

  // IoT数据
  static getIoTData(): IoTData[] {
    return readJsonFile<IoTData>(IOT_DATA_FILE, [], 'iotData');
  }

  static getIoTDataByTraceCode(traceCode: string): IoTData[] {
    return this.getIoTData().filter(d => d.traceCode === traceCode);
  }

  static getIoTDataByBatchId(batchId: string): IoTData[] {
    return this.getIoTData().filter(d => d.batchId === batchId);
  }

  static saveIoTData(data: IoTData): void {
    const allData = this.getIoTData();
    allData.push(data);
    writeJsonFile(IOT_DATA_FILE, allData);
  }

  static saveIoTDataArray(data: IoTData[]): void {
    const allData = this.getIoTData();
    allData.push(...data);
    writeJsonFile(IOT_DATA_FILE, allData);
  }

  // 召回记录
  static getRecalls(): Recall[] {
    return readJsonFile<Recall>(RECALLS_FILE, [], 'recalls');
  }

  static getRecall(id: string): Recall | undefined {
    return this.getRecalls().find(r => r.id === id);
  }

  static saveRecall(recall: Recall): void {
    const recalls = this.getRecalls();
    const index = recalls.findIndex(r => r.id === recall.id);
    if (index >= 0) {
      recalls[index] = recall;
    } else {
      recalls.push(recall);
    }
    writeJsonFile(RECALLS_FILE, recalls);
  }

  static saveRecalls(recalls: Recall[]): void {
    writeJsonFile(RECALLS_FILE, recalls);
  }
}
