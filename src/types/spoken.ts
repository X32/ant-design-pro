/**
 * 口语练习模块类型定义
 * 适用于 spokenPages 和 spokenExamPage
 */

// ==================== 消息类型 ====================

/**
 * 消息类型枚举
 */
export type MessageType =
  | 'text'
  | 'voice'
  | 'image'
  | 'score'
  | 'grammar_feedback'
  | 'final_score_summary' // spokenExamPage 专用
  | 'finish'
  | 'score_panel'; // spokenExamPage 专用

/**
 * 转写状态枚举
 */
export type TranscriptionStatus = 'pending' | 'processing' | 'done' | 'failed';

// ==================== 内容类型 ====================

/**
 * 评分详情接口
 */
export interface ScoreContent {
  /** 原始文本 */
  rawText: string;
  /** 维度分数（第一行） */
  dimensionScores?: string;
  /** 总分行 */
  totalScore?: string;
  /** 优势部分 */
  advantages?: string;
  /** 不足部分 */
  disadvantages?: string;
  /** 改进建议 */
  suggestions?: string;
  /** 改进的回答 */
  improvedAnswer?: string;
}

/**
 * 语法错误项接口
 */
export interface GrammarError {
  /** 错误类型 */
  type: string;
  /** 错误片段 */
  original: string;
  /** 修正后 */
  corrected: string;
  /** 错误说明 */
  explanation: string;
  /** 严重程度 */
  severity: 'critical' | 'minor';
  /** A2 评分维度 */
  a2_criterion?: string;
  /** B1 评分维度 */
  b1_criterion?: string;
  /** B2 评分维度 */
  b2_criterion?: string;
}

/**
 * 评估等级类型
 */
export type AssessmentLevel = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * 单项评估接口（KET/PET/FCE）
 */
export interface Assessment {
  grammar_structure: AssessmentLevel;
  vocabulary: AssessmentLevel;
  coherence: AssessmentLevel;
}

/**
 * 相关性等级类型
 */
export type RelevanceLevel = 'on_topic' | 'partially_on_topic' | 'off_topic';

/**
 * 语法反馈内容接口（KET/PET/FCE）
 */
export interface GrammarFeedbackContent {
  /** 错误列表 */
  errors: GrammarError[];
  /** 改进后的完整句子 */
  improved_version: string;
  /** 学习建议（固定 3 条） */
  suggestions: string[];
  /** 整体质量 */
  overall_quality: AssessmentLevel;
  /** KET 评估 */
  a2_assessment?: {
    grammar_structure: AssessmentLevel;
    vocabulary: AssessmentLevel;
    coherence: AssessmentLevel;
  };
  /** PET 评估 */
  b1_assessment?: {
    grammar_structure: AssessmentLevel;
    vocabulary: AssessmentLevel;
    coherence: AssessmentLevel;
  };
  /** FCE 评估 */
  b2_assessment?: {
    grammar_structure: AssessmentLevel;
    vocabulary: AssessmentLevel;
    coherence: AssessmentLevel;
  };
  /** 相关性分数 (0.0-1.0) */
  relevance_score: number;
  /** 相关性等级 */
  relevance_level: RelevanceLevel;
  /** 相关性判断理由 */
  relevance_reason: string;
}

/**
 * 🆕 总分汇总内容接口（spokenExamPage 专用）
 */
export interface FinalScoreSummaryContent {
  type: 'final_score_summary';
  /** 显示的文本内容 */
  content: string;
  /** 时间戳 */
  timestamp: number;
  /** 各 Part 得分，如 {"1": 18, "2": 22} */
  part_scores: Record<string, number>;
  /** 总分 */
  total_score: number;
}

// ==================== 消息接口 ====================

/**
 * 消息数据接口定义
 */
export interface Message {
  /** 🔢 消息 ID（字符串类型，单调递增） */
  id: string;
  /** 消息内容（文本、评分、语法反馈或总分汇总对象） */
  content:
    | string
    | ScoreContent
    | GrammarFeedbackContent
    | FinalScoreSummaryContent;
  /** 发送者角色 */
  sender: 'user' | 'ai';
  /** 发送时间戳（显示用，格式：HH:mm） */
  timestamp: string;
  /** 完整时间戳（保存用） */
  fullTimestamp?: Date;
  /** 音频文件路径（用户语音消息，本地 Blob URL） */
  audioFilePath?: string;
  /** 🔥 服务器音频路径（用于保存到数据库） */
  serverAudioPath?: string;
  /** 消息类型 */
  messageType?: MessageType;
  /** 转写文本（语音消息专用） */
  transcriptionText?: string;
  /** 转写状态 */
  transcriptionStatus?: TranscriptionStatus;
  // AI 消息音频相关字段
  /** AI 消息的音频 URL */
  audioUrl?: string;
  /** 音频是否已加载 */
  audioLoaded?: boolean;
  /** 轮次号 */
  roundNum?: number;
  // 图片消息相关字段
  /** 图片 URL */
  imageUrl?: string;
  // 评分消息相关字段
  /** 总分 */
  score?: string;
  /** 🆕 评分阶段号（第几个 Part） */
  partNo?: number;
  /** 🆕 总阶段数（一共几个 Part） */
  totalParts?: number;
  /** 🆕 多个评分消息（用于 score_panel 类型） */
  scoreParts?: Message[];
  // 语法反馈关联字段
  /** 关联的语法反馈内容 */
  grammarFeedback?: GrammarFeedbackContent;
  /** 语法反馈接收状态 */
  grammarFeedbackStatus?: 'pending' | 'received';
  /** 🆕 原始消息 ID（语法反馈消息关联到音频消息，字符串类型） */
  originMessageId?: string | number;
}

