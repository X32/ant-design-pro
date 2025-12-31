// 使用原生WebSocket API，避免socket.io自动添加的路径和参数

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private eventHandlers: { [event: string]: Function[] } = {};
  
  // 重试配置
  private maxRetries = 5;
  private retryInterval = 2000; // 初始重试间隔（毫秒）
  private retryCount = 0;
  private retryTimer: NodeJS.Timeout | null = null;
  private isRetrying = false;
  private lastConnectionUrl = '';
  private userId = 0;
  private conversationId = 0;
  
  // 认证相关
  private isAuthenticated = false;
  private authToken: string | null = null;
  private workflowType = 'fce_part1';
  private authTimeout: NodeJS.Timeout | null = null;
  private readonly AUTH_TIMEOUT_MS = 5000; // 认证超时时间

  constructor() {
    // 直接连接到目标WebSocket服务器，不使用代理
    this.url = 'ws://localhost:9001/ws';
  }

  connect(userId: number, conversationId: number, token?: string, workflowType: string = 'fce_part1') {
    // 存储连接参数，用于重试
    this.userId = userId;
    this.conversationId = conversationId;
    this.authToken = token || null;
    this.workflowType = workflowType;
    
    // 重置认证状态
    this.isAuthenticated = false;
    
    // 构建完整的URL，包含必要的查询参数
    // 使用相对路径，确保通过代理服务器访问
    const connectionUrl = `${this.url}?userId=${userId}&conversationId=${conversationId}`;
    this.lastConnectionUrl = connectionUrl;
    
    // 清除之前的重试计时器和认证超时
    this.clearRetryTimer();
    this.clearAuthTimeout();
    
    // 使用原生WebSocket API，使用相对路径确保通过代理
    // 注意：在浏览器环境中，使用相对路径时会自动使用与页面相同的协议和主机
    this.socket = new WebSocket(connectionUrl);

    // 设置连接事件处理
    this.socket.onopen = () => {
      console.log('WebSocket 连接已建立，准备发送认证消息');
      
      // 连接建立后立即发送认证消息
      this.sendAuthMessage();
      
      // 设置认证超时
      this.authTimeout = setTimeout(() => {
        if (!this.isAuthenticated) {
          console.error('认证超时，关闭连接');
          this.triggerEvent('auth_timeout');
          this.disconnect();
        }
      }, this.AUTH_TIMEOUT_MS);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket 连接已断开', event.code, event.reason);
      
      // 如果不是手动关闭且允许重试，则触发重连
      if (!event.wasClean && this.retryCount < this.maxRetries) {
        this.attemptReconnection();
      } else {
        this.isRetrying = false;
        // 触发用户注册的disconnect事件
        this.triggerEvent('disconnect');
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 处理认证响应
        if (data.type === 'auth_success') {
          console.log('✅ 认证成功:', data.message);
          console.log('👤 用户信息:', data.user);
          
          // 清除认证超时
          this.clearAuthTimeout();
          
          // 设置认证状态
          this.isAuthenticated = true;
          
          // 连接成功，重置重试计数
          this.retryCount = 0;
          this.isRetrying = false;
          
          // 触发认证成功事件
          this.triggerEvent('auth_success', data);
          // 触发connect事件
          this.triggerEvent('connect', data);
          
          return;
        }
        
        if (data.type === 'auth_failed' || data.type === 'auth_error') {
          console.error('❌ 认证失败:', data.message);
          
          // 清除认证超时
          this.clearAuthTimeout();
          
          // 触发认证失败事件
          this.triggerEvent('auth_failed', data);
          
          // 关闭连接
          this.disconnect();
          return;
        }
        
        // 未认证时不处理其他消息
        if (!this.isAuthenticated) {
          console.warn('收到消息但未认证，忽略消息');
          return;
        }
        
        // 假设服务器消息格式为 { type: 'message_type', data: {...} }
        if (data.type && this.eventHandlers[data.type]) {
          this.triggerEvent(data.type, data.data || data);
        } else {
          // 默认触发receive_message事件
          this.triggerEvent('receive_message', data);
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
        // 直接将原始消息传递给receive_message事件
        if (this.isAuthenticated) {
          this.triggerEvent('receive_message', event.data);
        }
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      this.triggerEvent('error', error);
    };

    // 返回一个包装后的对象，支持事件监听接口
    return {
      send: (data: any) => this.send(data),
      disconnect: () => this.disconnect(),
      on: (event: string, callback: Function) => this.on(event, callback),
      off: (event: string, callback?: Function) => this.off(event, callback),
      readyState: () => this.socket?.readyState,
      // 添加手动触发重试的方法
      retry: () => this.attemptReconnection()
    };
  }

  // 发送认证消息
  private sendAuthMessage() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket未连接，无法发送认证消息');
      return false;
    }
    
    const authMessage = {
      type: 'auth',
      token: this.authToken || '',
      workflow_type: this.workflowType
    };
    
    console.log('发送认证消息:', authMessage);
    this.socket.send(JSON.stringify(authMessage));
    return true;
  }
  
  // 清除认证超时
  private clearAuthTimeout() {
    if (this.authTimeout) {
      clearTimeout(this.authTimeout);
      this.authTimeout = null;
    }
  }
  
  // 发送消息
  send(data: any) {
    if (!this.isAuthenticated) {
      console.error('未认证，无法发送消息');
      return false;
    }
    
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
    // 清除重试计时器和认证超时
    this.clearRetryTimer();
    this.clearAuthTimeout();
    this.isRetrying = false;
    this.isAuthenticated = false;
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  // 尝试重新连接
  private attemptReconnection() {
    if (this.isRetrying) return;
    
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
        this.connect(this.userId, this.conversationId, this.authToken || undefined, this.workflowType);
      }
    }, currentInterval);
  }
  
  // 清除重试计时器
  private clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
  
  // 设置重试配置
  setRetryConfig(config: { maxRetries?: number; retryInterval?: number }) {
    if (config.maxRetries !== undefined) {
      this.maxRetries = config.maxRetries;
    }
    if (config.retryInterval !== undefined) {
      this.retryInterval = config.retryInterval;
    }
  }

  // 注册事件处理器
  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  }

  // 移除事件处理器
  off(event: string, callback?: Function) {
    if (!this.eventHandlers[event]) return;
    
    if (callback) {
      // 移除特定的回调函数
      this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
    } else {
      // 移除该事件的所有处理器
      delete this.eventHandlers[event];
    }
  }

  // 触发事件
  private triggerEvent(event: string, data?: any) {
    if (!this.eventHandlers[event]) return;
    
    this.eventHandlers[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`处理${event}事件时出错:`, error);
      }
    });
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN && this.isAuthenticated;
  }
  
  // 获取认证状态
  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }
}

export default new WebSocketService();