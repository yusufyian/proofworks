import { Router } from 'express';
import * as productController from '../controllers/productController';
import * as batchController from '../controllers/batchController';
import * as traceController from '../controllers/traceController';
import * as recallController from '../controllers/recallController';
import * as dashboardController from '../controllers/dashboardController';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

// 仪表盘
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// 产品管理
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', productController.createProduct);

// 批次管理
router.get('/batches', batchController.getBatches);
router.get('/batches/:id', batchController.getBatch);
router.get('/batches/statistics/overview', batchController.getBatchStatistics);

// 追溯查询
router.get('/trace/code/:traceCode', traceController.traceByCode);
router.get('/trace/batch/:batchId', traceController.traceByBatch);
router.get('/trace/samples', traceController.getSampleTraceCodes);

// 召回管理
router.get('/recalls', recallController.getRecalls);
router.get('/recalls/:id', recallController.getRecall);

// 数据分析
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/trends', analyticsController.getTrends);
router.get('/analytics/quality', analyticsController.getQualityAnalysis);
router.get('/analytics/logistics', analyticsController.getLogisticsAnalysis);
router.get('/analytics/temperature', analyticsController.getTemperatureAnalysis);
router.get('/analytics/heatmap', analyticsController.getHeatmap);

export default router;

