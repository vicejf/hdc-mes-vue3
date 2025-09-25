# 生产环境Dockerfile - 不在容器中构建版本
FROM nginx:alpine

# 复制构建产物（假设已在外部构建完成）
COPY apps/web-antd/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
