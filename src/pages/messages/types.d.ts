export declare enum SessionStatus {
    ACTIVE = "active",
    DELETED = "deleted"
}
export declare enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video"
}
export interface Session {
    id: string;
    userId: string;
    title: string;
    messageCount: number;
    updatedAt: string;
    status: SessionStatus;
}
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
export interface MessageContent {
    id: string;
    messageId: string;
    sequence: number;
    content: string;
    type: MessageType;
    createdAt: string;
}
export interface SearchParams {
    sessionTitle?: string;
    messageContent?: string;
    userId?: string;
}
export interface FilterParams {
    status?: SessionStatus;
    role?: MessageRole;
    startDate?: string;
    endDate?: string;
}
export interface PaginationParams {
    page: number;
    pageSize: number;
}
