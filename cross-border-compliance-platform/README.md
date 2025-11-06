# 跨境合规协作平台

基于区块链的跨境数据合规协作管理系统

## 项目结构

```
cross-border-compliance-platform/
├── backend/          # Node.js + Express 后端
├── frontend/         # React + TypeScript 前端
└── README.md
```

## 功能模块

1. **数据出境合规管理** - 数据资产盘点、分类分级、出境评估、标准合同管理
2. **跨境数据传输** - API网关、数据脱敏、加密传输、审计日志
3. **跨境支付合规** - 支付申请、合规检查、银行对接
4. **跨境供应链协同** - 订单同步、物流追踪、清关状态
5. **监管报送** - 网信办、海关、外管局报送
6. **区块链存证** - 所有关键操作上链存证

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- 文件存储（JSON文件，用于演示）
- JWT认证
- Winston日志

### 前端
- React 18
- TypeScript
- Tailwind CSS
- React Query
- React Router
- Zustand
- Recharts
- Lucide React

## 快速开始

### 安装依赖

```bash
# 根目录
npm run install:all

# 或分别安装
cd backend && npm install
cd ../frontend && npm install
```

### 启动开发服务器

```bash
# 根目录启动（同时启动前后端）
npm run dev

# 或分别启动
npm run dev:backend  # 后端端口 3030
npm run dev:frontend # 前端端口 3010
```

### 登录账号

- **管理员**: admin@example.com / 123456
- **合规团队**: compliance1@example.com / 123456 (共5个)
- **业务部门**: business1@example.com / 123456 (共8个)
- **法务部门**: legal1@example.com / 123456 (共3个)

## 数据说明

系统预生成大量逼真的模拟数据：
- 10个境内公司
- 15个境外公司（香港、新加坡、美国）
- 50条数据出境评估记录
- 40条标准合同记录
- 200条跨境数据传输记录
- 150条跨境支付记录
- 180条跨境供应链订单
- 60条监管报送记录
- 500条区块链存证记录

所有数据存储在 `backend/data/storage.json`

## 端口配置

- 前端: http://localhost:3010
- 后端: http://localhost:3030

## 环境变量

后端可配置 `.env`:
```
PORT=3030
FRONTEND_URL=http://localhost:3010
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 项目特色

1. ✨ **大气专业的UI设计** - 参考国际级平台风格，略带炫酷效果
2. 🛡️ **完整合规体系** - 覆盖数据出境、跨境支付、供应链全流程
3. 🔗 **区块链集成** - 所有关键操作上链存证，可追溯可审计
4. 📖 **帮助系统** - 每个重要功能都有弹窗帮助说明
5. 📊 **丰富的数据可视化** - 图表展示各项业务指标
6. 🎯 **演示级数据** - 预生成大量逼真的业务数据

## 开发说明

### 后端API

所有API需要JWT认证（登录接口除外）：
```
Authorization: Bearer <token>
```

主要API端点：
- `/api/auth/login` - 登录
- `/api/dashboard/stats` - 统计数据
- `/api/assessments` - 数据出境评估
- `/api/contracts` - 标准合同
- `/api/transmissions` - 数据传输
- `/api/payments` - 跨境支付
- `/api/orders` - 供应链订单
- `/api/reports` - 监管报送
- `/api/blockchain` - 区块链记录

### 前端路由

- `/login` - 登录页
- `/` - 仪表盘
- `/assessments` - 数据出境管理
- `/contracts` - 标准合同管理
- `/transmissions` - 跨境传输
- `/payments` - 跨境支付
- `/orders` - 供应链协同
- `/reports` - 监管报送
- `/blockchain` - 区块链记录

## License

MIT

