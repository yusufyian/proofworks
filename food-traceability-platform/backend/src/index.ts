import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import { seedDatabase } from './utils/seed';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 初始化数据（如果数据文件不存在或事件数据不足）
const dataDir = path.join(__dirname, '../data');
const productsFile = path.join(dataDir, 'products.json');
const eventsFile = path.join(dataDir, 'events.json');
const batchesFile = path.join(dataDir, 'batches.json');

let needRegenerateEvents = false;

if (!fs.existsSync(dataDir) || !fs.existsSync(productsFile)) {
  console.log('检测到数据目录为空，开始生成模拟数据...');
  seedDatabase();
} else {
  // 检查事件数据是否充足（每个追溯码应该有35个事件）
  if (!fs.existsSync(eventsFile)) {
    console.log('检测到事件数据文件不存在，开始重新生成事件数据...');
    needRegenerateEvents = true;
  } else {
    try {
      const events = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
      const batches = fs.existsSync(batchesFile) ? JSON.parse(fs.readFileSync(batchesFile, 'utf8')) : [];
      
      // 统计每个追溯码的事件数
      const traceCodeCounts: Record<string, number> = {};
      events.forEach((e: any) => {
        traceCodeCounts[e.traceCode] = (traceCodeCounts[e.traceCode] || 0) + 1;
      });
      
      const avgEvents = Object.keys(traceCodeCounts).length > 0 
        ? events.length / Object.keys(traceCodeCounts).length 
        : 0;
      
      // 如果平均每个追溯码的事件数少于20个，重新生成
      if (avgEvents < 20 && batches.length > 0) {
        console.log(`检测到事件数据不足（平均每个追溯码 ${avgEvents.toFixed(1)} 个事件），开始重新生成事件数据...`);
        needRegenerateEvents = true;
      }
    } catch (error) {
      console.log('读取事件数据文件出错，开始重新生成...');
      needRegenerateEvents = true;
    }
  }
  
  if (needRegenerateEvents) {
    const { DataGenerator } = require('./utils/dataGenerator');
    const { FileStorage } = require('./storage/fileStorage');
    
    try {
      const batches = FileStorage.getBatches();
      if (batches.length > 0) {
        console.log(`为 ${batches.length} 个批次重新生成事件数据...`);
        const events = DataGenerator.generateEvents(batches, 18);
        FileStorage.saveEvents(events);
        console.log(`✅ 成功生成 ${events.length} 个事件（每个追溯码18个节点，去重后保留核心流程）`);
      }
    } catch (error: any) {
      console.error('重新生成事件数据失败:', error.message);
    }
  }
}

app.listen(PORT, () => {
  console.log(`🚀 后端服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 API文档: http://localhost:${PORT}/api`);
});

