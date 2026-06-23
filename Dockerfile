# 前端镜像(UmiJS Max SPA → nginx 静态服务)
# 构建: docker build -t sp-frontend:dev .
# 生产: 由 .github/workflows/build-and-push.yml 推 ACR,服务器 docker compose pull
#
# 不写 # syntax=docker/dockerfile:1.6 —— 国内拉 frontend 镜像不稳;
# docker 28 内置 BuildKit 已支持本文件用到的所有特性(RUN --mount 等)

# ============ Builder ============
FROM node:20-alpine AS builder
WORKDIR /app

# 国内 npm 镜像加速
RUN npm config set registry https://registry.npmmirror.com

# 先拷依赖清单,利用 docker 层缓存(改代码不会重装 npm 包)
# --legacy-peer-deps: react-infinite-scroller@1.2.6 不支持 react@19,npm 严格 peer 检查会拒绝安装
#                     本地 npm install 也是同样 flag,保持一致
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --legacy-peer-deps

# 拷源码(被 .dockerignore 过滤后)
COPY . .

# .env.production 留空 API_BASE_URL → 前端走相对路径 → nginx 反代到后端
RUN cp -n .env.production.template .env.production 2>/dev/null || true

# 构建(Mako 走 max build,产物落到 dist/)
RUN npm run build

# ============ Runtime ============
FROM nginx:1.27-alpine AS runtime
ENV TZ=Asia/Shanghai

# 容器版 nginx 配置(替代 nginx:alpine 默认的 default.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine 自带 busybox wget,做 HTTP 200 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
