import crypto from 'crypto';

/**
 * 模拟区块链存证功能
 * 生成数据哈希并创建区块链记录
 */
export function createBlockchainHash(data: any): string {
  const dataString = JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * 生成模拟交易哈希
 */
export function generateTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

/**
 * 创建区块链存证记录
 */
export function createBlockchainRecord(
  recordType: 'equipment' | 'maintenance' | 'repair' | 'health',
  recordId: string,
  data: any
) {
  const dataHash = createBlockchainHash(data);
  const txHash = generateTxHash();
  const timestamp = new Date().toISOString();
  const blockNumber = Math.floor(Math.random() * 10000000) + 1000000;

  return {
    id: crypto.randomUUID(),
    txHash,
    recordType,
    recordId,
    dataHash,
    timestamp,
    blockNumber,
    createdAt: timestamp,
  };
}