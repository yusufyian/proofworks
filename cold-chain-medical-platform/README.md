# 冷链医药流通温控合规平台

基于区块链和TEE技术的冷链医药流通温控合规管理系统，满足GSP/GMP规范要求。

## 项目结构

```
cold-chain-medical-platform/
├── backend/          # Node.js + Express 后端
├── frontend/         # React + TypeScript 前端
└── README.md
```

## 功能特性

- ✅ **批次管理**：完整的药品批次信息管理
- ✅ **温控监控**：实时和历史温度数据可视化
- ✅ **智能告警**：多级别告警系统（预警/严重/紧急）
- ✅ **运输管理**：冷链运输全程跟踪
- ✅ **设备管理**：监测设备状态和校准管理
- ✅ **合规报表**：自动生成合规报告
- ✅ **帮助系统**：每个功能模块都有详细的帮助说明

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- 文件存储（JSON）
- JWT认证

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Recharts（图表）
- React Query（数据获取）
- Zustand（状态管理）

## 快速开始

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 2. 生成模拟数据

```bash
cd backend
npm run seed
```

这将生成：
- 8家公司（生产企业、批发企业、物流企业、医院、药店、监管部门）
- 11个监测设备（冷库、车载、便携设备）
- 150个药品批次
- 100个批次的温控数据（根据时间跨度智能生成，24小时内每15分钟一条，7天内每30分钟一条，30天内每2小时一条，包含平滑的温度波动和昼夜温差模拟）
- 50条告警记录
- 80个运输单

### 3. 启动后端服务

```bash
cd backend
npm run dev
```

后端服务运行在 http://localhost:3023

### 4. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务运行在 http://localhost:3003

## 默认账号

- **管理员账号**
  - 邮箱: `admin@coldchain.com`
  - 密码: `admin123`

- **其他账号**
  - 邮箱: 公司名（小写，去空格）@coldchain.com
  - 密码: `123456`

## 主要页面

1. **仪表盘** (`/`) - 系统概览和关键指标
2. **批次管理** (`/batches`) - 查看和管理所有药品批次
3. **温控监控** (`/temperature`) - 实时和历史温度曲线
4. **告警管理** (`/alerts`) - 处理和跟踪所有告警
5. **运输管理** (`/transports`) - 冷链运输单管理
6. **设备管理** (`/devices`) - 监测设备状态管理

## 数据说明

所有数据存储在 `backend/data/storage.json` 文件中。系统使用文件存储模拟数据库，适合演示和开发使用。

## 帮助功能

每个重要功能模块都有帮助按钮（问号图标），点击可以查看详细的功能说明和使用指南。

## 开发说明

### 后端API

所有API接口都在 `backend/src/routes/index.ts` 中定义。

主要接口：
- `POST /api/auth/login` - 登录
- `GET /api/dashboard/stats` - 仪表盘统计
- `GET /api/batches` - 获取批次列表
- `GET /api/temperature` - 获取温控数据
- `GET /api/alerts` - 获取告警列表
- `GET /api/transports` - 获取运输单列表
- `GET /api/devices` - 获取设备列表

### 前端路由

路由配置在 `frontend/src/App.tsx` 中。

## 注意事项

1. 本项目使用文件存储，仅用于演示目的
2. 生产环境请使用真实数据库（如PostgreSQL、MongoDB等）
3. 模拟数据生成可能需要一些时间，请耐心等待
4. 所有温控数据都是模拟数据，仅供参考

## License

MIT

