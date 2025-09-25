# hdc-mes-vue3 生产环境部署说明

## 🎯 概述

本项目提供简化的生产环境Docker部署方案，采用**外部构建，容器运行**的方式。先在本地构建项目，然后使用Docker运行构建产物。

## 📋 前置要求

- Node.js 20.10+
- pnpm 9.12+
- Docker Engine 20.10+
- Docker Compose 2.0+

## 🚀 快速部署

### 步骤一：本地构建项目

```bash
# 安装依赖
pnpm install

# 构建项目（只构建web-antd应用）
pnpm run build:antd
```

### 步骤二：启动Docker容器

```bash
# 构建镜像并启动服务
docker-compose -f docker-compose.prod.yml up -d --build

# 查看状态
docker-compose -f docker-compose.prod.yml ps
```

### 方式一：一键脚本部署（推荐）

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 方式二：手动部署

```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看状态
docker-compose -f docker-compose.prod.yml ps
```

## 🔧 配置说明

### 端口映射
- **80**: 前端应用主端口
- **5666**: Nginx代理端口（可选）

### 环境变量
- `NODE_ENV=production`: 生产环境标识

### 卷挂载
- `./apps/web-antd/dist:/usr/share/nginx/html:ro`: 挂载本地构建产物到容器中，便于开发调试

## 📁 文件结构

```
hdc-mes-vue3/
├── Dockerfile              # 生产环境Dockerfile（不在容器中构建）
├── docker-compose.prod.yml # 生产环境Compose配置
├── deploy.sh              # 一键部署脚本
├── nginx.conf             # Nginx配置
├── apps/
│   └── web-antd/
│       └── dist/          # 构建产物目录
└── ...                    # 项目源码
```

## 🔍 常用命令

```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 重新构建并启动（当代码有更新时）
pnpm run build:antd && docker-compose -f docker-compose.prod.yml up -d --build
```

## 🌐 访问地址

部署完成后，可以通过以下地址访问：
- 主应用: http://localhost:80
- 代理访问: http://localhost:5666（如果启用了Nginx代理）

## ⚠️ 注意事项

1. **端口冲突**: 确保80和5666端口未被占用
2. **防火墙**: 开放相应的端口访问
3. **SSL证书**: 生产环境建议配置HTTPS
4. **性能优化**: 可根据实际需求调整Nginx配置
5. **构建产物**: 确保在启动容器前已经完成项目构建，生成了`apps/web-antd/dist`目录

## 🛠️ 故障排查

### 容器无法启动
```bash
# 检查容器状态
docker ps -a

# 查看错误日志
docker-compose -f docker-compose.prod.yml logs
```

### 构建失败
```bash
# 检查Node.js和pnpm版本
node -v
pnpm -v

# 清理依赖并重新安装
pnpm clean --del-lock && pnpm install

# 重新构建
pnpm run build:antd
```

### 页面空白或404
```bash
# 检查Nginx配置
docker-compose -f docker-compose.prod.yml exec hdc-mes-vue3 nginx -t

# 检查文件是否存在
docker-compose -f docker-compose.prod.yml exec hdc-mes-vue3 ls /usr/share/nginx/html
```

## 📞 技术支持

如有问题，请检查容器日志或联系开发团队。