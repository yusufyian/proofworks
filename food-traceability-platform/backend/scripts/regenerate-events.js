// 重新生成事件数据的脚本
const fs = require('fs');
const path = require('path');

// 读取批次数据
const batchesFile = path.join(__dirname, '../data/batches.json');
const eventsFile = path.join(__dirname, '../data/events.json');

if (!fs.existsSync(batchesFile)) {
  console.error('批次数据文件不存在，请先运行后端服务器生成数据');
  process.exit(1);
}

const batches = JSON.parse(fs.readFileSync(batchesFile, 'utf8'));
console.log(`找到 ${batches.length} 个批次`);

// 导入数据生成器（需要先编译）
try {
  // 尝试使用编译后的文件
  const { DataGenerator } = require('../dist/utils/dataGenerator');
  const { FileStorage } = require('../dist/storage/fileStorage');
  
  console.log('开始重新生成事件数据...');
  const events = DataGenerator.generateEvents(batches, 35);
  FileStorage.saveEvents(events);
  
  console.log(`✅ 成功生成 ${events.length} 个事件`);
  console.log(`每个追溯码平均 ${(events.length / (batches.length * 5)).toFixed(2)} 个事件`);
  
  // 验证数据
  const sampleCode = batches[0]?.traceCodePrefix + '001' + ((parseInt(batches[0]?.traceCodePrefix.slice(-1)) + 1) % 10);
  const sampleEvents = events.filter(e => e.traceCode === sampleCode);
  console.log(`示例追溯码 ${sampleCode} 有 ${sampleEvents.length} 个事件`);
  
} catch (error) {
  console.error('错误:', error.message);
  console.log('\n请先编译TypeScript代码: npm run build');
  process.exit(1);
}






