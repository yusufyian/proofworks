import crypto from 'crypto';

// 生成发票指纹
export function generateInvoiceFingerprint(
  invoiceCode: string,
  invoiceNo: string,
  amount: number,
  date: string
): string {
  const data = `${invoiceCode}${invoiceNo}${amount}${date}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// 生成区块链交易哈希（模拟）
export function generateBlockchainTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

