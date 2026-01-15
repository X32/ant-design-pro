# UserAvatar 用户头像组件使用文档

## 组件概述

`UserAvatar` 是一个通用的用户头像组件，支持显示用户头像、用户名，并提供下拉菜单功能。可以在多个页面中复用。

## 功能特性

- ✅ 显示用户头像（自动取用户名首字母）
- ✅ 可选择是否显示用户名
- ✅ 支持自定义头像大小
- ✅ 内置下拉菜单（个人中心、我的练习记录、充值中心、个人设置、退出登录）
- ✅ 支持自定义菜单项
- ✅ 支持自定义菜单点击事件
- ✅ 响应式设计（移动端自动隐藏用户名）
- ✅ 自动处理登录/登出逻辑

## 基本使用

### 1. 导入组件

```tsx
import { UserAvatar } from '@/components';
```

### 2. 最简单的使用方式

```tsx
// 默认显示用户名，使用默认菜单
<UserAvatar />
```

## API 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| showName | 是否显示用户名 | `boolean` | `true` |
| className | 自定义样式类名 | `string` | `''` |
| size | 头像大小 | `number \| 'large' \| 'small' \| 'default'` | `'default'` |
| showMenu | 是否显示下拉菜单 | `boolean` | `true` |
| menuItems | 自定义菜单项 | `MenuProps['items']` | - |
| onMenuClick | 自定义菜单点击事件 | `(key: string) => void` | - |

## 使用示例

### 示例 1: 默认用法（显示用户名 + 默认菜单）

```tsx
<UserAvatar />
```

### 示例 2: 只显示头像，不显示用户名

```tsx
<UserAvatar showName={false} />
```

### 示例 3: 自定义头像大小

```tsx
// 小号头像
<UserAvatar size="small" />

// 大号头像
<UserAvatar size="large" />

// 自定义数字大小
<UserAvatar size={48} />
```

### 示例 4: 不显示菜单（纯展示）

```tsx
<UserAvatar showMenu={false} />
```

### 示例 5: 自定义菜单项

```tsx
const customMenuItems = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人资料',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '账号设置',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出',
    danger: true,
  },
];

<UserAvatar menuItems={customMenuItems} />
```

### 示例 6: 自定义菜单点击事件

```tsx
const handleMenuClick = (key: string) => {
  switch (key) {
    case 'profile':
      message.info('查看个人资料');
      break;
    case 'settings':
      message.info('打开设置');
      break;
    case 'logout':
      // 自定义退出逻辑
      Modal.confirm({
        title: '确定要退出吗？',
        onOk: () => {
          // 执行退出
        },
      });
      break;
    default:
      break;
  }
};

<UserAvatar onMenuClick={handleMenuClick} />
```

### 示例 7: 在页面导航栏中使用

```tsx
const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;

  return (
    <div className="page-header">
      <div className="logo">我的网站</div>
      <div className="header-actions">
        {isLoggedIn ? (
          <UserAvatar showName size="large" />
        ) : (
          <Button type="primary" onClick={() => history.push('/login')}>
            登录
          </Button>
        )}
      </div>
    </div>
  );
};
```

## 默认菜单项

组件内置的默认菜单项包括：

1. **个人中心** - 跳转到 `/account/center`
2. **我的练习记录** - 跳转到 `/messages/userpractice`
3. **充值中心** - 跳转到 `/orders/recharge`
4. **个人设置** - 跳转到 `/account/settings`
5. **退出登录** - 执行退出逻辑并跳转到登录页

## 注意事项

1. **登录状态检测**
   - 组件会自动检测用户登录状态
   - 如果用户未登录，组件会返回 `null`（不显示）

2. **响应式设计**
   - 在移动端（屏幕宽度 < 768px），用户名会自动隐藏
   - 只显示头像，节省空间

3. **退出登录**
   - 默认退出行为会：
     - 调用后端退出接口
     - 清除本地 token
     - 清空用户状态
     - 跳转到登录页并保留重定向地址

4. **自定义事件优先级**
   - 如果提供了 `onMenuClick` 属性，会优先使用自定义事件
   - 只有在未提供自定义事件时，才会使用默认行为

## 完整示例：在多个页面中使用

### 页面 A：Home 页面

```tsx
import { UserAvatar } from '@/components';

const HomePage: React.FC = () => {
  return (
    <div className="home-header">
      <div className="logo">Logo</div>
      <UserAvatar showName size="large" />
    </div>
  );
};
```

### 页面 B：Dashboard 页面

```tsx
import { UserAvatar } from '@/components';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="sidebar">
        <UserAvatar showName={false} size={40} />
      </div>
      <div className="content">
        {/* 内容 */}
      </div>
    </div>
  );
};
```

### 页面 C：移动端页面

```tsx
import { UserAvatar } from '@/components';

const MobilePage: React.FC = () => {
  return (
    <div className="mobile-header">
      <div className="title">标题</div>
      {/* 移动端自动隐藏用户名 */}
      <UserAvatar size="small" />
    </div>
  );
};
```

## 样式自定义

可以通过 `className` 属性添加自定义样式：

```tsx
<UserAvatar className="custom-avatar" />
```

```less
.custom-avatar {
  .user-name {
    color: #fff;
    font-weight: bold;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
```
