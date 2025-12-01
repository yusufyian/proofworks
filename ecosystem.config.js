module.exports = {
  apps: [
    {
      name: 'carbon-esg-backend',
      script: './carbon-esg-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3027,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/carbon-esg-error.log',
      out_file: './logs/carbon-esg-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'cold-chain-medical-backend',
      script: './cold-chain-medical-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3023,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/cold-chain-medical-error.log',
      out_file: './logs/cold-chain-medical-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'cross-border-compliance-backend',
      script: './cross-border-compliance-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3030,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/cross-border-compliance-error.log',
      out_file: './logs/cross-border-compliance-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'data-privacy-compliance-backend',
      script: './data-privacy-compliance-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3025,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/data-privacy-compliance-error.log',
      out_file: './logs/data-privacy-compliance-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'equipment-maintenance-backend',
      script: './equipment-maintenance-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3029,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/equipment-maintenance-error.log',
      out_file: './logs/equipment-maintenance-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'food-traceability-backend',
      script: './food-traceability-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3022,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/food-traceability-error.log',
      out_file: './logs/food-traceability-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'intellectual-property-backend',
      script: './intellectual-property-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3028,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/intellectual-property-error.log',
      out_file: './logs/intellectual-property-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'invoice-tax-backend',
      script: './invoice-tax-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3026,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/invoice-tax-error.log',
      out_file: './logs/invoice-tax-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'reconciliation-backend',
      script: './reconciliation-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3024,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/reconciliation-error.log',
      out_file: './logs/reconciliation-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'supply-chain-finance-backend',
      script: './supply-chain-finance-platform/backend/dist/index.js',
      cwd: '/home/workspace/proofworks',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3021,
        FRONTEND_URL: 'https://www.ftmoon.com'
      },
      error_file: './logs/supply-chain-finance-error.log',
      out_file: './logs/supply-chain-finance-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};


