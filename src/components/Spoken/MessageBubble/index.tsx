/**
 * MessageBubble 消息气泡组件
 * 支持多种消息类型：text, voice, image, score, grammar_feedback, finish
 */

import {
  FileTextOutlined,
  PauseOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import type {
  GrammarFeedbackContent,
  Message,
  ScoreContent,
} from '@/types/spoken';
import './index.less';

interface MessageBubbleProps {
  message: Message;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onImageClick?: () => void;
  onGrammarFeedbackClick?: () => void;
}

/**
 * 渲染文本内容
 */
const renderTextContent = (content: string) => {
  return (
    <div
      className="text-content"
      style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
    >
      {content}
    </div>
  );
};

/**
 * 渲染语音消息
 */
const renderVoiceMessage = (
  message: Message,
  isPlaying: boolean,
  onPlay: () => void,
  onPause: () => void,
) => {
  return (
    <div className="voice-message-content">
      <Button
        type="primary"
        shape="circle"
        icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
        onClick={isPlaying ? onPause : onPlay}
        size="large"
        style={{
          width: '50px',
          height: '50px',
          fontSize: '20px',
        }}
      />
      {message.transcriptionText && (
        <div
          className="transcription-text"
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '13px',
            lineHeight: '1.5',
            color:
              message.transcriptionStatus === 'failed' ? '#ff4d4f' : '#ffffff',
          }}
        >
          {message.transcriptionStatus === 'pending' && '🔄 '}
          {message.transcriptionStatus === 'done' && '✅ '}
          {message.transcriptionStatus === 'failed' && '❌ '}
          {message.transcriptionText}
        </div>
      )}
    </div>
  );
};

/**
 * 渲染图片消息
 */
const renderImageMessage = (message: Message, onImageClick: () => void) => {
  const isExpanded = message.imageUrl ? true : false;

  return (
    <div className="image-message-content">
      <img
        src={message.imageUrl}
        alt="图片消息"
        onClick={onImageClick}
        style={{
          width: '300px',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'block',
          objectFit: 'contain',
        }}
      />
      <div
        style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
        }}
      >
        点击放大
      </div>
    </div>
  );
};

/**
 * 渲染评分消息
 */
const renderScoreMessage = (message: Message) => {
  const content = message.content as ScoreContent;

  return (
    <div className="score-message-content">
      {/* 标题 */}
      <div className="score-title">
        <span style={{ fontSize: '24px' }}>📊</span>
        <span>口语评分结果</span>
      </div>

      {/* 总分 */}
      {message.score && (
        <div className="score-total">总分：{message.score}</div>
      )}

      {typeof content === 'object' && content !== null && (
        <div className="score-details">
          {/* 维度分数 */}
          {content.dimensionScores && (
            <div className="score-section">
              <div className="score-section-title">📈 各维度评分</div>
              <div className="score-section-content">
                {content.dimensionScores}
              </div>
            </div>
          )}

          {/* 总分行 */}
          {content.totalScore && (
            <div className="score-total-row">{content.totalScore}</div>
          )}

          {/* 优势 */}
          {content.advantages && (
            <div className="score-section">
              <div className="score-section-title success">
                <span>✅</span>
                <span>优势</span>
              </div>
              <div className="score-section-content highlight">
                {content.advantages}
              </div>
            </div>
          )}

          {/* 不足 */}
          {content.disadvantages && (
            <div className="score-section">
              <div className="score-section-title warning">
                <span>⚠️</span>
                <span>不足</span>
              </div>
              <div className="score-section-content highlight">
                {content.disadvantages}
              </div>
            </div>
          )}

          {/* 改进建议 */}
          {content.suggestions && (
            <div className="score-section">
              <div className="score-section-title info">
                <span>💡</span>
                <span>改进建议</span>
              </div>
              <div className="score-section-content highlight">
                {content.suggestions}
              </div>
            </div>
          )}

          {/* 改进的回答 */}
          {content.improvedAnswer && (
            <div className="score-section">
              <div className="score-section-title primary">
                <span>📝</span>
                <span>改进的回答</span>
              </div>
              <div className="score-section-content highlight">
                {content.improvedAnswer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 渲染语法反馈消息
 */
const renderGrammarFeedbackMessage = (
  message: Message,
  onGrammarFeedbackClick: () => void,
) => {
  const feedback = message.grammarFeedback;
  if (!feedback) return null;

  const errorCount = feedback.errors?.length || 0;

  return (
    <div className="grammar-feedback-message-content">
      <div
        style={{
          padding: '12px',
          backgroundColor: '#f6ffed',
          borderRadius: '8px',
          border: '1px solid #b7eb8f',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            color: '#52c41a',
            marginBottom: '8px',
            fontWeight: 'bold',
          }}
        >
          📝 语法反馈已生成
        </div>
        <Button
          type="primary"
          size="small"
          icon={<FileTextOutlined />}
          onClick={onGrammarFeedbackClick}
          style={{
            backgroundColor: '#52c41a',
            borderColor: '#52c41a',
            fontSize: '12px',
          }}
        >
          查看语法反馈 ({errorCount} 个错误)
        </Button>
      </div>
    </div>
  );
};

/**
 * 渲染结束消息
 */
const renderFinishMessage = (message: Message) => {
  return (
    <div className="finish-message-content">
      <div
        style={{
          padding: '16px',
          backgroundColor: '#fff7e6',
          borderRadius: '12px',
          border: '1px solid #ffd591',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
          🎉 对话已结束
        </div>
        {typeof message.content === 'string' && (
          <div style={{ marginTop: '8px', color: '#666' }}>
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * MessageBubble 主组件
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isPlaying = false,
  onPlay,
  onPause,
  onImageClick,
  onGrammarFeedbackClick,
}) => {
  const renderContent = () => {
    // 文本消息
    if (
      message.messageType === 'text' ||
      (!message.messageType && typeof message.content === 'string')
    ) {
      return renderTextContent(message.content as string);
    }

    // 语音消息
    if (message.messageType === 'voice') {
      return renderVoiceMessage(
        message,
        isPlaying,
        onPlay || (() => {}),
        onPause || (() => {}),
      );
    }

    // 图片消息
    if (message.messageType === 'image' && message.imageUrl) {
      return renderImageMessage(message, onImageClick || (() => {}));
    }

    // 评分消息
    if (message.messageType === 'score') {
      return renderScoreMessage(message);
    }

    // 语法反馈消息
    if (
      message.messageType === 'grammar_feedback' &&
      message.grammarFeedbackStatus === 'received'
    ) {
      return renderGrammarFeedbackMessage(
        message,
        onGrammarFeedbackClick || (() => {}),
      );
    }

    // 结束消息
    if (message.messageType === 'finish') {
      return renderFinishMessage(message);
    }

    // 默认渲染文本
    if (typeof message.content === 'string') {
      return renderTextContent(message.content);
    }

    // 未知类型
    return <div className="unknown-message-content">未知消息类型</div>;
  };

  return (
    <div className={`message-bubble ${message.sender}`}>
      <div className="message-content-wrapper">{renderContent()}</div>
      <div className="message-time">{message.timestamp}</div>
    </div>
  );
};

export default MessageBubble;
