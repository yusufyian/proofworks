import { HistoricalDataGenerator } from '../utils/historicalDataGenerator';
import { FileStorage } from '../storage/fileStorage';
import { DataGenerator } from '../utils/dataGenerator';

/**
 * 生成历史数据脚本
 * 从2024年6月1日开始生成历史数据
 */
async function main() {
  try {
    console.log('========================================');
    console.log('开始生成历史模拟数据');
    console.log('========================================\n');
    
    // 检查产品数据是否存在
    let products = FileStorage.getProducts();
    if (products.length === 0) {
      console.log('产品数据不存在，先生成产品数据...');
      products = DataGenerator.generateProducts(100);
      FileStorage.saveProducts(products);
      console.log(`✅ 已生成 ${products.length} 个产品\n`);
    } else {
      console.log(`✅ 已存在 ${products.length} 个产品\n`);
    }
    
    // 生成历史数据（从2024年6月1日开始）
    const startDate = new Date(2024, 5, 1); // 6月1日（月份从0开始）
    const historicalData = HistoricalDataGenerator.generateHistoricalData(startDate);
    
    // 保存历史数据
    console.log('\n保存历史数据到文件...');
    HistoricalDataGenerator.saveHistoricalData(historicalData);
    
    console.log('\n========================================');
    console.log('历史数据生成完成！');
    console.log(`- 批次数量: ${historicalData.batches.length}`);
    console.log(`- 事件数量: ${historicalData.events.length}`);
    console.log(`- IoT数据点: ${historicalData.iotData.length}`);
    console.log('========================================');
    
  } catch (error: any) {
    console.error('生成历史数据失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

