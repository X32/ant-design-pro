import {
  ArrowLeftOutlined,
  AudioOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { message as antdMessage, Button, Spin, Tag, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useRef, useState } from 'react';
import { TOKEN_KEY, USER_ID_KEY } from '@/config/apiConfig';
import {
  createSpokenConversation,
  getTranscriptionStatus,
  uploadAudioWithTranscription,
} from '@/services/ant-design-pro/api';
import webSocketService from '@/services/WebSocket/websocket';
import type { GrammarFeedbackContent } from '@/types/spoken';
import SummaryCard from './components/SummaryCard';
import TypingIndicator from './components/TypingIndicator';

// ============================================================
// 类型定义
// ============================================================

type ChatMessageKind = 'text' | 'typing' | 'grammar' | 'summary';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  kind: ChatMessageKind;
  content: string;
  round?: number;
  grammar?: GrammarFeedbackContent;
  totalRounds?: number;
  /** 关联的用户消息 ID(用于 grammar 消息做视觉关联) */
  originMessageId?: string;
}

type Phase = 'connecting' | 'chatting' | 'finished';

interface IncomingData {
  type?: string;
  content?: any;
  timestamp?: number;
  round_num?: number;
  total_rounds?: number;
  origin_message_id?: string | number;
  audio_path?: string;
  [key: string]: any;
}

// ============================================================
// 样式
// ============================================================

const useStyles = createStyles(({ token }) => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: token.colorBgLayout,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: token.colorBgContainer,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
  },
  headerSubtitle: {
    fontSize: 12,
    color: token.colorTextSecondary,
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    WebkitOverflowScrolling: 'touch',
  },
  row: {
    display: 'flex',
    width: '100%',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAi: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    padding: '10px 14px',
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  bubbleUser: {
    background: token.colorPrimary,
    color: token.colorTextLightSolid,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    background: token.colorBgContainer,
    color: token.colorText,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderBottomLeftRadius: 4,
  },
  bubbleMeta: {
    fontSize: 11,
    color: token.colorTextTertiary,
    marginTop: 4,
  },
  footer: {
    padding: '12px 16px 20px',
    background: token.colorBgContainer,
    borderTop: `1px solid ${token.colorBorderSecondary}`,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: 28,
    border: 'none',
    transition: 'all 0.2s',
  },
  recordIdle: {
    background: token.colorPrimary,
    color: token.colorTextLightSolid,
  },
  recordActive: {
    background: token.colorError,
    color: token.colorTextLightSolid,
    transform: 'scale(1.05)',
    boxShadow: '0 0 0 6px rgba(255,77,79,0.18)',
  },
  recordDisabled: {
    background: token.colorBgContainerDisabled,
    color: token.colorTextDisabled,
    cursor: 'not-allowed',
  },
  footerHint: {
    fontSize: 12,
    color: token.colorTextSecondary,
    minHeight: 18,
  },
  connecting: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 12,
  },
}));

// ============================================================
// 工具函数
// ============================================================

/** 把 webm/ogg blob 转成 wav blob(后端 STT 接受 wav 更稳) */
async function convertWebMToWav(webmBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const AudioContextCtor: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) {
      reject(new Error('当前浏览器不支持 AudioContext'));
      return;
    }
    const audioContext = new AudioContextCtor();
    const fileReader = new FileReader();

    fileReader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const length = audioBuffer.length * audioBuffer.numberOfChannels * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);
        const sampleRate = audioBuffer.sampleRate;
        const numChannels = audioBuffer.numberOfChannels;

        const writeString = (offset: number, str: string) => {
          for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
          }
        };
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);

        let offset = 44;
        for (let ch = 0; ch < numChannels; ch++) {
          const data = audioBuffer.getChannelData(ch);
          for (let i = 0; i < audioBuffer.length; i++) {
            const s = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            offset += 2;
          }
        }
        resolve(new Blob([buffer], { type: 'audio/wav' }));
      } catch (err) {
        reject(err);
      }
    };
    fileReader.onerror = () => reject(new Error('读取音频失败'));
    fileReader.readAsArrayBuffer(webmBlob);
  });
}

/** 轮询 STT 结果 */
async function pollTranscription(
  taskId: string,
  maxAttempts = 30,
  intervalMs = 2000,
): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res: any = await getTranscriptionStatus(taskId);
      if (res?.status === 'DONE') {
        return res?.result?.success ? res.result.text || '' : null;
      }
      if (res?.status === 'FAILED') {
        return null;
      }
    } catch (err) {
      console.warn('STT 轮询出错,继续重试', err);
    }
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  return null;
}

// ============================================================
// 主组件
// ============================================================

