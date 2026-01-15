import React from 'react';
import { Avatar, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  WalletOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { flushSync } from 'react-dom';
import { outLogin } from '@/services/ant-design-pro/api';
import { TOKEN_KEY } from '@/config/apiConfig';
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
}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  /**
   * 退出登录
   */
  const handleLogout = async () => {
    try {
      // 调用后端退出接口
      await outLogin();
      
      // 清除本地存储的token
      localStorage.removeItem(TOKEN_KEY);
      
      // 清空用户信息
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      
      // 跳转到登录页
      const { search, pathname } = window.location;
      const searchParams = new URLSearchParams({
        redirect: pathname + search,
      });
      
      history.replace({
        pathname: '/user/login',
        search: searchParams.toString(),
      });
    } catch (error) {
      console.error('退出登录失败:', error);
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
        <span className="user-name">{currentUser.name}</span>
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
