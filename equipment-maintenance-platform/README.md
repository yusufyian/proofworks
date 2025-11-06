# 设备全生命周期与维保记录平台

设备全生命周期与维保记录平台是一个基于区块链的设备管理解决方案，实现设备从采购、安装、使用、维保到报废的全生命周期数字化管理。

## 功能特性

- **设备台账管理**: 完整的设备档案管理，支持设备分类、位置管理、责任人分配
- **维保计划管理**: 预防性维护计划制定与执行跟踪，支持基于日历、运行时长、工作循环的计划
- **维修工单系统**: 故障报修、工单分配、维修记录管理
- **备件管理**: 备件库存管理，ABC分类，低库存预警
- **设备健康监测**: IoT数据采集与健康度评估，预测性维护
- **区块链存证**: 设备信息、维修记录等重要数据上链存证，确保真实性和可追溯性

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Ant Design
- React Query
- Zustand
- Recharts

### 后端
- Node.js + Express + TypeScript
- 文件存储（JSON）
- JWT 认证
- 区块链模拟存证

## 项目结构

```
equipment-maintenance-platform/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── routes/          # 路由
│   │   ├── middleware/      # 中间件
│   │   ├── storage/         # 文件存储
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   └── data/                # 数据文件目录
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── services/        # API服务
│   │   └── store/           # 状态管理
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或分别安装
cd backend && npm install
cd ../frontend && npm install
```

### 2. 启动后端服务

```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3029` 启动

### 3. 启动前端应用

```bash
cd frontend
npm run dev
```

前端应用将在 `http://localhost:3009` 启动

## 演示账号

系统预生成了以下角色的演示账号（密码均为 `123456`）：

- **管理员**: admin1, admin2, admin3
- **设备管理员**: manager1, manager2, ...
- **维修技师**: tech1, tech2, ...
- **操作工**: operator1, operator2, ...

## 模拟数据

系统首次启动时会自动生成大量逼真的模拟数据：

- 81个用户（3个管理员 + 8个设备管理员 + 20个维修技师 + 50个操作工）
- 150台设备（涵盖数控机床、注塑设备、焊接设备、空压设备、叉车、检测设备等）
- 200个维保计划
- 300个维修工单
- 100个备件
- 500个健康度评估记录
- 50条知识库记录

所有数据使用逼真的中文姓名、机构名称，适合演示使用。

## API 接口

### 认证
- `POST /api/auth/login` - 登录
- `GET /api/auth/profile` - 获取用户信息

### 设备管理
- `GET /api/equipment` - 获取设备列表
- `GET /api/equipment/:id` - 获取设备详情
- `POST /api/equipment` - 创建设备
- `PUT /api/equipment/:id` - 更新设备
- `GET /api/equipment/stats` - 获取设备统计

### 维保计划
- `GET /api/maintenance` - 获取维保计划列表
- `POST /api/maintenance` - 创建维保计划
- `PUT /api/maintenance/:id` - 更新维保计划

### 工单管理
- `GET /api/work-orders` - 获取工单列表
- `GET /api/work-orders/:id` - 获取工单详情
- `POST /api/work-orders` - 创建工单
- `PUT /api/work-orders/:id` - 更新工单

### 备件管理
- `GET /api/spare-parts` - 获取备件列表
- `POST /api/spare-parts` - 创建备件
- `PUT /api/spare-parts/:id` - 更新备件

### 健康监测
- `GET /api/health` - 获取健康度评估列表
- `POST /api/health` - 创建健康度评估

### 区块链存证
- `GET /api/blockchain` - 获取区块链记录
- `GET /api/blockchain/verify/:txHash` - 验证区块链记录

### 仪表盘
- `GET /api/dashboard/stats` - 获取仪表盘统计数据

## 区块链存证

系统模拟了区块链存证功能，关键操作会自动上链：

- 设备采购入库时自动生成区块链记录
- 维修工单完成时自动上链存证
- 每次存证都会生成唯一的交易哈希（txHash）和数据哈希（dataHash）

## 开发说明

### 数据存储

系统使用JSON文件存储数据，所有数据文件位于 `backend/data/` 目录：

- `users.json` - 用户数据
- `equipment.json` - 设备数据
- `maintenancePlans.json` - 维保计划
- `workOrders.json` - 工单数据
- `spareParts.json` - 备件数据
- `healthAssessments.json` - 健康度评估
- `knowledgeBase.json` - 知识库
- `blockchainRecords.json` - 区块链记录

### 环境变量

可在 `backend/.env` 文件中配置：

```env
PORT=3029
FRONTEND_URL=http://localhost:3009
JWT_SECRET=equipment-maintenance-secret-key-2024
NODE_ENV=development
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT