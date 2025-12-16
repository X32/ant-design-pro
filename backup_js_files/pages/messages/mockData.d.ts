import { Session, Message, MessageContent } from './types';
export declare const mockSessions: Session[];
export declare const mockMessages: Record<string, Message[]>;
export declare const mockMessageContents: Record<string, MessageContent[]>;
export declare const mockApi: {
    getSessions: (params: {
        search?: string;
        filter?: any;
        page?: number;
        pageSize?: number;
    }) => Promise<{
        data: Session[];
        total: number;
    }>;
    getMessages: (sessionId: string, params: {
        search?: string;
        filter?: any;
        page?: number;
        pageSize?: number;
    }) => Promise<{
        data: Message[];
        total: number;
    }>;
    getMessageContents: (messageId: string) => Promise<MessageContent[]>;
    deleteSession: (sessionId: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    deleteMessageContent: (contentId: string) => Promise<void>;
    addMessageContent: (messageId: string, content: Omit<MessageContent, "id" | "messageId" | "createdAt">) => Promise<MessageContent>;
    updateMessageContent: (contentId: string, updates: Partial<Omit<MessageContent, "id" | "messageId" | "createdAt">>) => Promise<MessageContent>;
};
