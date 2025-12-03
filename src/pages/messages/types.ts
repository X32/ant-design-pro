// 会话类型
export interface Session {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  updateTime: string;
  status: 'active' | 'deleted';
}

// 消息类型
export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  sequence: number;
  contentPreview: string;
  type: 'text' | 'image' | 'audio' | 'video';
  createTime: string;
}

// 内容类型
export interface Content {
  id: string;
  messageId: string;
  sequence: number;
  content: string;
  contentType: 'text' | 'image' | 'audio' | 'video';
}

// 搜索参数类型
export interface SearchParams {
  keyword: string;
  status: string;
  role: string;
  dateRange: [string, string] | null;
}