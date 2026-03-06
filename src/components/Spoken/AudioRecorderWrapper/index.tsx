/**
 * AudioRecorderWrapper 录音组件封装
 * 集成 AudioRecorderInline，处理录音完成、取消、开始等逻辑
 */

import { App } from 'antd';
import React, { useState } from 'react';
import AudioRecorderInline from '@/pages/AudioRecorder06/AudioRecorderInline';
import type { AudioRecorderWrapperProps, Message } from '@/types/spoken';

interface ExtendedAudioRecorderWrapperProps extends AudioRecorderWrapperProps {
  /** 对话是否已结束 */
  conversationFinished?: boolean;
  /** 添加消息到列表 */
  onAddMessage?: (message: Message) => void;
  /** 更新消息服务器路径 */
  onUpdateMessageServerPath?: (messageId: string, serverPath: string) => void;
  /** 检查余额 */
  onCheckBalance?: () => Promise<{
    sufficient: boolean;
    balance: number;
    price: number;
  }>;
  /** 上传音频到服务器 */
  onUploadAudio?: (
    audioBlob: Blob,
    filename: string,
  ) => Promise<{ filePath: string }>;
  /** 生成消息 ID */
  generateMessageId?: () => string;
  /** 当前消息列表长度（用于计算轮次） */
  messagesLength?: number;
}

/**
 * AudioRecorderWrapper 组件
 *
 * @example
 * ```tsx
 * <AudioRecorderWrapper
 *   conversationFinished={conversationFinished}
 *   onAddMessage={handleAddMessage}
 *   onUploadAudio={handleUploadAudio}
 *   onFinish={handleRecordFinish}
 *   onCancel={handleRecordCancel}
 * />
 * ```
 */
export const AudioRecorderWrapper: React.FC<
  ExtendedAudioRecorderWrapperProps
> = ({
  conversationFinished = false,
  onAddMessage,
  onUpdateMessageServerPath,
  onCheckBalance,
  onUploadAudio,
  generateMessageId,
  messagesLength = 0,
  onStart,
  onCancel,
  onFinish,
}) => {
  const { message: messageApi } = App.useApp();
  const [balanceChecked, setBalanceChecked] = useState(false);

  /**
   * 处理录音完成
   */
  const handleFinish = async (filePath: string, audioBlob: Blob) => {
    console.log('🎤 录音完成:', filePath);

    // 🚫 对话结束后不允许录音
    if (conversationFinished) {
      console.warn('⚠️ 对话已结束，不能录音');
      messageApi.warning('对话已结束，不能录音');
      return;
    }

    // 💰 首次操作时检查余额
    if (!balanceChecked && onCheckBalance) {
      console.log('💰 首次录音，检查余额...');
      const balanceCheck = await onCheckBalance();
      setBalanceChecked(true);

      if (!balanceCheck.sufficient) {
        console.warn('⚠️ 余额不足，终止录音操作');
        messageApi.error('余额不足，请充值后再试');
        return;
      }
    }

    // 通知父组件录音完成
    onFinish?.(filePath, audioBlob);

    // 添加消息到列表（如果需要）
    if (onAddMessage && generateMessageId) {
      const now = new Date();
      const newMessage: Message = {
        id: generateMessageId(),
        content: '（语音消息）',
        sender: 'user',
        timestamp: now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        fullTimestamp: now,
        audioFilePath: filePath,
        messageType: 'voice',
        transcriptionStatus: 'pending',
        transcriptionText: '转写中...',
        roundNum: Math.floor(messagesLength / 2) + 1,
      };

      onAddMessage(newMessage);

      // 上传音频到服务器
      if (onUploadAudio && onUpdateMessageServerPath) {
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `recording_${timestamp}.wav`;
          const uploadResult = await onUploadAudio(audioBlob, filename);

          if (uploadResult && uploadResult.filePath) {
            console.log('音频上传成功，服务器路径:', uploadResult.filePath);
            onUpdateMessageServerPath(newMessage.id, uploadResult.filePath);
          }
        } catch (error) {
          console.error('音频上传失败:', error);
          messageApi.error('音频上传失败，请重试');
        }
      }
    }

    // 通知开始回调（如果需要更新状态）
    onStart?.();
  };

  /**
   * 处理录音取消
   */
  const handleCancel = () => {
    console.log('🚫 录音已取消');
    onCancel?.();
  };

  /**
   * 处理录音开始
   */
  const handleStart = () => {
    console.log('🎤 开始录音');
    onStart?.();
  };

  return (
    <AudioRecorderInline
      onFinish={handleFinish}
      onCancel={handleCancel}
      onStart={handleStart}
    />
  );
};

export default AudioRecorderWrapper;
