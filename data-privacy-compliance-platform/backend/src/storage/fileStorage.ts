import fs from 'fs';
import path from 'path';
import { User, DataAsset, Authorization, ComputingTask, AuditRecord, BlockchainRecord } from '../types';

interface Storage {
  users: User[];
  dataAssets: DataAsset[];
  authorizations: Authorization[];
  computingTasks: ComputingTask[];
  auditRecords: AuditRecord[];
  blockchainRecords: BlockchainRecord[];
}

const DATA_FILE = path.join(__dirname, '../../data/storage.json');

// 确保数据目录存在
const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取存储数据
export const readStorage = (): Storage => {
  ensureDataDir();
  
  if (!fs.existsSync(DATA_FILE)) {
    const defaultStorage: Storage = {
      users: [],
      dataAssets: [],
      authorizations: [],
      computingTasks: [],
      auditRecords: [],
      blockchainRecords: [],
    };
    writeStorage(defaultStorage);
    return defaultStorage;
  }

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取存储文件失败:', error);
    const defaultStorage: Storage = {
      users: [],
      dataAssets: [],
      authorizations: [],
      computingTasks: [],
      auditRecords: [],
      blockchainRecords: [],
    };
    writeStorage(defaultStorage);
    return defaultStorage;
  }
};

// 写入存储数据
export const writeStorage = (data: Storage): void => {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('写入存储文件失败:', error);
    throw error;
  }
};

// 获取存储实例（每次读取最新数据）
export const getStorage = (): Storage => {
  return readStorage();
};

// 更新存储
export const updateStorage = (updater: (storage: Storage) => Storage): void => {
  const storage = readStorage();
  const updated = updater(storage);
  writeStorage(updated);
};

