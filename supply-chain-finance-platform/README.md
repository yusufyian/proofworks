# 供应链金融与数字凭证平台

基于区块链技术的供应链金融与数字凭证可信流转平台，实现应收账款、预付账款、票据等凭证的数字化管理和融资服务。

## 项目概述

本项目是一个完整的供应链金融平台，包含前端和后端两个部分：

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + TypeScript + PostgreSQL

## 核心功能

### 1. 凭证管理
- 凭证签发（核心企业）
- 凭证查询与详情查看
- 凭证状态管理（持有中、已转让、已质押、已核销、已拆分）
- 凭证真伪核验

### 2. 凭证流转
- 凭证转让（全额/拆分）
- 转让历史追溯
- 转让状态跟踪

### 3. 融资服务
- 融资申请（供应商）
- 融资审批（银行）
- 风控评分与评级
- 放款管理

### 4. 数据分析
- 仪表盘统计
- 多维度数据展示
- 实时业务指标

## 技术栈

### 后端
- **框架**: Express.js
- **语言**: TypeScript
- **存储**: 文件存储（JSON文件，用于演示）
- **认证**: JWT
- **日志**: Winston

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **UI**: Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: React Query
- **路由**: React Router v6
- **图标**: Lucide React

## 项目结构

```
supply-chain-finance-platform/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── middleware/       # 中间件
│   │   ├── utils/            # 工具函数
│   │   └── database/         # 数据库配置
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── api/             # API 客户端
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── store/           # 状态管理
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn

**注意**：本项目使用文件存储（JSON文件），无需安装数据库，非常适合演示使用。

### 安装步骤

#### 1. 进入项目目录

```bash
cd supply-chain-finance-platform
```

#### 2. 安装后端依赖

```bash
cd backend
npm install
```

#### 3. （可选）配置环境变量

如果需要自定义配置，可以创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件（可选，有默认值）：

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
```

#### 4. 启动后端服务

```bash
npm run dev
```

后端服务将在 `http://localhost:3001` 启动，数据会自动保存到 `backend/data/storage.json` 文件中

#### 6. 安装前端依赖

```bash
cd ../frontend
npm install
```

#### 7. 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

## API 文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 凭证接口

- `POST /api/certificates` - 创建凭证（核心企业）
- `GET /api/certificates` - 获取凭证列表
- `GET /api/certificates/:id` - 获取凭证详情
- `GET /api/certificates/:id/history` - 获取凭证历史
- `POST /api/certificates/:id/verify` - 验证凭证

### 转让接口

- `POST /api/transfers` - 创建转让申请
- `GET /api/transfers` - 获取转让列表
- `GET /api/transfers/:id` - 获取转让详情
- `POST /api/transfers/:id/approve` - 批准转让
- `POST /api/transfers/:id/reject` - 拒绝转让

### 融资接口

- `POST /api/financing` - 创建融资申请
- `GET /api/financing` - 获取融资列表
- `GET /api/financing/:id` - 获取融资详情
- `POST /api/financing/:id/approve` - 批准融资
- `POST /api/financing/:id/reject` - 拒绝融资
- `POST /api/financing/:id/disburse` - 放款

### 仪表盘接口

- `GET /api/dashboard/stats` - 获取统计数据

## 用户角色

- **核心企业** (core_enterprise): 可以签发凭证，查看已签发凭证
- **供应商** (supplier): 可以接收凭证，申请转让，申请融资
- **银行** (bank): 可以审批融资申请，放款
- **管理员** (admin): 系统管理员权限

## 开发说明

### 后端开发

```bash
cd backend
npm run dev      # 开发模式（热重载）
npm run build    # 构建生产版本
npm start        # 运行生产版本
```

### 前端开发

```bash
cd frontend
npm run dev      # 开发模式
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```

## 特性

- ✅ 现代化UI设计，专业大气
- ✅ 响应式布局，支持移动端
- ✅ 完整的认证授权系统
- ✅ 角色权限控制
- ✅ 实时数据更新
- ✅ 错误处理和用户反馈
- ✅ 代码规范和类型安全
- ✅ **文件存储**：无需数据库，数据存储在JSON文件中，方便演示

## 数据存储

本项目使用文件存储方式，所有数据保存在 `backend/data/storage.json` 文件中：

- 数据会在应用启动时自动初始化（如果不存在）
- 所有操作都会实时保存到文件
- 删除 `data` 文件夹可以重置所有数据
- 适合演示和开发环境使用

**默认测试账号**（首次启动自动创建）：
- **核心企业**：`admin@example.com` / `123456`
- **供应商**（共5个）：
  - `supplier1@example.com` / `123456` - 华东电子材料有限公司
  - `supplier2@example.com` / `123456` - 华南精密制造股份有限公司
  - `supplier3@example.com` / `123456` - 华北物流服务有限公司
  - `supplier4@example.com` / `123456` - 西南金属加工有限公司
  - `supplier5@example.com` / `123456` - 东北化工原料有限公司
- **银行**（共2个）：
  - `bank1@example.com` / `123456` - 工商银行供应链金融部
  - `bank2@example.com` / `123456` - 建设银行数字金融中心

**初始数据**：
- 5个供应商公司
- 2个银行
- 12-15个凭证（每个供应商2-3个）
- 部分转让记录
- 部分融资记录（待审批、已批准、已放款）

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
