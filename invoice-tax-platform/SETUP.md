# 发票单据防伪与税务协同平台 - 安装指南

## 项目概述

基于区块链的发票防伪验证与税务协同管理系统，实现发票采集、OCR识别、真伪验证、三单匹配、费用报销、销售开票等全流程管理。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **存储**: JSON文件存储（演示用）

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

或者使用根目录的快捷命令：

```bash
npm run install:all
```

### 2. 生成模拟数据

```bash
cd backend
npm run generate-data
```

这将生成以下模拟数据：
- 50个用户（包括1个管理员账号：admin@example.com / admin123）
- 30家企业
- 500张发票
- 200个采购订单
- 150个入库单
- 300个报销申请
- 200个销售发票

### 3. 启动开发服务器

**终端1 - 启动后端（端口3026）:**
```bash
cd backend
npm run dev
```

**终端2 - 启动前端（端口3006）:**
```bash
cd frontend
npm run dev
```

### 4. 访问应用

- 前端地址: http://localhost:3006
- 后端API: http://localhost:3026

### 5. 测试账号

- **管理员**: admin@example.com / 密码：admin123
- **普通用户**: user1@example.com / 密码：123456

## 功能模块

### 1. 发票管理
- 发票上传（支持OCR识别）
- 发票真伪验证（模拟税务查验接口）
- 发票列表查询和筛选
- 发票详情查看
- 区块链存证

### 2. 三单匹配
- 采购订单、入库单、发票自动匹配
- 匹配规则验证（供应商、金额、日期、明细）
- 匹配结果展示

### 3. 费用报销
- 报销申请创建
- 审批流程管理
- 发票重复检查
- 预算检查（模拟）

### 4. 销售开票
- 销售发票开具
- 发票记录管理
- 区块链存证

### 5. 仪表盘
- 数据统计卡片
- 趋势分析图表
- 状态分布饼图

## 项目结构

```
invoice-tax-platform/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── storage/      # 文件存储
│   │   ├── middleware/   # 中间件
│   │   ├── utils/        # 工具函数
│   │   ├── types/        # 类型定义
│   │   └── scripts/      # 数据生成脚本
│   └── data/            # 数据文件（storage.json）
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 通用组件
│   │   ├── api/         # API调用
│   │   └── store/       # 状态管理
└── README.md
```

## API端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/profile` - 获取用户信息

### 发票
- `POST /api/invoices/upload` - 上传发票
- `GET /api/invoices` - 获取发票列表
- `GET /api/invoices/:id` - 获取发票详情
- `POST /api/invoices/:id/verify` - 验证发票

### OCR
- `POST /api/ocr/recognize` - OCR识别

### 订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `GET /api/orders/receipts` - 获取入库单列表

### 三单匹配
- `POST /api/matches/three-way` - 执行三单匹配
- `GET /api/matches` - 获取匹配记录

### 报销
- `POST /api/reimbursements` - 创建报销
- `GET /api/reimbursements` - 获取报销列表
- `GET /api/reimbursements/:id` - 获取报销详情
- `POST /api/reimbursements/:id/approve` - 审批报销

### 销售
- `POST /api/sales/invoices` - 开具销售发票
- `GET /api/sales/invoices` - 获取销售发票列表

### 仪表盘
- `GET /api/dashboard/stats` - 获取统计数据

## 注意事项

1. **数据存储**: 本项目使用JSON文件存储，仅用于演示。生产环境应使用数据库。

2. **OCR识别**: 当前为模拟OCR识别，实际应用中需要接入真实的OCR服务（如百度AI、阿里云等）。

3. **税务查验**: 当前为模拟税务查验接口，实际应用中需要对接国家税务总局发票查验平台。

4. **区块链**: 当前为模拟区块链存证，实际应用中需要对接真实的区块链网络。

5. **端口配置**: 
   - 前端端口：3006（可在 vite.config.ts 中修改）
   - 后端端口：3026（可在 .env 文件中修改）

## 开发说明

### 添加新功能

1. 在后端 `src/controllers/` 创建控制器
2. 在 `src/routes/` 创建路由
3. 在 `src/storage/fileStorage.ts` 添加存储方法
4. 在前端 `src/api/` 创建API调用
5. 在前端 `src/pages/` 创建页面组件

### 帮助弹窗

所有重要功能都添加了帮助弹窗组件（HelpTooltip），支持hover和click两种模式。

## 故障排查

1. **端口被占用**: 修改 vite.config.ts 或 .env 文件中的端口配置

2. **数据未生成**: 确保已运行 `npm run generate-data` 命令

3. **API请求失败**: 检查后端服务是否正常启动，CORS配置是否正确

4. **页面空白**: 检查浏览器控制台错误，确保API返回数据格式正确

## 许可证

MIT

