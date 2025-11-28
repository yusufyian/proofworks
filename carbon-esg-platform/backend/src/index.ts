import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeStorage } from './storage/init';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import inventoryRoutes from './routes/inventory';
import productRoutes from './routes/product';
import reductionRoutes from './routes/reduction';
import esgRoutes from './routes/esg';
import factorRoutes from './routes/factor';
import supplierRoutes from './routes/supplier';
import blockchainRoutes from './routes/blockchain';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3027;

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
app.use('/api/inventory', inventoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/reduction', reductionRoutes);
app.use('/api/esg', esgRoutes);
app.use('/api/factor', factorRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/blockchain', blockchainRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    await initializeStorage();
    logger.info('文件存储初始化成功');
    
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

