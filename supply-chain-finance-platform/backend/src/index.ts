import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeStorage } from './storage/init';
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import certificateRoutes from './routes/certificates';
import transferRoutes from './routes/transfers';
import financingRoutes from './routes/financing';
import auditRoutes from './routes/audit';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use('/api/companies', companyRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/financing', financingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);

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

