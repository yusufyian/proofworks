import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'supply_chain_finance',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接已建立');
    
    // 延迟导入模型关联，避免循环依赖
    await import('../models/associations');
    
    // 同步模型（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('数据库模型已同步');
    }
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
}

export { sequelize };
export default sequelize;

