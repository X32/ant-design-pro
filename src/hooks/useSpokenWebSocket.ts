/**
 * useSpokenWebSocket Hook
 * 管理 WebSocket 连接、认证、消息处理和自动重连
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOKEN_KEY } from '@/config/apiConfig';
import webSocketService from '@/services/WebSocket/websocket';
import type {
  GrammarFeedbackContent,
  Message,
  MessageType,
  ScoreContent,
  WebSocketMessageData,
} from '@/types/spoken';

interface RetryStatus {
  isRetrying: boolean;
  attempt: number;
  maxRetries: number;
  interval: number;
  maxRetriesReached: boolean;
}

interface UseSpokenWebSocketOptions {
  /** 会话 ID */
  conversationId: number | null;
  /** 收到消息时的回调 */
  onMessageReceived?: (message: Message) => void;
  /** 连接状态变化回调 */
  onConnectionChange?: (connected: boolean) => void;
  /** 认证状态变化回调 */
  onAuthenticationChange?: (authenticated: boolean) => void;
  /** 最大重连次数 */
  maxRetries?: number;
  /** 重连间隔（毫秒） */
  retryInterval?: number;
}

interface UseSpokenWebSocketReturn {
  /** 是否已连接 */
  isConnected: boolean;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在重连 */
  isRetrying: boolean;
  /** 当前重连尝试次数 */
  retryAttempt: number;
  /** 是否已达到最大重连次数 */
  maxRetriesReached: boolean;
  /** 发送消息 */
  sendMessage: (data: any) => void;
  /** 断开连接 */
  disconnect: () => void;
  /** 重连 */
  reconnect: () => void;
}

/**
 * WebSocket Hook for Spoken Practice
 *
 * @example
 * ```tsx
 * const {
 *   isConnected,
 *   isAuthenticated,
 *   sendMessage,
 *   disconnect,
 * } = useSpokenWebSocket({
 *   conversationId,
 *   onMessageReceived: handleNewMessage,
 * });
 * ```
 */
