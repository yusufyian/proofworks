import express from 'express';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as dashboardController from '../controllers/dashboardController';
import * as batchController from '../controllers/batchController';
import * as temperatureController from '../controllers/temperatureController';
import * as alertController from '../controllers/alertController';
import * as transportController from '../controllers/transportController';
import * as deviceController from '../controllers/deviceController';

const router = express.Router();

// 认证路由
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.getMe);

// 仪表盘
router.get('/dashboard/stats', authenticate, dashboardController.getDashboardStats);

// 批次管理
router.get('/batches', authenticate, batchController.getBatches);
router.get('/batches/:id', authenticate, batchController.getBatch);
router.post('/batches', authenticate, batchController.createBatch);
router.put('/batches/:id', authenticate, batchController.updateBatch);

// 温控数据
router.get('/temperature', authenticate, temperatureController.getTemperatureData);
router.post('/temperature', authenticate, temperatureController.createTemperatureData);

// 告警管理
router.get('/alerts', authenticate, alertController.getAlerts);
router.get('/alerts/:id', authenticate, alertController.getAlert);
router.put('/alerts/:id', authenticate, alertController.updateAlert);

// 运输管理
router.get('/transports', authenticate, transportController.getTransports);
router.get('/transports/:id', authenticate, transportController.getTransport);
router.post('/transports', authenticate, transportController.createTransport);
router.put('/transports/:id', authenticate, transportController.updateTransport);

// 设备管理
router.get('/devices', authenticate, deviceController.getDevices);
router.get('/devices/:id', authenticate, deviceController.getDevice);
router.put('/devices/:id', authenticate, deviceController.updateDevice);

export default router;
