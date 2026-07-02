# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

口语魔方 SpeakCube - AI 剑桥英语口语练习平台前端，基于 Ant Design Pro 和 UmiJS Max 构建。

## Common Commands

```bash
# Development
npm run start          # 开发模式 (默认端口 8000)
npm run start:dev      # 开发模式，不使用 mock
npm run start:https    # HTTPS 开发模式（监听 0.0.0.0:8001，支持局域网访问）

# HTTPS 证书（首次或换机/换 IP 时执行一次）
./scripts/setup-https.sh            # 生成 mkcert 可信证书
./scripts/setup-https.sh --trust    # 同上，并打印手机信任 CA 的步骤

# Build
npm run build          # 生产构建
npm run analyze        # 构建分析（生成依赖报告）

# Code Quality
npm run lint           # 运行 Biome lint + TypeScript 检查
npm run biome:lint     # 仅运行 Biome lint
npm run tsc            # 仅运行 TypeScript 类型检查

# Test
npm run test           # 运行 Jest 测试
npm run test:coverage  # 测试覆盖率报告
```

### HTTPS 调试（录音权限）

浏览器要求 `getUserMedia` 必须在安全上下文（HTTPS 或 localhost）下使用。手机/平板通过局域网 IP 访问开发服务器时，必须用 HTTPS：

1. **首次配置**：运行 `./scripts/setup-https.sh`，用 mkcert 生成可信证书（`https/cert.pem` + `cert.key`）。
2. **启动 HTTPS dev server**：`npm run start:https`，监听 `0.0.0.0:8001`。
3. **手机访问**：浏览器打开 `https://<开发机IP>:8001`，首次会有警告 → 按 `--trust` 步骤把 mkcert 的 `rootCA.pem` 装到手机即可消除警告。
4. **后端 API 透传**：`config/proxy.ts` 已将所有 `/api/*` 走 dev server 代理到本地后端，避免浏览器混合内容拦截，手机无需关心后端协议。
5. **证书不入库**：`.gitignore` 已忽略 `https/*.pem` 等私钥文件；每台机器需各自运行 `setup-https.sh` 生成自己的证书。

## Architecture

### Tech Stack
- **Framework**: UmiJS Max 4.x + React 19
- **UI**: Ant Design 5.x
- **Styling**: Less + antd-style
- **Build**: Mako (Rust-based bundler)
- **Lint**: Biome (not ESLint/Prettier)

### Directory Structure
```
config/
  config.ts      # UmiJS 主配置
  routes.ts      # 路由配置
  proxy.ts       # 开发代理配置
src/
  components/    # 通用组件
  pages/         # 页面组件（基于文件路由）
  services/      # API 服务层
  locales/       # 国际化 (zh-CN, en-US, etc.)
  models/        # UmiJS 数据流
```

### API Architecture
- **Main Backend**: `/api/*` → 代理到 localhost:9002
- **Conversation Service**: `/api/v1/*` → 代理到 localhost:9019
- **WebSocket**: `ws://localhost:9001/ws` (生产环境通过 Nginx)

### Route Categories
- **Public**: `/home`, `/about`, `/articles`, `/exam-catalog` - 无需登录
- **User**: `/user/*`, `/messages/*` - 需要登录
- **Admin**: `/back/*` - 需要 `access: 'canAdmin'` 权限
- 使用 `layout: false` 控制是否显示 Ant Design Pro 布局

### State Management
- **Global**: `@@initialState` model (用户信息、权限等)
- **Page-level**: UmiJS model 插件 (`useModel` hook)

## Code Conventions

- 单引号字符串 (Biome 配置)
- TypeScript 严格模式
- 提交信息遵循 Conventional Commits 规范
- 提交前自动运行 lint-staged

## Key Files

- `.umirc.ts` - UmiJS 配置入口
- `config/routes.ts` - 路由配置
- `src/global.tsx` - 全局初始化逻辑
- `src/services/ant-design-pro/` - 核心 API 服务
