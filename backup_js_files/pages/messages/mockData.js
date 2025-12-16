import { SessionStatus, MessageRole, MessageType } from './types';
// 生成随机ID
const generateId = (prefix) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
// 生成随机时间
const generateRandomTime = (daysAgo = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    date.setSeconds(Math.floor(Math.random() * 60));
    return date.toISOString();
};
// 生成模拟会话数据
export const mockSessions = Array.from({ length: 20 }, (_, index) => ({
    id: generateId('session'),
    userId: `user_${Math.floor(Math.random() * 10) + 1}`,
    title: `会话标题 ${index + 1}`,
    messageCount: Math.floor(Math.random() * 50) + 1,
    updatedAt: generateRandomTime(),
    status: index % 5 === 0 ? SessionStatus.DELETED : SessionStatus.ACTIVE
}));
// 生成模拟消息数据
export const mockMessages = {};
// 为每个会话生成消息
mockSessions.forEach(session => {
    const messageCount = session.messageCount;
    mockMessages[session.id] = Array.from({ length: messageCount }, (_, index) => {
        const role = index % 2 === 0 ? MessageRole.USER : MessageRole.ASSISTANT;
        const type = Math.random() > 0.7 ? MessageType.IMAGE : MessageType.TEXT;
        const preview = type === MessageType.TEXT
            ? `这是消息内容的预览... ${index + 1}`
            : '图片消息';
        return {
            id: generateId('message'),
            sessionId: session.id,
            role,
            sequence: index + 1,
            type,
            preview,
            createdAt: generateRandomTime()
        };
    });
});
// 生成模拟消息内容数据
export const mockMessageContents = {};
// 为每个消息生成内容
Object.values(mockMessages).flat().forEach(message => {
    const contentCount = Math.floor(Math.random() * 3) + 1;
    mockMessageContents[message.id] = Array.from({ length: contentCount }, (_, index) => {
        const type = message.type;
        const content = type === MessageType.TEXT
            ? `这是消息的完整内容 ${index + 1}。可以包含多行文本，详细描述对话内容。`
            : 'https://via.placeholder.com/300x200';
        return {
            id: generateId('content'),
            messageId: message.id,
            sequence: index + 1,
            content,
            type,
            createdAt: generateRandomTime()
        };
    });
});
// 模拟API请求函数
export const mockApi = {
    // 获取会话列表
    getSessions: (params) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockSessions];
                // 搜索过滤
                if (params.search) {
                    const searchLower = params.search.toLowerCase();
                    filtered = filtered.filter(session => session.title.toLowerCase().includes(searchLower) ||
                        session.userId.toLowerCase().includes(searchLower));
                }
                // 状态过滤
                if (params.filter?.status) {
                    filtered = filtered.filter(session => session.status === params.filter.status);
                }
                // 日期过滤
                if (params.filter?.startDate || params.filter?.endDate) {
                    filtered = filtered.filter(session => {
                        const sessionDate = new Date(session.updatedAt);
                        const startDate = params.filter.startDate ? new Date(params.filter.startDate) : null;
                        const endDate = params.filter.endDate ? new Date(params.filter.endDate) : null;
                        return (!startDate || sessionDate >= startDate) && (!endDate || sessionDate <= endDate);
                    });
                }
                // 分页
                const page = params.page || 1;
                const pageSize = params.pageSize || 10;
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginated = filtered.slice(startIndex, endIndex);
                resolve({ data: paginated, total: filtered.length });
            }, 300);
        });
    },
    // 获取消息列表
    getMessages: (sessionId, params) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const messages = mockMessages[sessionId] || [];
                let filtered = [...messages];
                // 搜索过滤
                if (params.search) {
                    const searchLower = params.search.toLowerCase();
                    filtered = filtered.filter(message => message.preview.toLowerCase().includes(searchLower));
                }
                // 角色过滤
                if (params.filter?.role) {
                    filtered = filtered.filter(message => message.role === params.filter.role);
                }
                // 分页
                const page = params.page || 1;
                const pageSize = params.pageSize || 10;
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginated = filtered.slice(startIndex, endIndex);
                resolve({ data: paginated, total: filtered.length });
            }, 200);
        });
    },
    // 获取消息内容
    getMessageContents: (messageId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockMessageContents[messageId] || []);
            }, 150);
        });
    },
    // 删除会话
    deleteSession: (sessionId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const sessionIndex = mockSessions.findIndex(s => s.id === sessionId);
                if (sessionIndex !== -1) {
                    mockSessions[sessionIndex].status = SessionStatus.DELETED;
                }
                resolve();
            }, 200);
        });
    },
    // 删除消息
    deleteMessage: (messageId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 从消息列表中删除
                Object.keys(mockMessages).forEach(sessionId => {
                    const messageIndex = mockMessages[sessionId].findIndex(m => m.id === messageId);
                    if (messageIndex !== -1) {
                        mockMessages[sessionId].splice(messageIndex, 1);
                        // 更新会话的消息数
                        const session = mockSessions.find(s => s.id === sessionId);
                        if (session) {
                            session.messageCount = mockMessages[sessionId].length;
                        }
                    }
                });
                // 删除相关内容
                delete mockMessageContents[messageId];
                resolve();
            }, 200);
        });
    },
    // 删除消息内容
    deleteMessageContent: (contentId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                Object.keys(mockMessageContents).forEach(messageId => {
                    const contentIndex = mockMessageContents[messageId].findIndex(c => c.id === contentId);
                    if (contentIndex !== -1) {
                        mockMessageContents[messageId].splice(contentIndex, 1);
                    }
                });
                resolve();
            }, 150);
        });
    },
    // 添加消息内容
    addMessageContent: (messageId, content) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newContent = {
                    ...content,
                    id: generateId('content'),
                    messageId,
                    createdAt: new Date().toISOString()
                };
                if (!mockMessageContents[messageId]) {
                    mockMessageContents[messageId] = [];
                }
                mockMessageContents[messageId].push(newContent);
                resolve(newContent);
            }, 200);
        });
    },
    // 更新消息内容
    updateMessageContent: (contentId, updates) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let updatedContent;
                Object.keys(mockMessageContents).forEach(messageId => {
                    const contentIndex = mockMessageContents[messageId].findIndex(c => c.id === contentId);
                    if (contentIndex !== -1) {
                        mockMessageContents[messageId][contentIndex] = {
                            ...mockMessageContents[messageId][contentIndex],
                            ...updates
                        };
                        updatedContent = mockMessageContents[messageId][contentIndex];
                    }
                });
                if (updatedContent) {
                    resolve(updatedContent);
                }
                else {
                    throw new Error('Content not found');
                }
            }, 200);
        });
    }
};
