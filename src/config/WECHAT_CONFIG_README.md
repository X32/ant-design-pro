# 微信登录配置快速指南

## ⚡ 快速开始

### 1. 修改配置文件

编辑 `src/config/wechatConfig.ts`，将 `YOUR_WECHAT_APPID` 替换为你的微信 AppID：

```typescript
export const WECHAT_CONFIG = {
  appid: 'wx1234567890abcdef', // ⬅️ 替换为你的 AppID
  // ...其他配置保持不变
};
```

### 2. 后端实现回调接口

创建 `/api/auth/wechat/callback` 接口处理微信回调。

### 3. 配置微信开放平台

在 [微信开放平台](https://open.weixin.qq.com/) 配置授权回调域。

## 📋 关键参数说明

| 参数 | 说明 | 获取方式 |
|------|------|----------|
| **appid** | 微信开放平台应用ID | 微信开放平台 > 网站应用 > 基本信息 |
| **redirect_uri** | 授权后回调地址 | 需在微信开放平台配置白名单 |
| **scope** | 授权作用域 | 固定值 `snsapi_login` |

## 🔧 配置项

```typescript
{
  appid: 'YOUR_APPID',           // 必填：微信AppID
  scope: 'snsapi_login',          // 固定值
  getRedirectUri: () => string,   // 回调地址函数
  style: 'black' | 'white',       // 二维码样式
  selfRedirect: boolean,          // 是否当前页跳转
}
```

## 📚 详细文档

查看完整文档：[WECHAT_LOGIN_GUIDE.md](./WECHAT_LOGIN_GUIDE.md)
