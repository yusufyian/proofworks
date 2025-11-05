import bcrypt from 'bcryptjs';
import { writeStorage, readStorage } from '../storage/fileStorage';
import {
  generateUsers,
  generateDataAssets,
  generateAuthorizations,
  generateComputingTasks,
  generateAuditRecords,
  generateBlockchainRecords,
} from './dataGenerator';

async function seed() {
  console.log('开始生成种子数据...');
  
  // 读取现有存储
  const storage = readStorage();
  
  // 生成用户（100个）
  console.log('生成用户数据...');
  const users = generateUsers(100);
  
  // 加密密码
  const hashedPassword = await bcrypt.hash('password123', 10);
  for (const user of users) {
    user.password = hashedPassword;
  }
  
  // 生成数据资产（500个）
  console.log('生成数据资产...');
  const dataAssets = generateDataAssets(users, 500);
  
  // 生成授权记录（1000个）
  console.log('生成授权记录...');
  const authorizations = generateAuthorizations(users, dataAssets, 1000);
  
  // 生成计算任务（800个）
  console.log('生成计算任务...');
  const computingTasks = generateComputingTasks(users, authorizations, 800);
  
  // 生成审计记录（5000个）
  console.log('生成审计记录...');
  const auditRecords = generateAuditRecords(users, authorizations, computingTasks, 5000);
  
  // 生成区块链记录（500个）
  console.log('生成区块链记录...');
  const blockchainRecords = generateBlockchainRecords(authorizations, computingTasks, 500);
  
  // 写入存储
  storage.users = users;
  storage.dataAssets = dataAssets;
  storage.authorizations = authorizations;
  storage.computingTasks = computingTasks;
  storage.auditRecords = auditRecords;
  storage.blockchainRecords = blockchainRecords;
  
  writeStorage(storage);
  
  console.log('种子数据生成完成！');
  console.log(`- 用户: ${users.length}个`);
  console.log(`- 数据资产: ${dataAssets.length}个`);
  console.log(`- 授权记录: ${authorizations.length}个`);
  console.log(`- 计算任务: ${computingTasks.length}个`);
  console.log(`- 审计记录: ${auditRecords.length}个`);
  console.log(`- 区块链记录: ${blockchainRecords.length}个`);
}

// 如果直接运行此文件
if (require.main === module) {
  seed().catch(console.error);
}

export default seed;

