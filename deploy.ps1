#!/usr/bin/env pwsh

# 生产环境部署脚本（Windows版本）
# 一键构建和部署Vue3前端应用（外部构建版本）

# 设置错误处理
$ErrorActionPreference = "Stop"

Write-Host "🚀 开始部署 hdc-mes-vue3 生产环境..." -ForegroundColor Cyan

# 检查Node.js和pnpm环境
Write-Host "🔧 检查构建环境..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：Node.js 未安装，请先安装 Node.js 20.10+" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：pnpm 未安装，请先安装 pnpm 9.12+" -ForegroundColor Red
    exit 1
}

$NODE_VERSION = node -v
$PNPM_VERSION = pnpm -v
Write-Host "✅ Node.js 版本: $NODE_VERSION" -ForegroundColor Green
Write-Host "✅ pnpm 版本: $PNPM_VERSION" -ForegroundColor Green

# 检查Docker是否可用
try {
    docker --version | Out-Null
    Write-Host "✅ Docker已安装并可用" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 无法找到Docker。请确保Docker已安装并在PATH中。" -ForegroundColor Red
    exit 1
}

# 检查docker-compose是否可用
try {
    docker-compose --version | Out-Null
    Write-Host "✅ docker-compose已安装并可用" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 无法找到docker-compose。请确保docker-compose已安装并在PATH中。" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "📦 安装项目依赖..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败，请检查网络或依赖配置" -ForegroundColor Red
    exit 1
}

# 构建项目
Write-Host "🏗️  构建前端项目..." -ForegroundColor Yellow
pnpm run build:antd
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 项目构建失败，请检查代码或构建配置" -ForegroundColor Red
    exit 1
}

# 检查构建产物
if (-not (Test-Path "apps/web-antd/dist" -PathType Container)) {
    Write-Host "❌ 错误：构建产物不存在，请检查构建过程" -ForegroundColor Red
    exit 1
}

# 停止并删除旧容器
Write-Host "🗑️  清理旧容器..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.prod.yml down
    Write-Host "✅ 旧容器清理完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️  清理旧容器时出现问题，可能没有运行中的容器。继续..." -ForegroundColor Yellow
}

# 构建新镜像
Write-Host "🐳 构建Docker镜像..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.prod.yml build --no-cache
    Write-Host "✅ 镜像构建完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 构建镜像失败！" -ForegroundColor Red
    Write-Host "📝 建议: 检查网络连接或Dockerfile是否正确" -ForegroundColor Yellow
    exit 1
}

# 启动服务
Write-Host "🌟 启动服务..." -ForegroundColor Yellow
try {
    # 尝试启动所有服务
    docker-compose -f docker-compose.prod.yml up -d
    Write-Host "✅ 服务启动完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 启动所有服务失败！" -ForegroundColor Red
    Write-Host "📝 尝试仅启动核心前端服务..." -ForegroundColor Yellow
    
    try {
        # 只启动核心前端服务
        docker-compose -f docker-compose.prod.yml up -d hdc-mes-vue3
        Write-Host "✅ 核心前端服务已成功启动" -ForegroundColor Green
        Write-Host "⚠️  注意: Nginx代理服务可能未启动，这可能影响某些功能" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ 错误: 启动核心前端服务也失败！" -ForegroundColor Red
        exit 1
    }
}

# 检查服务状态
Write-Host "🔍 检查服务状态..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "📱 应用地址: http://localhost:80" -ForegroundColor Green

# 检查nginx-proxy是否运行
try {
    $nginxStatus = docker-compose -f docker-compose.prod.yml ps nginx-proxy
    if ($nginxStatus -match "Up") {
        Write-Host "🌐 代理地址: http://localhost:5666 (如果启用了Nginx代理)" -ForegroundColor Green
    } else {
        Write-Host "🌐 Nginx代理服务可能未运行，请检查日志了解详情" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️  无法检查Nginx代理状态，可能已跳过该服务" -ForegroundColor Blue
}

Write-Host "💡 提示：如需更新代码，修改代码后重新运行此脚本即可" -ForegroundColor Green

Write-Host "
📋 故障排除建议:
1. 检查Docker是否正常运行
2. 确保Node.js和pnpm版本符合要求
3. 确保网络连接正常
4. 查看详细日志: docker-compose -f docker-compose.prod.yml logs" -ForegroundColor Cyan