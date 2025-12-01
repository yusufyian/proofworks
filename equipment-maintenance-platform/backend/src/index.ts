import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { initializeStorage } from './storage/init';
import authRoutes from './routes/auth';
import equipmentRoutes from './routes/equipment';
import maintenanceRoutes from './routes/maintenance';
import workOrderRoutes from './routes/workOrders';
import sparePartRoutes from './routes/spareParts';
import blockchainRoutes from './routes/blockchain';
import healthRoutes from './routes/health';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3029;

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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/health', healthRoutes);

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