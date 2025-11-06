# ProofWorks Portal

ProofWorks 区块链企业级应用解决方案门户网站

## 项目介绍

这是一个展示 ProofWorks 十个区块链应用系列的门户网站，包含：
- 供应链金融与数字凭证
- 食品农产品全链路追溯
- 冷链医药流通
- 结算对账自动化
- 数据要素合规流通
- 发票单据防伪与税务协同
- 碳足迹ESG数据确权与核证
- 知识产权数实资产凭证与维权
- 设备全生命周期与维保记录
- 跨境合规协作

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion（动画效果）
- React Router（路由管理）
- Lucide React（图标库）

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
proofworks-portal/
├── src/
│   ├── components/      # 组件
│   │   ├── Hero.tsx     # 首页英雄区
│   │   ├── ApplicationGrid.tsx  # 应用网格
│   │   ├── ApplicationCard.tsx  # 应用卡片
│   │   ├── Features.tsx # 核心优势
│   │   └── CTA.tsx      # 联系表单
│   ├── pages/           # 页面
│   │   ├── HomePage.tsx # 首页
│   │   └── ApplicationDetail.tsx  # 应用详情页
│   ├── data/            # 数据
│   │   └── applications.ts  # 应用数据定义
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 依赖配置
├── vite.config.ts       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

## 特性

- 🎨 现代化、科技感的UI设计
- ✨ 流畅的动画效果
- 📱 完全响应式设计
- 🚀 基于 Vite 的快速构建
- 🎯 聚焦业务痛点和核心价值
- 📊 数据可视化展示

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT

