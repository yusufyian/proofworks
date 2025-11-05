# 数据要素合规流通平台 - 安装指南

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
cd frontend && npm install
cd ../backend && npm install
```

### 2. 生成初始数据

```bash
cd backend
npm run seed
```

这将生成：
- 100个用户（包括默认账号）
- 500个数据资产
- 1000个授权记录
- 800个计算任务
- 5000个审计记录
- 500个区块链存证记录

### 3. 启动服务

**启动后端（端口3025）：**
```bash
cd backend
npm run dev
```

**启动前端（端口3005）：**
```bash
cd frontend
npm run dev
```

### 4. 访问系统

打开浏览器访问：http://localhost:3005

## 默认账号

- **管理员**: admin@example.com / password123
- **数据提供方**: provider@example.com / password123
- **数据需求方**: consumer@example.com / password123

## 功能模块

1. **仪表盘** - 查看系统概览和统计数据
2. **数据资产** - 管理和查看数据资产
3. **授权管理** - 创建和审批数据使用授权
4. **隐私计算** - 管理和查看隐私计算任务
5. **合规审计** - 查看系统操作审计日志
6. **区块链存证** - 查看区块链存证记录

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据存储**: JSON文件（演示用）

## 注意事项

- 本系统为演示用途，使用文件存储，不适用于生产环境
- 所有数据存储在 `backend/data/storage.json`
- 如需重新生成数据，删除 `backend/data/storage.json` 后重新运行 `npm run seed`