export function useSpokenWebSocket({
  conversationId,
  onMessageReceived,
  onConnectionChange,
  onAuthenticationChange,
  maxRetries = 5,
  retryInterval = 3000,
}: UseSpokenWebSocketOptions): UseSpokenWebSocketReturn {
  /** 是否已连接 */
  const [isConnected, setIsConnected] = useState(false);

  /** 是否已认证 */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /** 重连状态 */
  const [retryStatus, setRetryStatus] = useState<RetryStatus>({
    isRetrying: false,
    attempt: 0,
    maxRetries,
    interval: 0,
    maxRetriesReached: false,
  });

  /** WebSocket 实例引用 */
  const socketRef = useRef<any>(null);

  /** 重连定时器引用 */
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  /** 消息序号 */
  const messageSeqRef = useRef(0);

  /**
   * 处理收到的消息
   */
  const handleIncomingMessage = useCallback(
    (data: WebSocketMessageData) => {
      console.log('📨 收到 WebSocket 消息:', data);

      const message: Partial<Message> = {
        id: Date.now().toString(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        fullTimestamp: new Date(),
      };

      // 根据消息类型处理
      switch (data.message_type) {
        case 'text':
          message.messageType = 'text';
          message.content = data.text || '';
          break;

        case 'voice':
          message.messageType = 'voice';
          message.content = data.text || '';
          message.audioUrl = data.audio_path;
          message.transcriptionText = data.text;
          message.transcriptionStatus = 'pending';
          break;

        case 'image':
          message.messageType = 'image';
          message.content = '图片消息';
          message.imageUrl = data.image_path;
          break;

        case 'score':
          message.messageType = 'score';
          message.content = data.score_content as ScoreContent;
          message.score = (data.score_content as ScoreContent)?.totalScore;
          break;

        case 'grammar_feedback':
          message.messageType = 'grammar_feedback';
          message.grammarFeedback =
            data.grammar_feedback as GrammarFeedbackContent;
          message.grammarFeedbackStatus = 'received';
          message.originMessageId = data.seq;
          break;

        case 'finish':
          message.messageType = 'finish';
          message.content = data.text || '对话已结束';
          break;

        default:
          message.messageType = 'text';
          message.content = data.text || '未知消息类型';
      }

      onMessageReceived?.(message as Message);
    },
    [onMessageReceived],
  );

  /**
   * 连接 WebSocket
   */
  const connect = useCallback(() => {
    if (!conversationId) {
      console.warn('⚠️ 未提供 conversationId，无法连接 WebSocket');
      return;
    }

    try {
      console.log('🔌 开始连接 WebSocket, conversationId:', conversationId);

      // 使用 webSocketService 连接
      const socket = webSocketService.connect(conversationId, {
        onOpen: () => {
          console.log('✅ WebSocket 连接成功');
          setIsConnected(true);
          setIsAuthenticated(true);
          setRetryStatus((prev) => ({
            ...prev,
            isRetrying: false,
            attempt: 0,
            maxRetriesReached: false,
          }));
          onConnectionChange?.(true);
          onAuthenticationChange?.(true);
        },

        onMessage: (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            handleIncomingMessage(data);
          } catch (error) {
            console.error('解析 WebSocket 消息失败:', error);
          }
        },

        onError: (error: any) => {
          console.error('❌ WebSocket 错误:', error);
          setIsConnected(false);
          onConnectionChange?.(false);
        },

        onClose: () => {
          console.log('🔌 WebSocket 连接关闭');
          setIsConnected(false);
          setIsAuthenticated(false);
          onConnectionChange?.(false);
          onAuthenticationChange?.(false);

          // 自动重连
          if (
            !retryStatus.maxRetriesReached &&
            retryStatus.attempt < maxRetries
          ) {
            const nextAttempt = retryStatus.attempt + 1;
            console.log(`🔄 尝试重连 (${nextAttempt}/${maxRetries})...`);

            setRetryStatus((prev) => ({
              ...prev,
              isRetrying: true,
              attempt: nextAttempt,
              interval: retryInterval,
            }));

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, retryInterval);
          } else {
            console.error('❌ 已达到最大重连次数，停止重连');
            setRetryStatus((prev) => ({
              ...prev,
              isRetrying: false,
              maxRetriesReached: true,
            }));
          }
        },
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('连接 WebSocket 失败:', error);
      setIsConnected(false);
      onConnectionChange?.(false);
    }
  }, [
    conversationId,
    handleIncomingMessage,
    onConnectionChange,
    onAuthenticationChange,
    maxRetries,
    retryInterval,
    retryStatus.attempt,
    retryStatus.maxRetriesReached,
  ]);

  /**
   * 断开连接
   */
  const disconnect = useCallback(() => {
    console.log('🔌 断开 WebSocket 连接');

    // 清除重连定时器
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    // 断开 WebSocket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsAuthenticated(false);
    setRetryStatus({
      isRetrying: false,
      attempt: 0,
      maxRetries,
      interval: 0,
      maxRetriesReached: false,
    });
    onConnectionChange?.(false);
    onAuthenticationChange?.(false);
  }, [maxRetries, onConnectionChange, onAuthenticationChange]);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    (data: any) => {
      if (socketRef.current) {
        const seq = ++messageSeqRef.current;
        const messageData = {
          ...data,
          seq,
          conversation_id: conversationId,
        };
        console.log('📤 发送 WebSocket 消息:', messageData);
        socketRef.current.send(JSON.stringify(messageData));
      } else {
        console.warn('⚠️ WebSocket 未连接，无法发送消息');
      }
    },
    [conversationId],
  );

  /**
   * 重连
   */
  const reconnect = useCallback(() => {
    console.log('🔄 手动重连 WebSocket');
    setRetryStatus((prev) => ({
      ...prev,
      attempt: 0,
      maxRetriesReached: false,
    }));
    disconnect();
    setTimeout(() => connect(), 500);
  }, [connect, disconnect]);

  /**
   * 组件挂载时连接，卸载时断开
   */
  useEffect(() => {
    if (conversationId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  return {
    isConnected,
    isAuthenticated,
    isRetrying: retryStatus.isRetrying,
    retryAttempt: retryStatus.attempt,
    maxRetriesReached: retryStatus.maxRetriesReached,
    sendMessage,
    disconnect,
    reconnect,
  };
}

export default useSpokenWebSocket;
