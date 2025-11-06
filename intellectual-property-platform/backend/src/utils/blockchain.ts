import crypto from 'crypto';

/**
 * 生成区块链交易哈希（模拟）
 */
export function generateTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

/**
 * 生成文件哈希（SHA256）
 */
export function calculateFileHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 生成区块高度（模拟）
 */
export function generateBlockHeight(): number {
  // 模拟一个递增的区块高度
  const baseHeight = 1500000;
  return baseHeight + Math.floor(Math.random() * 100000);
}

/**
 * 生成证据哈希
 */
export function generateEvidenceHash(evidence: any): string {
  const content = JSON.stringify(evidence);
  return '0x' + crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 验证哈希
 */
export function verifyHash(content: string, hash: string): boolean {
  const calculatedHash = crypto.createHash('sha256').update(content).digest('hex');
  return calculatedHash === hash.replace('0x', '');
}

/**
 * 获取区块链信息
 */
export function getBlockchainInfo() {
  return {
    chain: 'Hyperledger Fabric',
    node: 'ip-registry-node1.example.com',
    networkStatus: 'healthy',
    lastBlockHeight: generateBlockHeight(),
  };
}

/**
 * 生成证书ID
 */
export function generateCertificateId(): string {
  const num = Math.floor(Math.random() * 999999) + 1;
  return `CERT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(num).padStart(6, '0')}`;
}
