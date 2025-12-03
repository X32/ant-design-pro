import { Session, Message, Content } from '../types';

// 模拟会话数据
export const mockSessions: Session[] = [
  {
    id: 'SESSION_001',
    userId: 'USER_001',
    title: '产品咨询',
    messageCount: 15,
    updateTime: '2024-01-15 14:30:00',
    status: 'active',
  },
  {
    id: 'SESSION_002',
    userId: 'USER_002',
    title: '技术支持',
    messageCount: 8,
    updateTime: '2024-01-14 10:15:00',
    status: 'active',
  },
  {
    id: 'SESSION_003',
    userId: 'USER_003',
    title: '功能建议',
    messageCount: 22,
    updateTime: '2024-01-13 16:45:00',
    status: 'active',
  },
  {
    id: 'SESSION_004',
    userId: 'USER_001',
    title: 'bug反馈',
    messageCount: 5,
    updateTime: '2024-01-12 09:20:00',
    status: 'deleted',
  },
  {
    id: 'SESSION_005',
    userId: 'USER_004',
    title: '使用教程',
    messageCount: 12,
    updateTime: '2024-01-11 15:10:00',
    status: 'active',
  },
];

// 模拟消息数据
export const mockMessages: Message[] = [
  {
    id: 'MSG_001',
    sessionId: 'SESSION_001',
    role: 'user',
    sequence: 1,
    contentPreview: '您好，我想咨询一下你们的产品功能...',
    type: 'text',
    createTime: '2024-01-15 14:00:00',
  },
  {
    id: 'MSG_002',
    sessionId: 'SESSION_001',
    role: 'assistant',
    sequence: 2,
    contentPreview: '当然可以！我们的产品主要有以下几个核心功能...',
    type: 'text',
    createTime: '2024-01-15 14:05:00',
  },
  {
    id: 'MSG_003',
    sessionId: 'SESSION_001',
    role: 'user',
    sequence: 3,
    contentPreview: '![产品截图](https://example.com/image1.jpg)',
    type: 'image',
    createTime: '2024-01-15 14:10:00',
  },
  {
    id: 'MSG_004',
    sessionId: 'SESSION_002',
    role: 'user',
    sequence: 1,
    contentPreview: '系统报错了，错误代码是500...',
    type: 'text',
    createTime: '2024-01-14 10:00:00',
  },
  {
    id: 'MSG_005',
    sessionId: 'SESSION_002',
    role: 'assistant',
    sequence: 2,
    contentPreview: '请提供一下详细的错误信息截图...',
    type: 'text',
    createTime: '2024-01-14 10:05:00',
  },
];

// 模拟内容数据
export const mockContents: Content[] = [
  {
    id: 'CONTENT_001',
    messageId: 'MSG_001',
    sequence: 1,
    content: '您好，我想咨询一下你们的产品功能',
    contentType: 'text',
  },
  {
    id: 'CONTENT_002',
    messageId: 'MSG_001',
    sequence: 2,
    content: '主要想了解一下AI相关的特性',
    contentType: 'text',
  },
  {
    id: 'CONTENT_003',
    messageId: 'MSG_002',
    sequence: 1,
    content: '当然可以！我们的产品主要有以下几个核心功能',
    contentType: 'text',
  },
  {
    id: 'CONTENT_004',
    messageId: 'MSG_002',
    sequence: 2,
    content: '智能对话、数据分析、图像识别',
    contentType: 'text',
  },
  {
    id: 'CONTENT_005',
    messageId: 'MSG_003',
    sequence: 1,
    content: 'https://example.com/image1.jpg',
    contentType: 'image',
  },
];