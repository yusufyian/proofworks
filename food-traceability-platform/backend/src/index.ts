import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import { seedDatabase } from './utils/seed';
import { DailyDataGenerator } from './utils/dailyDataGenerator';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

const app = express();
const PORT = process.env.PORT || 3022;

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
      
      // 统计每个追溯码的事件数（只检查前1000个事件，避免内存问题）
      const sampleSize = Math.min(1000, events.length);
      const traceCodeCounts: Record<string, number> = {};
      for (let i = 0; i < sampleSize; i++) {
        const e = events[i];
        traceCodeCounts[e.traceCode] = (traceCodeCounts[e.traceCode] || 0) + 1;
      }
      
      const avgEvents = Object.keys(traceCodeCounts).length > 0 
        ? sampleSize / Object.keys(traceCodeCounts).length 
        : 0;
      
      // 如果事件数据量很大（超过10万），或者平均每个追溯码的事件数少于15个，才重新生成
      // 但如果事件总数已经很大，说明数据已经足够，不需要重新生成
      if (events.length < 100000 && avgEvents < 15 && batches.length > 0) {
        console.log(`检测到事件数据不足（平均每个追溯码 ${avgEvents.toFixed(1)} 个事件，总数 ${events.length}），开始重新生成事件数据...`);
        needRegenerateEvents = true;
      } else if (events.length >= 100000) {
        console.log(`事件数据量充足（${events.length} 个事件），跳过重新生成`);
        needRegenerateEvents = false;
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
      if (batches.length > 0 && batches.length < 1000) {
        // 只对少量批次重新生成，避免数据量过大
        console.log(`为 ${batches.length} 个批次重新生成事件数据...`);
        const events = DataGenerator.generateEvents(batches, 18);
        FileStorage.saveEvents(events);
        console.log(`✅ 成功生成 ${events.length} 个事件（每个追溯码18个节点，去重后保留核心流程）`);
      } else if (batches.length >= 1000) {
        console.log(`批次数量过多（${batches.length} 个），跳过重新生成事件数据以避免内存问题`);
        console.log(`如果确实需要重新生成，请使用历史数据生成脚本`);
      }
    } catch (error: any) {
      console.error('重新生成事件数据失败:', error.message);
      console.error('提示：如果数据量过大，请使用历史数据生成脚本分批处理');
    }
  }
}

app.listen(PORT, () => {
  console.log(`🚀 后端服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 API文档: http://localhost:${PORT}/api`);
  
  // 启动时检查并生成今日数据
  setTimeout(() => {
    try {
      if (DailyDataGenerator.shouldGenerateTodayData()) {
        console.log(`\n📅 检测到今日（${format(new Date(), 'yyyy-MM-dd')}）数据不足，开始生成...`);
        DailyDataGenerator.generateTodayData();
      } else {
        console.log(`\n✅ 今日数据已存在，跳过生成`);
      }
    } catch (error: any) {
      console.error('生成今日数据失败:', error.message);
    }
  }, 2000); // 延迟2秒，确保数据初始化完成
  
  // 设置定时任务：每天凌晨2点检查并生成当日数据
  const scheduleDailyData = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 明天凌晨2点
    
    const msUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      try {
        console.log(`\n📅 定时任务：开始生成今日（${format(new Date(), 'yyyy-MM-dd')}）数据...`);
        DailyDataGenerator.generateTodayData();
      } catch (error: any) {
        console.error('定时生成今日数据失败:', error.message);
      }
      
      // 设置每天执行一次
      setInterval(() => {
        try {
          console.log(`\n📅 定时任务：开始生成今日（${format(new Date(), 'yyyy-MM-dd')}）数据...`);
          DailyDataGenerator.generateTodayData();
        } catch (error: any) {
          console.error('定时生成今日数据失败:', error.message);
        }
      }, 24 * 60 * 60 * 1000); // 24小时
    }, msUntilTomorrow);
  };
  
  scheduleDailyData();
  console.log('⏰ 已设置每日自动生成数据任务（每天凌晨2点执行）');
});

