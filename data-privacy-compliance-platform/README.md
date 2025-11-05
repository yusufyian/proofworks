# 数据要素合规流通平台

基于隐私计算技术的数据要素合规流通与协作平台，满足《个人信息保护法》《数据安全法》等合规要求。

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据存储**: JSON文件（演示用）

## 功能模块

1. **数据资产盘点与分类分级** - 自动识别和分类数据资产
2. **数据使用授权管理** - 合规的授权流程管理
3. **隐私计算任务** - MPC、TEE、联邦学习等隐私计算
4. **合规审计** - 完整的审计日志和报告
5. **区块链存证** - 计算过程和授权记录上链存证

## 快速开始

### 安装依赖

```bash
npm run install:all
```

### 启动前端（端口3005）

```bash
npm run dev:frontend
```

### 启动后端（端口3025）

```bash
npm run dev:backend
```

## 默认账号

- 数据提供方: provider@example.com / password123
- 数据需求方: consumer@example.com / password123
- 平台管理员: admin@example.com / password123

