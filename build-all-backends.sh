#!/bin/bash

# 构建所有后端项目的脚本

echo "开始构建所有后端项目..."

PROJECTS=(
  "carbon-esg-platform"
  "cold-chain-medical-platform"
  "cross-border-compliance-platform"
  "data-privacy-compliance-platform"
  "equipment-maintenance-platform"
  "food-traceability-platform"
  "intellectual-property-platform"
  "invoice-tax-platform"
  "reconciliation-platform"
  "supply-chain-finance-platform"
)

BASE_DIR="/home/workspace/proofworks"

for project in "${PROJECTS[@]}"; do
  echo ""
  echo "=========================================="
  echo "构建项目: $project"
  echo "=========================================="
  
  BACKEND_DIR="$BASE_DIR/$project/backend"
  
  if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    
    if [ -f "package.json" ]; then
      echo "正在构建 $project..."
      npm run build
      
      if [ $? -eq 0 ]; then
        echo "✅ $project 构建成功"
      else
        echo "❌ $project 构建失败"
      fi
    else
      echo "⚠️  $project/backend 目录下没有 package.json，跳过"
    fi
  else
    echo "⚠️  $project/backend 目录不存在，跳过"
  fi
done

echo ""
echo "=========================================="
echo "所有项目构建完成！"
echo "=========================================="
echo ""
echo "接下来可以运行："
echo "  cd /home/workspace/proofworks"
echo "  pm2 start ecosystem.config.js"

