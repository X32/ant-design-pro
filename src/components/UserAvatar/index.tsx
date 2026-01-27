import React from 'react';
import { Avatar, Dropdown, Space, App } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  WalletOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, CONVERSATION_ID_KEY } from '@/config/apiConfig';
import './index.less';

export interface UserAvatarProps {
  /** 是否显示用户名 */
  showName?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 头像大小 */
  size?: number | 'large' | 'small' | 'default';
  /** 是否显示菜单（默认显示） */
  showMenu?: boolean;
  /** 自定义菜单项 */
  menuItems?: MenuProps['items'];
  /** 自定义菜单点击事件 */
  onMenuClick?: (key: string) => void;
  /** 退出登录后的回调（用于打开登录弹框） */
  onLogout?: () => void;
}

/**
 * 用户头像组件
 * 可在多个页面复用，包含用户信息显示和下拉菜单
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  showName = true,
  className = '',
  size = 'default',
  showMenu = true,
  menuItems,
  onMenuClick,
  onLogout,
}) => {
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  /**
   * 退出登录
   */
  const handleLogout = () => {
    // 清除所有认证相关的 localStorage 数据
    const keysToRemove = [
      TOKEN_KEY,              // access_token
      REFRESH_TOKEN_KEY,      // refresh_token
      USER_ID_KEY,            // user_id
      CONVERSATION_ID_KEY,    // current_conversation_id
      'wechat_state',         // 微信登录状态（如果有）
      'wechat_openid',        // 微信 openid（如果有）
      'wechat_unionid',       // 微信 unionid（如果有）
      'sms_send_history',     // 短信发送历史
    ];
    
    // 逐个删除指定的 key
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // 清除全局用户状态
    if (setInitialState) {
      setInitialState((s) => ({
        ...s,
        currentUser: undefined,
      }));
    }
    
    message.success('已退出登录');
    
    // 如果有自定义退出回调（用于打开登录弹框），执行回调
    if (onLogout) {
      onLogout();
    } else {
      // 默认行为：跳转到首页
      setTimeout(() => {
        history.push('/home');
      }, 300);
    }
  };

  /**
   * 菜单点击事件
   */
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // 优先使用自定义点击事件
    if (onMenuClick) {
      onMenuClick(key);
      return;
    }

    // 默认行为
    switch (key) {
      case 'center':
        history.push('/user/profile');
        break;
    //   case 'settings':
    //     history.push('/account/settings');
    //     break;
      case 'recharge':
        history.push('/orders/recharge');
        break;
      case 'practice':
        history.push('/messages/userpractice');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // 默认菜单项
  const defaultMenuItems: MenuProps['items'] = [
    {
      key: 'center',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'practice',
      icon: <TrophyOutlined />,
      label: '我的练习记录',
    },
    {
      key: 'recharge',
      icon: <WalletOutlined />,
      label: '充值中心',
    },
    {
      type: 'divider',
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: '个人设置',
    // },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  // 如果没有用户信息，返回 null
  if (!currentUser) {
    return null;
  }

  // 获取用户名首字母作为头像
  const avatarText = currentUser.name?.charAt(0).toUpperCase() || 'U';

  // 截断用户名：最多显示5个字符
  const truncateName = (name: string | undefined, maxLength: number = 5): string => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
  };

  const displayName = truncateName(currentUser.name);

  // 用户头像内容
  const avatarContent = (
    <Space className={`user-avatar-container ${className}`} size={8}>
      <Avatar 
        size={size} 
        style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
        icon={<UserOutlined />}
      >
        {avatarText}
      </Avatar>
      {showName && (
        <span className="user-name" title={currentUser.name}>
          {displayName}
        </span>
      )}
    </Space>
  );

  // 如果不显示菜单，直接返回头像
  if (!showMenu) {
    return avatarContent;
  }

  // 返回带下拉菜单的头像
  return (
    <Dropdown
      menu={{
        items: menuItems || defaultMenuItems,
        onClick: handleMenuClick,
      }}
      placement="bottomRight"
      arrow
    >
      {avatarContent}
    </Dropdown>
  );
};

export default UserAvatar;
