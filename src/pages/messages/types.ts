// 会话状态
export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

// 消息角色（发送者）
export enum MessageRole {
  USER = 'user',
  AI = 'ai',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

// 消息类型
export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
  SCORE = 'score',
  AUDIO = 'audio',
  VIDEO = 'video'
}

// 转写状态
export enum TranscriptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed'
}

// 口语会话结构（对齐 SpokenConversation）
export interface SpokenConversation {
  id: number;
  user_id: number;
  user_email?: string;              // 🆕 管理员接口返回：用户邮箱
  user_is_superuser?: boolean;      // 🆕 管理员接口返回：是否超级用户
  exercise_id?: number;
  workflow_type?: string;
  title?: string;
  status: 'active' | 'completed' | 'archived';
  total_messages: number;
  total_rounds: number;
  last_message_time?: string;
  created_at: string;
  updated_at?: string;
  last_message_preview?: string;
}

// 口语消息结构（对齐 SpokenMessage）
export interface SpokenMessage {
  id: number;
  conversation_id: number;
  user_id: number;
  sender: 'user' | 'ai';
  message_type: 'text' | 'voice' | 'image' | 'score';
  content: string;
  round_num?: number;
  timestamp: string;
  audio_file_path?: string;
  audio_url?: string;
  transcription_text?: string;
  transcription_status?: 'pending' | 'processing' | 'done' | 'failed';
  image_url?: string;
  total_score?: string;
  dimension_scores?: string;
  advantages?: string;
  disadvantages?: string;
  suggestions?: string;
  improved_answer?: string;
  raw_text?: string;
  // 🆕 Grammar 相关字段
  origin_message_id?: string;              // 原始消息ID（关联用户消息，客户端生成的ID）
  grammar_origin_message_id?: string;      // 🆕 Grammar消息关联的原始消息ID（与origin_message_id值相同）
  exam_level?: string | null;              // 考试等级："FCE"/"PET"/"KET"
  error_count?: number | null;             // 语法错误数量
  grammar_improved_version?: string | null; // 语法改进后的版本
  overall_quality?: string | null;         // 整体质量："excellent"/"good"/"fair"/"poor"
  relevance_level?: string | null;         // 相关性等级："on_topic"/"partially_on_topic"/"off_topic"
  relevance_score?: number | null;         // 相关性分数(0-1)
}

// 兼容旧版本的会话结构（保留）
export interface Session {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  updatedAt: string;
  status: SessionStatus;
}

// 兼容旧版本的消息结构（保留）
export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  sequence: number;
  type: MessageType;
  preview: string;
  createdAt: string;
  contents?: MessageContent[];
}

// 消息内容表结构
export interface MessageContent {
  id: string;
  messageId: string;
  sequence: number;
  content: string;
  type: MessageType;
  createdAt: string;
}

// 搜索参数
export interface SearchParams {
  sessionTitle?: string;
  messageContent?: string;
  userId?: string;
}

// 筛选参数
export interface FilterParams {
  status?: SessionStatus;
  role?: MessageRole;
  startDate?: string;
  endDate?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}
