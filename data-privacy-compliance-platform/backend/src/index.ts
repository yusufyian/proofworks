import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { readStorage } from './storage/fileStorage';
import authRoutes from './routes/auth';
import dataAssetRoutes from './routes/dataAssets';
import authorizationRoutes from './routes/authorizations';
import computingTaskRoutes from './routes/computingTasks';
import auditRoutes from './routes/audit';
import dashboardRoutes from './routes/dashboard';
import blockchainRoutes from './routes/blockchain';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3025;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.ftmoon.com',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/data-assets', dataAssetRoutes);
app.use('/api/authorizations', authorizationRoutes);
app.use('/api/computing-tasks', computingTaskRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/blockchain', blockchainRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 初始化存储（如果不存在会自动创建）
    const storage = readStorage();
    logger.info('文件存储初始化成功');
    logger.info(`数据统计: ${storage.users.length}用户, ${storage.dataAssets.length}资产, ${storage.authorizations.length}授权`);
    
    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`数据存储位置: ./data/storage.json`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

