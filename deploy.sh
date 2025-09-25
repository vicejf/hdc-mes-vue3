#!/bin/bash

# 生产环境部署脚本
# 一键构建和部署Vue3前端应用（外部构建版本）

echo "🚀 开始部署 hdc-mes-vue3 生产环境..."

# 检查Node.js和pnpm环境
echo "🔧 检查构建环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：Node.js 未安装，请先安装 Node.js 20.10+"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误：pnpm 未安装，请先安装 pnpm 9.12+"
    exit 1
fi

NODE_VERSION=$(node -v)
PNPM_VERSION=$(pnpm -v)
echo "✅ Node.js 版本: $NODE_VERSION"
echo "✅ pnpm 版本: $PNPM_VERSION"

# 安装依赖
echo "📦 安装项目依赖..."
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，请检查网络或依赖配置"
    exit 1
fi

# 构建项目
echo "🏗️  构建前端项目..."
pnpm run build:antd
if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败，请检查代码或构建配置"
    exit 1
fi

# 检查构建产物
if [ ! -d "apps/web-antd/dist" ]; then
    echo "❌ 错误：构建产物不存在，请检查构建过程"
    exit 1
fi

# 停止并删除旧容器
echo "🗑️  清理旧容器..."
docker-compose -f docker-compose.prod.yml down

# 构建新镜像
echo "🐳 构建Docker镜像..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 启动服务
echo "🌟 启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ 部署完成！"
echo "📱 应用地址: http://localhost:80"
echo "🌐 代理地址: http://localhost:5666 (如果启用了Nginx代理)"
echo "💡 提示：如需更新代码，修改代码后重新运行此脚本即可"