# 发票单据防伪与税务协同平台

## 项目简介

基于区块链的发票防伪验证与税务协同管理系统，实现发票采集、OCR识别、真伪验证、三单匹配、费用报销、销售开票等全流程管理。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **存储**: JSON文件存储（演示用）

## 快速开始

### 安装依赖

```bash
npm run install:all
```

### 启动开发服务器

```bash
# 启动后端（端口3026）
npm run dev:backend

# 启动前端（端口3006）
npm run dev:frontend
```

### 访问地址

- 前端: http://localhost:3006
- 后端API: http://localhost:3026

## 功能模块

1. **发票管理**: 发票采集、OCR识别、真伪验证
2. **三单匹配**: 采购订单、入库单、发票自动匹配
3. **费用报销**: 员工报销流程管理
4. **销售开票**: 销售发票开具与管理
5. **税务申报**: 税务数据汇总与申报
6. **风控引擎**: 异常发票检测与预警
7. **区块链存证**: 发票信息上链存证

## 项目结构

```
invoice-tax-platform/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── storage/      # 文件存储
│   │   └── utils/        # 工具函数
│   └── data/            # 数据文件
├── frontend/         # 前端应用
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # 通用组件
│   │   ├── api/         # API调用
│   │   └── store/       # 状态管理
└── README.md

```

