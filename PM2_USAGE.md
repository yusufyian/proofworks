# PM2 使用指南

## PM2 简介

PM2 是一个 Node.js 进程管理器，可以保持应用程序持续运行，并提供负载均衡、自动重启、日志管理等功能。

## 基本命令

### 1. 启动所有服务
```bash
cd /home/workspace/proofworks
pm2 start ecosystem.config.js
```

### 2. 启动单个服务
```bash
pm2 start ecosystem.config.js --only carbon-esg-backend
```

### 3. 查看运行状态
```bash
pm2 list          # 查看所有进程
pm2 status         # 查看状态
pm2 show <app_name> # 查看某个应用的详细信息
```

### 4. 查看日志
```bash
pm2 logs                    # 查看所有日志
pm2 logs <app_name>        # 查看某个应用的日志
pm2 logs --lines 100       # 查看最近100行日志
pm2 flush                   # 清空所有日志
```

### 5. 停止服务
```bash
pm2 stop all                # 停止所有服务
pm2 stop <app_name>        # 停止某个服务
pm2 stop ecosystem.config.js # 停止配置文件中的所有服务
```

### 6. 重启服务
```bash
pm2 restart all             # 重启所有服务
pm2 restart <app_name>      # 重启某个服务
pm2 reload <app_name>       # 零停机重启（优雅重启）
```

### 7. 删除服务
```bash
pm2 delete all              # 删除所有服务
pm2 delete <app_name>       # 删除某个服务
```

### 8. 监控
```bash
pm2 monit                   # 实时监控（CPU、内存等）
```

### 9. 保存当前进程列表
```bash
pm2 save                    # 保存当前进程列表
```

### 10. 设置开机自启
```bash
pm2 startup                # 生成启动脚本
pm2 save                    # 保存当前进程列表
```

## 常用操作流程

### 首次部署

1. **构建所有后端项目**
```bash
# 为每个项目构建
cd /home/workspace/proofworks/carbon-esg-platform/backend && npm run build
cd /home/workspace/proofworks/cold-chain-medical-platform/backend && npm run build
cd /home/workspace/proofworks/cross-border-compliance-platform/backend && npm run build
cd /home/workspace/proofworks/data-privacy-compliance-platform/backend && npm run build
cd /home/workspace/proofworks/equipment-maintenance-platform/backend && npm run build
cd /home/workspace/proofworks/food-traceability-platform/backend && npm run build
cd /home/workspace/proofworks/intellectual-property-platform/backend && npm run build
cd /home/workspace/proofworks/invoice-tax-platform/backend && npm run build
cd /home/workspace/proofworks/reconciliation-platform/backend && npm run build
cd /home/workspace/proofworks/supply-chain-finance-platform/backend && npm run build
```

2. **启动所有服务**
```bash
cd /home/workspace/proofworks
pm2 start ecosystem.config.js
```

3. **保存并设置开机自启**
```bash
pm2 save
pm2 startup
```

### 更新服务

1. **重新构建项目**
```bash
cd /home/workspace/proofworks/<project-name>/backend
npm run build
```

2. **重启服务**
```bash
pm2 restart <app_name>
```

### 查看日志排查问题

```bash
# 查看所有日志
pm2 logs

# 查看特定服务的错误日志
pm2 logs <app_name> --err

# 查看最近100行日志
pm2 logs <app_name> --lines 100
```

## 服务列表

配置文件 `ecosystem.config.js` 中包含了以下10个后端服务：

1. **carbon-esg-backend** - 端口 3027
2. **cold-chain-medical-backend** - 端口 3023
3. **cross-border-compliance-backend** - 端口 3030
4. **data-privacy-compliance-backend** - 端口 3025
5. **equipment-maintenance-backend** - 端口 3029
6. **food-traceability-backend** - 端口 3022
7. **intellectual-property-backend** - 端口 3028
8. **invoice-tax-backend** - 端口 3026
9. **reconciliation-backend** - 端口 3024
10. **supply-chain-finance-backend** - 端口 3021

## 日志位置

所有日志文件保存在 `/home/workspace/proofworks/logs/` 目录下：
- `<app-name>-error.log` - 错误日志
- `<app-name>-out.log` - 标准输出日志

## 注意事项

1. **确保所有项目已构建**：在启动 PM2 之前，确保所有后端项目的 `dist` 目录存在且包含编译后的代码。

2. **端口冲突**：确保配置的端口没有被其他服务占用。

3. **环境变量**：可以通过修改 `ecosystem.config.js` 中的 `env` 部分来设置环境变量。

4. **内存限制**：每个服务设置了最大内存限制为 1G，超过限制会自动重启。

5. **自动重启**：所有服务都启用了 `autorestart: true`，服务崩溃时会自动重启。

## 高级功能

### 集群模式（如果需要）

如果需要负载均衡，可以修改配置文件中的 `instances` 和 `exec_mode`：

```javascript
instances: 2,        // 启动2个实例
exec_mode: 'cluster' // 使用集群模式
```

### 环境变量

可以在配置文件中为不同环境设置不同的变量：

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3027
},
env_development: {
  NODE_ENV: 'development',
  PORT: 3027
}
```

然后使用：
```bash
pm2 start ecosystem.config.js --env development
```


