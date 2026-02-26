# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

口语魔方 SpeakCube - AI 剑桥英语口语练习平台前端，基于 Ant Design Pro 和 UmiJS Max 构建。

## Common Commands

```bash
# Development
npm run start          # 开发模式 (默认端口 8000)
npm run start:dev      # 开发模式，不使用 mock
npm run start:https    # HTTPS 开发模式

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
