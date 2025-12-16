// 使用原生WebSocket API，避免socket.io自动添加的路径和参数
class WebSocketService {
    socket = null;
    url;
    eventHandlers = {};
    // 重试配置
    maxRetries = 5;
    retryInterval = 2000; // 初始重试间隔（毫秒）
    retryCount = 0;
    retryTimer = null;
    isRetrying = false;
    lastConnectionUrl = '';
    userId = 0;
    conversationId = 0;
    constructor() {
        // 直接连接到目标WebSocket服务器，不使用代理
        this.url = 'ws://localhost:9001/ws';
    }
    connect(userId, conversationId) {
        // 存储连接参数，用于重试
        this.userId = userId;
        this.conversationId = conversationId;
        // 构建完整的URL，包含必要的查询参数
        // 使用相对路径，确保通过代理服务器访问
        const connectionUrl = `${this.url}?userId=${userId}&conversationId=${conversationId}`;
        this.lastConnectionUrl = connectionUrl;
        // 清除之前的重试计时器
        this.clearRetryTimer();
        // 使用原生WebSocket API，使用相对路径确保通过代理
        // 注意：在浏览器环境中，使用相对路径时会自动使用与页面相同的协议和主机
        this.socket = new WebSocket(connectionUrl);
        // 设置连接事件处理
        this.socket.onopen = () => {
            console.log('WebSocket 连接已建立');
            // 连接成功，重置重试计数
            this.retryCount = 0;
            this.isRetrying = false;
            // 触发用户注册的connect事件
            this.triggerEvent('connect');
        };
        this.socket.onclose = (event) => {
            console.log('WebSocket 连接已断开', event.code, event.reason);
            // 如果不是手动关闭且允许重试，则触发重连
            if (!event.wasClean && this.retryCount < this.maxRetries) {
                this.attemptReconnection();
            }
            else {
                this.isRetrying = false;
                // 触发用户注册的disconnect事件
                this.triggerEvent('disconnect');
            }
        };
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // 假设服务器消息格式为 { type: 'message_type', data: {...} }
                if (data.type && this.eventHandlers[data.type]) {
                    this.triggerEvent(data.type, data.data);
                }
                else {
                    // 默认触发receive_message事件
                    this.triggerEvent('receive_message', data);
                }
            }
            catch (error) {
                console.error('解析WebSocket消息失败:', error);
                // 直接将原始消息传递给receive_message事件
                this.triggerEvent('receive_message', event.data);
            }
        };
        this.socket.onerror = (error) => {
            console.error('WebSocket 错误:', error);
            this.triggerEvent('error', error);
        };
        // 返回一个包装后的对象，支持事件监听接口
        return {
            send: (data) => this.send(data),
            disconnect: () => this.disconnect(),
            on: (event, callback) => this.on(event, callback),
            off: (event, callback) => this.off(event, callback),
            readyState: () => this.socket?.readyState,
            // 添加手动触发重试的方法
            retry: () => this.attemptReconnection()
        };
    }
    // 发送消息
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            this.socket.send(message);
            return true;
        }
        console.error('WebSocket未连接或已关闭');
        return false;
    }
    // 断开连接
    disconnect() {
        // 清除重试计时器
        this.clearRetryTimer();
        this.isRetrying = false;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
    // 尝试重新连接
    attemptReconnection() {
        if (this.isRetrying)
            return;
        this.retryCount++;
        if (this.retryCount > this.maxRetries) {
            console.warn(`WebSocket 连接重试达到最大次数 ${this.maxRetries}，停止重试`);
            this.triggerEvent('maxRetriesReached', { maxRetries: this.maxRetries });
            return;
        }
        this.isRetrying = true;
        // 使用指数退避策略，每次重试间隔逐渐增加
        const currentInterval = this.retryInterval * Math.pow(1.5, this.retryCount - 1);
        console.log(`WebSocket 尝试重新连接 (${this.retryCount}/${this.maxRetries})，${currentInterval}ms 后重试...`);
        // 触发重试事件
        this.triggerEvent('retrying', {
            attempt: this.retryCount,
            maxRetries: this.maxRetries,
            interval: currentInterval
        });
        this.retryTimer = setTimeout(() => {
            if (this.isRetrying) {
                console.log(`执行第 ${this.retryCount} 次重连...`);
                this.connect(this.userId, this.conversationId);
            }
        }, currentInterval);
    }
    // 清除重试计时器
    clearRetryTimer() {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
    }
    // 设置重试配置
    setRetryConfig(config) {
        if (config.maxRetries !== undefined) {
            this.maxRetries = config.maxRetries;
        }
        if (config.retryInterval !== undefined) {
            this.retryInterval = config.retryInterval;
        }
    }
    // 注册事件处理器
    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }
    // 移除事件处理器
    off(event, callback) {
        if (!this.eventHandlers[event])
            return;
        if (callback) {
            // 移除特定的回调函数
            this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
        }
        else {
            // 移除该事件的所有处理器
            delete this.eventHandlers[event];
        }
    }
    // 触发事件
    triggerEvent(event, data) {
        if (!this.eventHandlers[event])
            return;
        this.eventHandlers[event].forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`处理${event}事件时出错:`, error);
            }
        });
    }
    // 检查连接状态
    isConnected() {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }
}
export default new WebSocketService();
