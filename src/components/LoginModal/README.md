# LoginModal - 登录入口弹框组件

## 📋 组件简介

一个功能完善、设计精美的登录弹框组件，支持微信扫码登录和手机号登录两种方式。

## ✨ 功能特性

- 🎨 **精美设计**：左侧品牌展示区 + 右侧登录表单区
- 🔄 **双登录方式**：微信扫码登录 & 手机号验证码登录
- 📱 **响应式布局**：完美适配桌面端和移动端
- ⚡ **便捷切换**：右上角一键切换登录方式
- 📄 **用户协议**：底部展示用户协议和隐私政策链接
- 🎯 **类型安全**：完整的 TypeScript 类型支持

## 📦 组件结构

```
LoginModal/
├── index.tsx       # 组件主文件
├── index.less      # 样式文件
├── demo.tsx        # 使用示例
└── README.md       # 文档
```

## 🎯 使用方法

### 基础用法

```tsx
import React, { useState } from 'react';
import { Button } from 'antd';
import { LoginModal } from '@/components';

const App: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        登录
      </Button>

      <LoginModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onSuccess={() => {
          console.log('登录成功');
        }}
      />
    </>
  );
};
```

### 在导航栏使用

```tsx
import { LoginModal } from '@/components';
import { useState } from 'react';

const Navbar = () => {
  const [loginVisible, setLoginVisible] = useState(false);

  return (
    <div className="navbar">
      <Button onClick={() => setLoginVisible(true)}>
        登录/注册
      </Button>

      <LoginModal
        visible={loginVisible}
        onCancel={() => setLoginVisible(false)}
        onSuccess={() => {
          // 刷新用户信息
          window.location.reload();
        }}
      />
    </div>
  );
};
```

## 🔧 API 属性

| 属性 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| visible | 是否显示弹框 | `boolean` | `false` | ✅ |
| onCancel | 关闭弹框回调 | `() => void` | - | ✅ |
| onSuccess | 登录成功回调 | `() => void` | - | ❌ |

## 🎨 界面布局

```
┌─────────────────────────────────────────────────────────┐
│                   [关闭按钮 ×]                          │
├──────────────────────┬──────────────────────────────────┤
│                      │            [切换登录方式 →]      │
│   【品牌展示区】     │                                  │
│                      │      ┌──────────────────┐        │
│   Logo + 品牌名      │      │   登录标题       │        │
│   宣传语             │      ├──────────────────┤        │
│                      │      │                  │        │
│   ✨ 特性1           │      │  【登录表单区】  │        │
│   🎯 特性2           │      │                  │        │
│   📊 特性3           │      │  微信二维码 或   │        │
│   🏆 特性4           │      │  手机号输入框    │        │
│                      │      │                  │        │
│                      │      └──────────────────┘        │
│                      │                                  │
│                      │      ────── 其他登录方式 ──────  │
│                      │                                  │
│                      │      [账号密码登录]              │
│                      │                                  │
│                      │  登录即表示同意《用户协议》和    │
│                      │          《隐私政策》            │
└──────────────────────┴──────────────────────────────────┘
```

## 🔄 登录方式切换

### 微信扫码登录
- 显示微信二维码
- 提示"请使用微信扫码登录"
- 右上角显示"手机号登录"切换按钮

### 手机号登录
- 手机号输入框（带格式验证）
- 验证码输入框 + 获取验证码按钮
- 60秒倒计时
- 登录按钮
- 提示"首次使用手机号登录将自动注册账号"

## 📱 响应式设计

- **桌面端**：左右分栏布局，弹框宽度 800px
- **移动端**：上下布局，全屏显示

## 🎨 样式定制

组件样式使用 Less 编写，支持自定义主题色：

```less
// 修改渐变色
.login-modal-left {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

// 修改主题色
.switch-button {
  color: #1890ff;  // 可以修改为你的品牌色
}
```

## 🚀 待集成功能

以下功能需要对接后端接口：

### 1. 微信扫码登录
```tsx
// TODO: 集成微信开放平台登录
// 1. 获取微信登录二维码
// 2. 轮询扫码状态
// 3. 获取用户信息并登录
```

### 2. 手机号登录
```tsx
// TODO: 调用后端接口
const handleSendCode = async () => {
  await sendSmsCode({ phone }); // 需对接发送验证码接口
};

const handleMobileLogin = async (values) => {
  await smsLogin(values); // 需对接手机号登录接口
};
```

### 3. 登录成功处理
```tsx
onSuccess={() => {
  // 保存 token
  localStorage.setItem('token', response.token);
  
  // 刷新用户信息
  await fetchUserInfo();
  
  // 跳转或刷新页面
  window.location.reload();
}}
```

## 📝 注意事项

1. **Logo 图片**：需要在 `public/logo.svg` 放置品牌 Logo
2. **协议页面**：需要创建用户协议和隐私政策页面
3. **后端接口**：需要对接实际的登录接口
4. **微信登录**：需要在微信开放平台申请应用

## 🔗 相关文档

- [Ant Design Modal](https://ant.design/components/modal-cn)
- [微信开放平台](https://open.weixin.qq.com/)
- [手机号验证码登录最佳实践](https://developers.weixin.qq.com/)

## 💡 最佳实践

### 1. 全局状态管理
```tsx
import { useModel } from '@umijs/max';

const App = () => {
  const { setInitialState } = useModel('@@initialState');

  const handleLoginSuccess = async () => {
    // 获取用户信息
    const userInfo = await getCurrentUser();
    
    // 更新全局状态
    setInitialState((s) => ({
      ...s,
      currentUser: userInfo,
    }));
  };

  return (
    <LoginModal
      visible={visible}
      onCancel={() => setVisible(false)}
      onSuccess={handleLoginSuccess}
    />
  );
};
```

### 2. 错误处理
```tsx
const handleMobileLogin = async (values) => {
  try {
    const response = await smsLogin(values);
    if (response.success) {
      message.success('登录成功');
      onSuccess?.();
    } else {
      message.error(response.message || '登录失败');
    }
  } catch (error) {
    message.error('网络错误，请稍后重试');
  }
};
```

### 3. 路由守卫配合
```tsx
// app.tsx 中配置
export const getInitialState = async () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // 已登录，获取用户信息
    const currentUser = await fetchUserInfo();
    return { currentUser };
  }
  
  // 未登录，返回空状态
  return { currentUser: undefined };
};
```

## 🎉 更新日志

### v1.0.0 (2026-01-24)
- ✨ 初始版本发布
- 🎨 支持微信扫码登录和手机号登录
- 📱 响应式布局设计
- 🔄 便捷的登录方式切换
- 📄 用户协议提示
