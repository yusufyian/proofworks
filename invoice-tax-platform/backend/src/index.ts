import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoices';
import orderRoutes from './routes/orders';
import reimbursementRoutes from './routes/reimbursements';
import salesRoutes from './routes/sales';
import dashboardRoutes from './routes/dashboard';
import ocrRoutes from './routes/ocr';
import matchRoutes from './routes/matches';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3026;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.ftmoon.com',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reimbursements', reimbursementRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/matches', matchRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info(`发票税务平台后端服务运行在端口 ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`数据存储位置: ./data/storage.json`);
});