const FreeChat: React.FC = () => {
  const { styles, token } = useStyles();
  const { initialState } = useModel('@@initialState');
  // 触发 currentUser 引用,确保 useModel 重新渲染时刷新;真正登录态校验靠 localStorage token
  void initialState?.currentUser;

  const [phase, setPhase] = useState<Phase>('connecting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // refs
  const socketRef = useRef<ReturnType<typeof webSocketService.connect> | null>(
    null,
  );
  const conversationIdRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messageCounterRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingOriginIdRef = useRef<string | null>(null);

  // ============================================================
  // 消息操作
  // ============================================================

  const genId = () => {
    messageCounterRef.current += 1;
    return `${Date.now()}_${messageCounterRef.current}`;
  };

  const pushMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const removeTypingIndicator = () => {
    setMessages((prev) => prev.filter((m) => m.kind !== 'typing'));
  };

  // ============================================================
  // WebSocket 消息处理
  // ============================================================

  const handleIncoming = (data: IncomingData) => {
    console.log('[FreeChat] WS message:', data);
    const t = data?.type;
    if (!t) return;

    switch (t) {
      case 'init': {
        // 欢迎语不进列表(马上会有第一条 question)
        break;
      }
      case 'loading': {
        removeTypingIndicator();
        pushMessage({
          id: `typing_${Date.now()}`,
          role: 'ai',
          kind: 'typing',
          content: '',
        });
        break;
      }
      case 'question': {
        removeTypingIndicator();
        const content =
          typeof data.content === 'string'
            ? data.content
            : String(data.content || '');
        pushMessage({
          id: genId(),
          role: 'ai',
          kind: 'text',
          content,
          round: data.round_num,
        });
        break;
      }
      case 'grammar_feedback': {
        let grammar: GrammarFeedbackContent | null = null;
        try {
          if (typeof data.content === 'string') {
            grammar = JSON.parse(data.content);
          } else if (data.content && typeof data.content === 'object') {
            grammar = data.content as GrammarFeedbackContent;
          }
        } catch (err) {
          console.warn('[FreeChat] grammar_feedback 解析失败', err);
        }
        if (!grammar) break;

        pushMessage({
          id: genId(),
          role: 'ai',
          kind: 'grammar',
          content: '',
          grammar,
          originMessageId: String(data.origin_message_id ?? ''),
        });
        break;
      }
      case 'summary': {
        removeTypingIndicator();
        const content =
          typeof data.content === 'string'
            ? data.content
            : String(data.content || '');
        pushMessage({
          id: genId(),
          role: 'ai',
          kind: 'summary',
          content,
          totalRounds: data.total_rounds ?? 0,
        });
        break;
      }
      case 'finish': {
        removeTypingIndicator();
        setPhase('finished');
        setIsProcessingSTT(false);
        setIsRecording(false);
        break;
      }
      case 'error': {
        const errContent =
          typeof data.content === 'string' ? data.content : '服务器返回错误';
        antdMessage.error(errContent);
        setErrorMsg(errContent);
        removeTypingIndicator();
        break;
      }
      default:
        console.warn('[FreeChat] 未处理消息类型:', t);
    }
  };

  // ============================================================
  // 启动 WebSocket
  // ============================================================

  const initWebSocket = async (token: string, userId: number) => {
    // 创建会话
    let conversationId: number | null = null;
    try {
      const res: any = await createSpokenConversation({
        workflow_type: 'free_conversation',
        title: `自由对话 ${new Date().toLocaleString('zh-CN')}`,
      });
      if (res?.success && res?.data?.id) {
        conversationId = res.data.id;
      } else {
        throw new Error(res?.message || '创建会话失败');
      }
    } catch (err: any) {
      console.error('[FreeChat] createSpokenConversation failed', err);
      antdMessage.error(err?.message || '创建会话失败,请重新登录');
      setErrorMsg(err?.message || '创建会话失败');
      setPhase('finished');
      return;
    }

    conversationIdRef.current = conversationId;

    const socket = webSocketService.connect(
      userId,
      conversationId,
      token,
      'free_conversation',
      undefined,
      undefined,
    );
    socketRef.current = socket;

    socket.on('auth_success', () => {
      console.log('[FreeChat] WS auth_success');
      setIsConnected(true);
      setPhase('chatting');
    });
    socket.on('auth_failed', (data: any) => {
      console.error('[FreeChat] WS auth_failed', data);
      antdMessage.error('WebSocket 认证失败,请重新登录');
      setErrorMsg('认证失败');
      setPhase('finished');
    });
    socket.on('auth_timeout', () => {
      console.error('[FreeChat] WS auth_timeout');
      antdMessage.error('WebSocket 认证超时');
      setErrorMsg('认证超时');
      setPhase('finished');
    });
    socket.on('disconnect', () => {
      console.warn('[FreeChat] WS disconnect');
      setIsConnected(false);
    });
    socket.on('error', (err: any) => {
      console.error('[FreeChat] WS error', err);
    });
    socket.on('receive_message', handleIncoming);
  };

  // ============================================================
  // 录音 + STT + 发送
  // ============================================================

  const stopStream = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    if (phase !== 'chatting' || isProcessingSTT || isRecording) return;
    if (!socketRef.current || !isConnected) {
      antdMessage.warning('连接未就绪,请稍候');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleRecordingStop;
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('[FreeChat] getUserMedia 失败', err);
      antdMessage.error('无法访问麦克风,请检查浏览器权限');
      stopStream();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !recorderRef.current) return;
    try {
      recorderRef.current.stop();
    } catch (err) {
      console.warn('[FreeChat] recorder.stop 异常', err);
    }
    setIsRecording(false);
    stopStream();
  };

  const handleRecordingStop = async () => {
    setIsProcessingSTT(true);
    const originMessageId = genId();
    pendingOriginIdRef.current = originMessageId;

    try {
      const webmBlob = new Blob(chunksRef.current, {
        type: chunksRef.current[0]?.type || 'audio/webm',
      });
      if (webmBlob.size === 0) {
        throw new Error('录音为空');
      }

      // 上传前先在 UI 上加一个 "处理中" 占位气泡
      pushMessage({
        id: `processing_${originMessageId}`,
        role: 'user',
        kind: 'text',
        content: '… 正在识别语音 …',
      });

      const wavBlob = await convertWebMToWav(webmBlob);
      const token = localStorage.getItem(TOKEN_KEY) || '';
      const userId = Number(localStorage.getItem(USER_ID_KEY) || 0);

      const uploadRes: any = await uploadAudioWithTranscription(
        wavBlob,
        `free-chat-${originMessageId}.wav`,
        'en',
        userId,
        token,
      );
      if (!uploadRes?.success || !uploadRes?.task_id) {
        throw new Error(uploadRes?.message || '音频上传失败');
      }

      const transcribedText = await pollTranscription(uploadRes.task_id);
      if (!transcribedText || !transcribedText.trim()) {
        throw new Error('语音识别失败,请重试');
      }

      // 替换占位气泡为真实文字
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `processing_${originMessageId}`
            ? { ...m, content: transcribedText, round: undefined }
            : m,
        ),
      );

      // 发送 answer 给后端
      socketRef.current?.send(
        JSON.stringify({
          type: 'answer',
          conversation_id: conversationIdRef.current,
          content: transcribedText,
          origin_message_id: originMessageId,
        }),
      );
      console.log(
        '[FreeChat] 已发送 answer, origin_message_id=',
        originMessageId,
      );
    } catch (err: any) {
      console.error('[FreeChat] STT/上传失败', err);
      antdMessage.error(err?.message || '处理失败,请重试');
      // 移除占位气泡
      setMessages((prev) =>
        prev.filter((m) => m.id !== `processing_${originMessageId}`),
      );
    } finally {
      setIsProcessingSTT(false);
      chunksRef.current = [];
      pendingOriginIdRef.current = null;
    }
  };

  // ============================================================
  // 结束对话 / 重开
  // ============================================================

  const handleEndConversation = () => {
    if (phase !== 'chatting') return;
    if (!socketRef.current || !isConnected) {
      antdMessage.warning('连接未就绪');
      return;
    }
    // 如果正在录音,先停掉
    if (isRecording) {
      stopRecording();
    }
    socketRef.current.send(
      JSON.stringify({
        type: 'end_conversation',
        conversation_id: conversationIdRef.current,
      }),
    );
    // 占位 typing 让用户知道在生成总结
    removeTypingIndicator();
    pushMessage({
      id: `typing_${Date.now()}`,
      role: 'ai',
      kind: 'typing',
      content: '',
    });
    antdMessage.info('正在生成对话总结…');
  };

  const handleRestart = () => {
    // 重新打开同一路由,effect 会重新创建会话
    history.replace('/free-chat');
    setTimeout(() => window.location.reload(), 50);
  };

  const handleBack = () => {
    history.goBack();
  };

  // ============================================================
  // 挂载/卸载
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userId = Number(localStorage.getItem(USER_ID_KEY) || 0);

    if (!token || !userId) {
      antdMessage.warning('请先登录');
      history.replace('/user/login');
      return;
    }

    initWebSocket(token, userId);

    return () => {
      // 卸载时关闭 WS + 关闭麦克风流
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (err) {
          console.warn('[FreeChat] disconnect 异常', err);
        }
        socketRef.current = null;
      }
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // 自动滚动到底部
  // ============================================================

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ============================================================
  // 渲染
  // ============================================================

  const visibleMessages = messages;

  const renderBubble = (msg: ChatMessage) => {
    if (msg.kind === 'typing') {
      return (
        <div key={msg.id} className={`${styles.row} ${styles.rowAi}`}>
          <TypingIndicator />
        </div>
      );
    }
    if (msg.kind === 'summary') {
      return (
        <div key={msg.id} className={`${styles.row} ${styles.rowAi}`}>
          <div style={{ maxWidth: '90%', width: '100%' }}>
            <SummaryCard
              content={msg.content}
              totalRounds={msg.totalRounds ?? 0}
            />
          </div>
        </div>
      );
    }
    if (msg.kind === 'grammar' && msg.grammar) {
      const g = msg.grammar;
      return (
        <div key={msg.id} className={`${styles.row} ${styles.rowAi}`}>
          <div className={`${styles.bubble} ${styles.bubbleAi}`}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              📝 语法改错
              {typeof g.overall_quality === 'string' ? (
                <Tag
                  color={
                    g.overall_quality === 'excellent'
                      ? 'green'
                      : g.overall_quality === 'good'
                        ? 'blue'
                        : g.overall_quality === 'fair'
                          ? 'orange'
                          : 'red'
                  }
                  style={{ marginLeft: 8 }}
                >
                  {g.overall_quality}
                </Tag>
              ) : null}
            </div>
            {Array.isArray(g.errors) && g.errors.length > 0 ? (
              <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
                {g.errors.slice(0, 5).map((e, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    <span
                      style={{ textDecoration: 'line-through', opacity: 0.6 }}
                    >
                      {e.original}
                    </span>{' '}
                    →{' '}
                    <span style={{ color: token.colorSuccess }}>
                      {e.corrected}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ opacity: 0.7 }}>未发现明显语法错误 🎉</div>
            )}
            {g.improved_version ? (
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: '1px dashed rgba(0,0,0,0.1)',
                }}
              >
                <strong>改进版:</strong> {g.improved_version}
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    // 普通文本气泡
    const isUser = msg.role === 'user';
    return (
      <div
        key={msg.id}
        className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAi}`}
      >
        <div
          className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}
        >
          {msg.content}
        </div>
      </div>
    );
  };

  if (phase === 'connecting') {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            />
            <div>
              <h2 className={styles.headerTitle}>自由对话</h2>
              <div className={styles.headerSubtitle}>连接中…</div>
            </div>
          </div>
        </div>
        <div className={styles.connecting}>
          <Spin size="large" />
          <div style={{ color: '#888' }}>正在连接 AI 考官…</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          />
          <div>
            <h2 className={styles.headerTitle}>自由对话</h2>
            <div className={styles.headerSubtitle}>
              {isConnected ? '已连接 · 不限主题 · 随时结束' : '连接断开'}
            </div>
          </div>
        </div>
        {phase === 'chatting' ? (
          <Tooltip title="结束当前对话并生成总结">
            <Button
              danger
              icon={<PoweroffOutlined />}
              onClick={handleEndConversation}
              disabled={isProcessingSTT || isRecording}
            >
              结束对话
            </Button>
          </Tooltip>
        ) : (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRestart}
          >
            重新开始
          </Button>
        )}
      </div>

      <div className={styles.body}>
        {visibleMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: 60 }}>
            <p>🎉 连接成功!按住下方麦克风按钮开始说话。</p>
            <p style={{ fontSize: 12 }}>
              自由对话没有固定题目,跟 AI 聊任何话题都可以。
            </p>
          </div>
        ) : (
          visibleMessages.map(renderBubble)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.footer}>
        {phase === 'chatting' ? (
          <>
            <button
              type="button"
              className={`${styles.recordButton} ${
                isRecording
                  ? styles.recordActive
                  : isProcessingSTT
                    ? styles.recordDisabled
                    : styles.recordIdle
              }`}
              onClick={
                isRecording
                  ? stopRecording
                  : isProcessingSTT
                    ? undefined
                    : startRecording
              }
              disabled={isProcessingSTT}
              aria-label={isRecording ? '停止录音' : '开始录音'}
            >
              {isRecording ? <StopOutlined /> : <AudioOutlined />}
            </button>
            <div className={styles.footerHint}>
              {isProcessingSTT
                ? '🔄 正在识别语音…'
                : isRecording
                  ? '🔴 正在录音,点击按钮停止'
                  : '点击麦克风开始说话(英文)'}
            </div>
          </>
        ) : (
          <div className={styles.footerHint}>
            {errorMsg
              ? `⚠️ ${errorMsg}`
              : '本次对话已结束,点击上方"重新开始"再开一次。'}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeChat;
