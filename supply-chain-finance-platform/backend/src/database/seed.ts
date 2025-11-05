import bcrypt from 'bcryptjs';
import { sequelize, initializeDatabase } from './index';
import { logger } from '../utils/logger';

const defaultPassword = '123456'; // 默认密码

async function seed() {
  try {
    // 先初始化数据库和模型关联
    await initializeDatabase();
    logger.info('数据库连接成功，开始初始化数据...');

    // 延迟导入模型，确保关联已建立
    const { User } = await import('../models/User');
    const { Company } = await import('../models/Company');

    // 创建默认公司
    const [coreCompany, supplierCompany, bankCompany] = await Promise.all([
      Company.findOrCreate({
        where: { unifiedSocialCreditCode: '91110000MA00123456' },
        defaults: {
          name: '示例核心企业有限公司',
          unifiedSocialCreditCode: '91110000MA00123456',
          type: 'core_enterprise',
          creditRating: 'AAA',
          creditLimit: 100000000,
          usedCreditLimit: 0,
          status: 'active'
        }
      }),
      Company.findOrCreate({
        where: { unifiedSocialCreditCode: '91110000MA00234567' },
        defaults: {
          name: '示例供应商有限公司',
          unifiedSocialCreditCode: '91110000MA00234567',
          type: 'supplier',
          creditRating: 'A',
          status: 'active'
        }
      }),
      Company.findOrCreate({
        where: { unifiedSocialCreditCode: '91110000MA00345678' },
        defaults: {
          name: '示例银行股份有限公司',
          unifiedSocialCreditCode: '91110000MA00345678',
          type: 'bank',
          creditRating: 'AAA',
          status: 'active'
        }
      })
    ]);

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 创建默认用户
    const users = [
      {
        email: 'admin@example.com',
        password: hashedPassword,
        companyId: coreCompany[0].id,
        role: 'core_enterprise' as const,
        name: '管理员',
        phone: '13800138000',
        status: 'active' as const
      },
      {
        email: 'supplier@example.com',
        password: hashedPassword,
        companyId: supplierCompany[0].id,
        role: 'supplier' as const,
        name: '供应商用户',
        phone: '13800138001',
        status: 'active' as const
      },
      {
        email: 'bank@example.com',
        password: hashedPassword,
        companyId: bankCompany[0].id,
        role: 'bank' as const,
        name: '银行用户',
        phone: '13800138002',
        status: 'active' as const
      }
    ];

    for (const userData of users) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });

      if (created) {
        logger.info(`创建用户: ${userData.email} (${userData.role})`);
      } else {
        // 更新密码（如果用户已存在）
        user.password = hashedPassword;
        await user.save();
        logger.info(`更新用户密码: ${userData.email}`);
      }
    }

    logger.info('数据库初始化完成！');
    logger.info('默认账号信息：');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('核心企业账号：');
    logger.info('  邮箱: admin@example.com');
    logger.info('  密码: 123456');
    logger.info('');
    logger.info('供应商账号：');
    logger.info('  邮箱: supplier@example.com');
    logger.info('  密码: 123456');
    logger.info('');
    logger.info('银行账号：');
    logger.info('  邮箱: bank@example.com');
    logger.info('  密码: 123456');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    logger.error('数据库初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
}

export default seed;