// ==================== WebSocket 相关类型 ====================

/**
 * WebSocket 消息数据结构
 */
export interface WebSocketMessageData {
  seq?: number;
  user_id?: number;
  conversation_id?: number;
  message_type?: MessageType;
  text?: string;
  audio_path?: string;
  image_path?: string;
  score_content?: ScoreContent;
  grammar_feedback?: GrammarFeedbackContent;
  final_score_summary?: FinalScoreSummaryContent;
  [key: string]: any;
}

// ==================== API 相关类型 ====================

/**
 * 工作流类型选项
 */
export interface WorkflowTypeOption {
  value: string;
  label: string;
  price: number | string;
}

/**
 * VIP 订阅信息
 */
export interface VipSubscription {
  has_subscription: boolean;
  subscriptions: Array<{
    remaining_days: number;
    [key: string]: any;
  }>;
}

/**
 * 钱包余额响应
 */
export interface WalletBalanceResponse {
  success: boolean;
  data: {
    balance: number;
    [key: string]: any;
  };
  message?: string;
}

/**
 * 会话创建参数
 */
export interface CreateConversationParams {
  user_id: number;
  workflow_type?: string;
  paper_id?: number;
  exercise_id?: number;
}

/**
 * 消息创建参数
 */
export interface CreateMessageParams {
  conversation_id: number;
  user_id: number;
  content: string;
  message_type?: MessageType;
  audio_file_path?: string;
  transcription_text?: string;
  seq?: number;
}

// ==================== 组件 Props 类型 ====================

/**
 * MessageBubble 组件 Props
 */
export interface MessageBubbleProps {
  message: Message;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onImageClick?: () => void;
  onGrammarFeedbackClick?: () => void;
}

/**
 * MessageList 组件 Props
 */
export interface MessageListProps {
  messages: Message[];
  playingMessageId?: string | null;
  onPlayAudio?: (messageId: string) => void;
  onPauseAudio?: (messageId: string) => void;
  onShowGrammarFeedback?: (message: Message) => void;
}

/**
 * InputArea 组件 Props
 */
export interface InputAreaProps {
  inputValue: string;
  isRecording: boolean;
  showTextInput: boolean;
  disabled?: boolean;
  onInputChange?: (value: string) => void;
  onSend?: () => void;
  onStartRecording?: () => void;
  onToggleTextInput?: () => void;
}

/**
 * GrammarFeedbackModal 组件 Props
 */
export interface GrammarFeedbackModalProps {
  visible: boolean;
  feedback: GrammarFeedbackContent | null;
  onClose: () => void;
}

/**
 * ConversationHeader 组件 Props
 */
export interface ConversationHeaderProps {
  isConnected: boolean;
  hasVipSubscription: boolean;
  vipRemainingDays: number;
  workflowType?: string;
  onBack?: () => void;
}

/**
 * AudioRecorderWrapper 组件 Props
 */
export interface AudioRecorderWrapperProps {
  isRecording: boolean;
  onStart?: () => void;
  onCancel?: () => void;
  onFinish?: (filePath: string, audioBlob: Blob) => void;
}

// ==================== Hook 返回类型 ====================

/**
 * useAudioPlayer Hook 返回类型
 */
export interface UseAudioPlayerReturn {
  playingMessageId: string | null;
  isPlaying: boolean;
  play: (audioUrl: string, messageId: string) => void;
  pause: () => void;
  stop: () => void;
}

/**
 * useSpokenWebSocket Hook 返回类型
 */
export interface UseSpokenWebSocketReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  isRetrying: boolean;
  retryAttempt: number;
  sendMessage: (data: any) => void;
}

/**
 * useConversationManager Hook 返回类型
 */
export interface UseConversationManagerReturn {
  conversationId: number | null;
  messages: Message[];
  loading: boolean;
  createConversation: () => Promise<number | null>;
  loadHistory: (conversationId: number) => Promise<number>;
  addMessage: (message: Message) => void;
}

/**
 * useBalanceChecker Hook 返回类型
 */
export interface UseBalanceCheckerReturn {
  hasVipSubscription: boolean;
  vipRemainingDays: number;
  balance: number;
  checkBalance: (price: number) => Promise<boolean>;
  consumeCoins: (conversationId: number, price: number) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}
