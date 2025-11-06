import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { initializeStorage } from './storage/init';
import authRoutes from './routes/auth';
import assetRoutes from './routes/assets';
import infringementRoutes from './routes/infringements';
import rightsProtectionRoutes from './routes/rightsProtection';
import licenseRoutes from './routes/licenses';
import deviceRoutes from './routes/devices';
import dashboardRoutes from './routes/dashboard';
import blockchainRoutes from './routes/blockchain';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3028;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3008',
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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/infringements', infringementRoutes);
app.use('/api/rights-protections', rightsProtectionRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/blockchain', blockchainRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
(async () => {
  try {
    await initializeStorage();
    logger.info('文件存储初始化成功');
    
    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`数据存储位置: ./data/`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
})();
