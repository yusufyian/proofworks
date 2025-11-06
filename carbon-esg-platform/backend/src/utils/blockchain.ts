import crypto from 'crypto';

/**
 * 生成区块链交易哈希（模拟区块链存证）
 * 实际应用中应该调用真实的区块链API
 */
export function generateBlockchainHash(data: any): string {
  // 将数据序列化为JSON字符串
  const dataString = JSON.stringify(data);
  
  // 生成SHA256哈希
  const hash = crypto.createHash('sha256').update(dataString).digest('hex');
  
  // 添加时间戳和随机数确保唯一性
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  
  // 返回格式：0x + hash前缀 + timestamp + random
  return `0x${hash.substring(0, 16)}${timestamp.toString(16)}${random}`;
}

/**
 * 生成区块高度（模拟）
 */
export function generateBlockHeight(): number {
  // 模拟区块高度，从10000000开始
  const baseHeight = 10000000;
  const offset = Math.floor(Math.random() * 100000);
  return baseHeight + offset;
}

/**
 * 生成交易哈希
 */
export function generateTransactionHash(): string {
  const random = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(16);
  return `0x${random}${timestamp}`;
}

/**
 * 模拟区块链存证
 */
export function mockBlockchainCertify(data: any): {
  hash: string;
  transactionHash: string;
  blockHeight: number;
  blockTime: string;
} {
  const hash = generateBlockchainHash(data);
  const transactionHash = generateTransactionHash();
  const blockHeight = generateBlockHeight();
  const blockTime = new Date().toISOString();

  return {
    hash,
    transactionHash,
    blockHeight,
    blockTime,
  };
}
