import { storage } from '../storage/fileStorage';
import dayjs from 'dayjs';

async function testDashboard() {
  try {
    console.log('测试仪表盘数据...\n');
    
    const today = dayjs().format('YYYY-MM-DD');
    console.log('今天:', today);
    
    // 测试今日统计
    const todaySummary = await storage.getReconciliationSummary(today);
    console.log('\n今日统计:', JSON.stringify(todaySummary, null, 2));
    
    // 如果今天没有数据，尝试查找最近有数据的日期
    if (todaySummary.totalTransactions === 0) {
      console.log('\n今天没有数据，查找最近有数据的日期...');
      for (let i = 1; i <= 30; i++) {
        const checkDate = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        const checkSummary = await storage.getReconciliationSummary(checkDate);
        if (checkSummary.totalTransactions > 0) {
          console.log(`\n找到数据日期: ${checkDate}`);
          console.log('数据:', JSON.stringify(checkSummary, null, 2));
          break;
        }
      }
    }
    
    // 测试业务记录查询
    const today1 = dayjs().format('YYYY-MM-DD');
    const businessRecords = await storage.findBusinessRecords({
      startDate: `${today1}T00:00:00.000Z`,
      endDate: `${today1}T23:59:59.999Z`,
    });
    console.log(`\n今天(${today1})的业务记录数: ${businessRecords.length}`);
    
    if (businessRecords.length > 0) {
      console.log('第一条记录:', JSON.stringify(businessRecords[0], null, 2));
    }
    
    // 列出最近5天的数据量
    console.log('\n最近5天的数据量:');
    for (let i = 0; i < 5; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const summary = await storage.getReconciliationSummary(date);
      console.log(`${date}: ${summary.totalTransactions} 笔交易`);
    }
    
  } catch (error) {
    console.error('错误:', error);
  }
}

testDashboard();

