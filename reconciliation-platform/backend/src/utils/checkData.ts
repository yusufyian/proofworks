import fs from 'fs';
import path from 'path';
import { storage } from '../storage/fileStorage';

async function checkData() {
  const dataDir = path.join(process.cwd(), 'data');
  const dataFile = path.join(dataDir, 'storage.json');

  console.log('检查数据文件...');
  console.log(`数据文件路径: ${dataFile}`);

  if (!fs.existsSync(dataFile)) {
    console.log('❌ 数据文件不存在！');
    console.log('请运行: npm run seed');
    return;
  }

  const stats = fs.statSync(dataFile);
  console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

  if (stats.size === 0) {
    console.log('❌ 数据文件为空！');
    console.log('请运行: npm run seed');
    return;
  }

  try {
    const content = fs.readFileSync(dataFile, 'utf-8');
    const data = JSON.parse(content);

    console.log('\n数据统计:');
    console.log(`- 用户数: ${data.users?.length || 0}`);
    console.log(`- 业务记录: ${data.businessRecords?.length || 0}`);
    console.log(`- 支付记录: ${data.paymentRecords?.length || 0}`);
    console.log(`- 对账记录: ${data.reconciliationRecords?.length || 0}`);
    console.log(`- 差异工单: ${data.discrepancyTickets?.length || 0}`);
    console.log(`- 清分记录: ${data.settlementRecords?.length || 0}`);

    if (data.businessRecords && data.businessRecords.length > 0) {
      const firstRecord = data.businessRecords[0];
      console.log(`\n示例业务记录:`);
      console.log(`- 订单号: ${firstRecord.orderId}`);
      console.log(`- 金额: ¥${firstRecord.amount}`);
      console.log(`- 时间: ${firstRecord.businessTime}`);
    }

    // 检查今天的统计数据
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n检查今日(${today})数据...`);
    const summary = await storage.getReconciliationSummary(today);
    console.log(`- 今日交易笔数: ${summary.totalTransactions}`);
    console.log(`- 今日对平笔数: ${summary.matchedCount}`);
    console.log(`- 今日总金额: ¥${summary.totalAmount.toFixed(2)}`);

    if (summary.totalTransactions === 0) {
      console.log('\n⚠️  警告: 今日没有数据！');
      console.log('这可能是因为数据是之前生成的，建议重新运行 seed 脚本生成最新数据。');
    } else {
      console.log('\n✅ 数据正常！');
    }
  } catch (error: any) {
    console.log('❌ 读取数据文件失败:', error.message);
  }
}

checkData().catch(console.error);



