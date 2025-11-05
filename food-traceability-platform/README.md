# 食品农产品全链路追溯平台

## 项目简介

基于区块链技术的食品农产品全链路可追溯系统，实现从产地到餐桌的全程透明化追溯。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS
- **后端**: Node.js + Express + TypeScript
- **数据存储**: JSON文件存储（演示用）

## 功能特性

- ✅ 一物一码管理
- ✅ 产品档案管理
- ✅ 批次管理与追踪
- ✅ 流转记录可视化
- ✅ IoT数据采集（温度、GPS等）
- ✅ 消费者扫码查询
- ✅ 召回管理
- ✅ 质检报告管理
- ✅ 智能帮助系统

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

前端地址: http://localhost:3002
后端地址: http://localhost:3003

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
food-traceability-platform/
├── backend/          # 后端服务
├── frontend/         # 前端应用
└── README.md         # 项目说明
```

## 数据说明

系统使用文件存储模拟数据，预先生成了丰富的演示数据，包括：
- 100+ 产品档案
- 500+ 批次记录
- 5000+ 流转事件
- 1000+ IoT传感器数据

