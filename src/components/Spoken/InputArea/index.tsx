/**
 * InputArea 输入区域组件
 * 支持文本输入和语音录制切换
 */

import { AudioOutlined, KeyOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Space, Tooltip } from 'antd';
import React from 'react';
import type { InputAreaProps } from '@/types/spoken';
import './index.less';

const { TextArea } = Input;

/**
 * InputArea 组件
 *
 * @example
 * ```tsx
 * <InputArea
 *   inputValue={inputValue}
 *   isRecording={isRecording}
 *   showTextInput={showTextInput}
 *   onInputChange={setInputValue}
 *   onSend={handleSend}
 *   onStartRecording={handleStartRecording}
 *   onToggleTextInput={toggleTextInput}
 * />
 * ```
 */
export const InputArea: React.FC<InputAreaProps> = ({
  inputValue,
  isRecording,
  showTextInput,
  disabled = false,
  onInputChange,
  onSend,
  onStartRecording,
  onToggleTextInput,
}) => {
  /**
   * 处理发送按钮点击
   */
  const handleSendClick = () => {
    if (inputValue.trim() && !disabled) {
      onSend?.();
    }
  };

  /**
   * 处理键盘事件（Enter 发送）
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="input-area">
      <div className="input-area-inner">
        {/* 文本输入区域 */}
        {showTextInput && (
          <div className="text-input-wrapper">
            <TextArea
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Shift+Enter 换行)"
              autoSize={{ minRows: 2, maxRows: 4 }}
              disabled={disabled || isRecording}
              className="message-textarea"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendClick}
              disabled={!inputValue.trim() || disabled || isRecording}
              className="send-button"
            >
              发送
            </Button>
          </div>
        )}

        {/* 控制按钮区域 */}
        <div className="control-buttons">
          <Space size="middle">
            {/* 录音按钮 */}
            <Tooltip title={isRecording ? '正在录音...' : '点击开始录音'}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={isRecording ? <AudioOutlined spin /> : <AudioOutlined />}
                onClick={onStartRecording}
                disabled={disabled}
                className={`record-button ${isRecording ? 'recording' : ''}`}
                style={{
                  width: '60px',
                  height: '60px',
                  fontSize: '24px',
                }}
              />
            </Tooltip>

            {/* 切换文本输入按钮 */}
            <Tooltip title={showTextInput ? '隐藏文本输入' : '显示文本输入'}>
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={<KeyOutlined />}
                onClick={onToggleTextInput}
                disabled={disabled || isRecording}
                className={`toggle-text-button ${showTextInput ? 'active' : ''}`}
                style={{
                  width: '45px',
                  height: '45px',
                  fontSize: '18px',
                }}
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* 录音状态提示 */}
      {isRecording && (
        <div className="recording-status">
          <span className="recording-indicator" />
          <span>正在录音... 再次点击停止</span>
        </div>
      )}
    </div>
  );
};

export default InputArea;
