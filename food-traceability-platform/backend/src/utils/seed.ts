import { FileStorage } from '../storage/fileStorage';
import { DataGenerator } from './dataGenerator';

export function seedDatabase() {
  console.log('开始生成模拟数据...');
  
  // 生成产品
  console.log('生成产品数据...');
  const products = DataGenerator.generateProducts(100);
  FileStorage.saveProducts(products);
  console.log(`已生成 ${products.length} 个产品`);
  
  // 生成批次
  console.log('生成批次数据...');
  const batches = DataGenerator.generateBatches(products, 5);
  FileStorage.saveBatches(batches);
  console.log(`已生成 ${batches.length} 个批次`);
  
  // 生成流转事件（每个追溯码生成完整的事件链，18个节点，去重后保留核心流程）
  console.log('生成流转事件...');
  const events = DataGenerator.generateEvents(batches, 18);
  FileStorage.saveEvents(events);
  console.log(`已生成 ${events.length} 个流转事件（每个追溯码包含18个流转节点，去重后覆盖从种植到销售的核心流程）`);
  
  // 生成IoT数据
  console.log('生成IoT传感器数据...');
  const iotData = DataGenerator.generateIoTData(batches, 50);
  FileStorage.saveIoTDataArray(iotData);
  console.log(`已生成 ${iotData.length} 条IoT数据`);
  
  // 生成召回记录
  console.log('生成召回记录...');
  const recalls = DataGenerator.generateRecalls(batches, 0.05);
  FileStorage.saveRecalls(recalls);
  console.log(`已生成 ${recalls.length} 条召回记录`);
  
  console.log('模拟数据生成完成！');
}

// 如果直接运行此文件，执行数据生成
if (require.main === module) {
  seedDatabase();
}

