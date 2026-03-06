/**
 * ConversationHeader 会话头部组件
 * 提供返回按钮、标题、连接状态、VIP 状态和用户头像
 */

import {
  ArrowLeftOutlined,
  WifiOutlined as WifiOffOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Space, Tag } from 'antd';
import React from 'react';
import UserAvatar from '@/components/UserAvatar';
import type { ConversationHeaderProps } from '@/types/spoken';
import './index.less';

interface ExtendedConversationHeaderProps extends ConversationHeaderProps {
  /** 标题文字 */
  title?: string;
  /** 是否显示连接状态 */
  showConnectionStatus?: boolean;
  /** 是否显示用户头像 */
  showAvatar?: boolean;
  /** 返回按钮点击回调 */
  onBack?: () => void;
  /** 清理资源回调（音频等） */
  onCleanup?: () => void;
}

/**
 * ConversationHeader 组件
 *
 * @example
 * ```tsx
 * <ConversationHeader
 *   isConnected={isConnected}
 *   hasVipSubscription={hasVipSubscription}
 *   vipRemainingDays={vipRemainingDays}
 *   title="AI 口语练习"
 *   onBack={() => history.back()}
 * />
 * ```
 */
export const ConversationHeader: React.FC<ExtendedConversationHeaderProps> = ({
  isConnected = true,
  hasVipSubscription = false,
  vipRemainingDays = 0,
  workflowType,
  title = 'AI 口语练习',
  showConnectionStatus = true,
  showAvatar = true,
  onBack,
  onCleanup,
}) => {
  /**
   * 处理返回按钮点击
   */
  const handleBack = () => {
    console.log('🔙 点击返回按钮');

    // 清理资源
    onCleanup?.();

    // 清除 conversationId
    const CONVERSATION_ID_KEY = 'spoken_conversation_id';
    localStorage.removeItem(CONVERSATION_ID_KEY);

    // 执行自定义回调或使用默认行为
    if (onBack) {
      onBack();
    } else {
      history.back();
    }
  };

  return (
    <header className="conversation-header">
      <div className="header-left">
        {/* 返回按钮 */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined className="back-icon" />}
          onClick={handleBack}
          className="back-button"
        >
          返回
        </Button>
      </div>

      <div className="header-center">
        <h1 className="app-title">{title}</h1>

        {/* 工作流类型标签（如果有） */}
        {workflowType && (
          <Tag color="blue" className="workflow-tag">
            {workflowType}
          </Tag>
        )}

        {/* 连接状态指示器 */}
        {showConnectionStatus && (
          <div
            className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
          >
            <WifiOutlined className="connection-icon" />
            <span className="connection-text">
              {isConnected ? '已连接' : '未连接'}
            </span>
          </div>
        )}
      </div>

      <div className="header-right">
        <Space size="middle">
          {/* VIP 状态 */}
          {hasVipSubscription && vipRemainingDays > 0 && (
            <Tag color="gold" className="vip-tag">
              💎 VIP 剩余{vipRemainingDays}天
            </Tag>
          )}

          {/* 用户头像 */}
          {showAvatar && <UserAvatar showName={false} size={40} />}
        </Space>
      </div>
    </header>
  );
};

export default ConversationHeader;
