/**
 * useConversationManager Hook
 * 管理口语练习会话的创建、加载、消息管理等核心逻辑
 */

import { useCallback, useRef, useState } from 'react';
import { CONVERSATION_ID_KEY } from '@/config/apiConfig';
import {
  createSpokenConversation,
  getSpokenMessages,
} from '@/services/ant-design-pro/api';
import type { Message, UseConversationManagerReturn } from '@/types/spoken';

interface UseConversationManagerOptions {
  /** 用户 ID */
  userId: string | null;
  /** 工作流类型 */
  workflowType?: string;
  /** 练习 ID */
  exerciseId?: number;
  /** 消息创建成功回调 */
  onMessageAdded?: (message: Message) => void;
}

/**
 * 会话管理 Hook
 *
 * @example
 * ```tsx
 * const {
 *   conversationId,
 *   messages,
 *   loading,
 *   createConversation,
 *   loadHistory,
 *   addMessage,
 * } = useConversationManager({
 *   userId,
 *   workflowType: 'fce_part1',
 * });
 * ```
 */
export function useConversationManager({
  userId,
  workflowType = 'fce_part1',
  exerciseId,
  onMessageAdded,
}: UseConversationManagerOptions): UseConversationManagerReturn {
  /** 会话 ID */
  const [conversationId, setConversationId] = useState<number | null>(null);

  /** 消息列表 */
  const [messages, setMessages] = useState<Message[]>([]);

  /** 加载状态 */
  const [loading, setLoading] = useState(false);

  /** 历史加载状态 */
  const [historyLoaded, setHistoryLoaded] = useState(false);

  /** 消息 ID 计数器 */
  const messageIdCounterRef = useRef(0);

  /**
   * 生成消息 ID
   */
  const generateMessageId = useCallback((): string => {
    return (
      Date.now().toString() + '-' + (messageIdCounterRef.current++).toString()
    );
  }, []);

  /**
   * 创建新会话
   */
  const createConversation = useCallback(async (): Promise<number | null> => {
    console.log('开始创建新会话...');
    setLoading(true);

    try {
      const createResponse = await createSpokenConversation({
        exercise_id: exerciseId,
        workflow_type: workflowType,
        title: `口语练习 - ${new Date().toLocaleString('zh-CN')}`,
      });

      if (createResponse.success && createResponse.data) {
        const newConversationId = createResponse.data.id;
        console.log('新会话创建成功，ID:', newConversationId);

        // 更新 localStorage
        localStorage.setItem(CONVERSATION_ID_KEY, newConversationId.toString());
        setConversationId(newConversationId);

        // 初始化为空消息列表
        setMessages([]);
        setHistoryLoaded(true);

        console.log('新会话已创建，等待用户发送消息');
        return newConversationId;
      } else {
        console.error('创建会话失败:', createResponse);
        setHistoryLoaded(true);
        return null;
      }
    } catch (error) {
      console.error('创建会话异常:', error);
      setHistoryLoaded(true);
      return null;
    } finally {
      setLoading(false);
    }
  }, [exerciseId, workflowType]);

  /**
   * 加载历史消息
   */
  const loadHistory = useCallback(
    async (id: number): Promise<number> => {
      console.log('加载历史消息，conversationId:', id);
      setLoading(true);

      try {
        const response = await getSpokenMessages(id, {
          limit: 100,
          include_scores: true,
          include_grammar_feedback: true,
        });

        console.log(
          '📦 getSpokenMessages 响应:',
          JSON.stringify(response, null, 2),
        );

        if (response.success && Array.isArray(response.data)) {
          const loadedMessages: Message[] = response.data.map((msg: any) => ({
            id: msg.id?.toString() || generateMessageId(),
            content: msg.content || '',
            sender: msg.sender as 'user' | 'ai',
            timestamp: new Date(
              msg.created_at || Date.now(),
            ).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            fullTimestamp: new Date(msg.created_at),
            audioFilePath: msg.audio_file_path,
            serverAudioPath: msg.server_audio_path,
            messageType: msg.message_type,
            transcriptionText: msg.transcription_text,
            transcriptionStatus: msg.transcription_status,
            audioUrl: msg.audio_url,
            audioLoaded: false,
            roundNum: msg.round_num,
            imageUrl: msg.image_path,
            score: msg.score,
            grammarFeedback: msg.grammar_feedback,
            grammarFeedbackStatus: msg.grammar_feedback
              ? 'received'
              : undefined,
            originMessageId: msg.origin_message_id,
          }));

          setMessages(loadedMessages);
          setHistoryLoaded(true);
          console.log(`✅ 成功加载 ${loadedMessages.length} 条历史消息`);
          return id;
        } else {
          console.warn('未找到历史消息，创建新会话');
          const newId = await createConversation();
          return newId || id;
        }
      } catch (error) {
        console.error('加载历史消息失败:', error);
        // 失败时创建新会话
        const newId = await createConversation();
        return newId || id;
      } finally {
        setLoading(false);
      }
    },
    [createConversation, generateMessageId],
  );

  /**
   * 添加消息到列表
   */
  const addMessage = useCallback(
    (message: Message) => {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, message];
        console.log('📝 消息已添加到列表');
        return newMessages;
      });

      // 通知回调
      onMessageAdded?.(message);
    },
    [onMessageAdded],
  );

  /**
   * 更新消息
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      );
      console.log('📝 消息已更新:', messageId);
    },
    [],
  );

  /**
   * 清除会话
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setHistoryLoaded(false);
    localStorage.removeItem(CONVERSATION_ID_KEY);
    console.log('🧹 会话已清除');
  }, []);

  return {
    conversationId,
    messages,
    loading,
    historyLoaded,
    createConversation,
    loadHistory,
    addMessage,
    updateMessage,
    clearConversation,
    generateMessageId,
  };
}

export default useConversationManager;
