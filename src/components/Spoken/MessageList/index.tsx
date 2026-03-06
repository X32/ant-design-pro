/**
 * MessageList 消息列表组件
 * 负责渲染消息列表、自动滚动、图片放大等功能
 */

import React, { useEffect, useRef } from 'react';
import type { Message, MessageListProps } from '@/types/spoken';
import MessageBubble from '../MessageBubble';
import './index.less';

interface ExtendedMessageListProps extends MessageListProps {
  /** 消息列表 */
  messages: Message[];
  /** 正在播放的消息 ID */
  playingMessageId?: string | null;
  /** 播放音频回调 */
  onPlayAudio?: (messageId: string) => void;
  /** 暂停音频回调 */
  onPauseAudio?: (messageId: string) => void;
  /** 显示语法反馈回调 */
  onShowGrammarFeedback?: (message: Message) => void;
  /** 图片放大状态 */
  expandedImages?: Set<string>;
  /** 图片放大切换回调 */
  onImageToggle?: (messageId: string) => void;
  /** 是否自动滚动 */
  autoScroll?: boolean;
}

/**
 * MessageList 组件
 *
 * @example
 * ```tsx
 * <MessageList
 *   messages={messages}
 *   playingMessageId={playingMessageId}
 *   onPlayAudio={handlePlayAudio}
 *   onShowGrammarFeedback={handleShowGrammar}
 *   autoScroll={true}
 * />
 * ```
 */
export const MessageList: React.FC<ExtendedMessageListProps> = ({
  messages,
  playingMessageId,
  onPlayAudio,
  onPauseAudio,
  onShowGrammarFeedback,
  expandedImages = new Set(),
  onImageToggle,
  autoScroll = true,
}) => {
  /** 列表底部引用，用于自动滚动 */
  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * 自动滚动到最新消息
   */
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      const timer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages, autoScroll]);

  /**
   * 处理图片点击
   */
  const handleImageClick = (messageId: string) => {
    onImageToggle?.(messageId);
  };

  /**
   * 处理语法反馈点击
   */
  const handleGrammarFeedbackClick = (message: Message) => {
    onShowGrammarFeedback?.(message);
  };

  /**
   * 处理播放音频
   */
  const handlePlayAudio = (messageId: string) => {
    onPlayAudio?.(messageId);
  };

  /**
   * 处理暂停音频
   */
  const handlePauseAudio = (messageId: string) => {
    onPauseAudio?.(messageId);
  };

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isPlaying = playingMessageId === message.id;
        const isImageExpanded = expandedImages.has(message.id);

        return (
          <div
            key={message.id}
            className={`message-item ${message.sender} ${
              isImageExpanded ? 'image-expanded' : ''
            }`}
          >
            <MessageBubble
              message={message}
              isPlaying={isPlaying}
              onPlay={() => handlePlayAudio(message.id)}
              onPause={() => handlePauseAudio(message.id)}
              onImageClick={() => handleImageClick(message.id)}
              onGrammarFeedbackClick={() => handleGrammarFeedbackClick(message)}
            />
          </div>
        );
      })}

      {/* 列表底部标记，用于自动滚动 */}
      <div ref={bottomRef} className="message-list-bottom" />
    </div>
  );
};

export default MessageList;
