import fileStorage from './fileStorage';
import { generateMockData } from '../utils/mockData';

export async function initializeStorage() {
  // 检查是否已有数据
  const existingUsers = fileStorage.getUsers();
  if (existingUsers.length === 0) {
    // 生成初始模拟数据
    generateMockData();
    console.log('已生成初始模拟数据');
  }
}