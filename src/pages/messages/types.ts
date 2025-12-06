// 会话状态
export enum SessionStatus {
  ACTIVE = 'active',
  DELETED = 'deleted'
}

// 消息角色
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

// 消息类型
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

// 会话表结构
export interface Session {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  updatedAt: string;
  status: SessionStatus;
}

// 消息表结构
export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  sequence: number;
  type: MessageType;
  preview: string;
  createdAt: string;
  contents?: MessageContent[]; // 新增：消息内容列表
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
