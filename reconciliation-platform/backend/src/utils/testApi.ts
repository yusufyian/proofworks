import { storage } from '../storage/fileStorage';
import dayjs from 'dayjs';

async function testApi() {
  const today = dayjs().format('YYYY-MM-DD');
  console.log('测试日期:', today);
  
  const summary = await storage.getReconciliationSummary(today);
  console.log('\n统计结果:');
  console.log(JSON.stringify(summary, null, 2));
  
  // 检查业务记录
  const startOfDay = `${today}T00:00:00.000Z`;
  const endOfDay = `${today}T23:59:59.999Z`;
  const businessRecords = await storage.findBusinessRecords({
    startDate: startOfDay,
    endDate: endOfDay,
  });
  console.log('\n业务记录数:', businessRecords.length);
  
  // 检查对账记录
  const reconRecords = await storage.findReconciliationRecords({ reconDate: today });
  console.log('对账记录数:', reconRecords.length);
  console.log('已匹配:', reconRecords.filter(r => r.matchStatus === 'MATCHED').length);
  console.log('未匹配:', reconRecords.filter(r => r.matchStatus === 'UNMATCHED').length);
}

testApi().catch(console.error);



