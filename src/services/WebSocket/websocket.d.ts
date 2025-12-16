declare class WebSocketService {
    private socket;
    private url;
    private eventHandlers;
    private maxRetries;
    private retryInterval;
    private retryCount;
    private retryTimer;
    private isRetrying;
    private lastConnectionUrl;
    private userId;
    private conversationId;
    constructor();
    connect(userId: number, conversationId: number): {
        send: (data: any) => boolean;
        disconnect: () => void;
        on: (event: string, callback: Function) => void;
        off: (event: string, callback?: Function) => void;
        readyState: () => number | undefined;
        retry: () => void;
    };
    send(data: any): boolean;
    disconnect(): void;
    private attemptReconnection;
    private clearRetryTimer;
    setRetryConfig(config: {
        maxRetries?: number;
        retryInterval?: number;
    }): void;
    on(event: string, callback: Function): void;
    off(event: string, callback?: Function): void;
    private triggerEvent;
    isConnected(): boolean;
}
declare const _default: WebSocketService;
export default _default;
