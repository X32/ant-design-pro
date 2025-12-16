// 导入所需的图标组件
import {
  AudioOutlined,  // 音频图标
  SendOutlined,   // 发送图标
  SettingOutlined,// 设置图标
  UserOutlined,   // 用户图标
  PlayCircleOutlined,
  PauseOutlined
} from '@ant-design/icons';

// 导入所需的Ant Design组件
import { Avatar, Button, Input, Layout, Progress, Space } from 'antd';
import { useState, useEffect, useRef } from 'react';

// 导入AudioRecorder06组件
import AudioRecorder from '@/pages/AudioRecorder06/AudioRecorder';
import { getConversationDetail, createMessage } from '@/services/ant-design-pro/api'; // 导入API函数
import './SpokenPractice.less'; // 导入样式文件

// 内联样式，用于WebSocket连接状态指示器
const styles = {
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    fontSize: '12px',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '6px',
  },
  connected: {
    backgroundColor: '#52c41a',
  },
  disconnected: {
    backgroundColor: '#ff4d4f',
  },
  statusText: {
    color: '#666',
  },
};
import webSocketService from '@/services/WebSocket/websocket';
// 解构Layout组件
const { Header, Content } = Layout;
const { TextArea } = Input;

/**
 * 消息数据接口定义
 */
interface Message {
  id: number;           // 消息ID
  content: string;      // 消息内容
  sender: 'user' | 'ai'; // 发送者角色
  timestamp: string;    // 发送时间戳
  audioFilePath?: string; // 音频文件路径（语音消息专用）
  messageType?: 'text' | 'voice'; // 消息类型
}



/**
 * AI口语练习组件
 * 提供文本对话、语音录制和口语评分功能
 */
const SpokenPractice: React.FC = () => {
  // 对话区域的引用，用于滚动到最新消息
  const conversationEndRef = useRef<HTMLDivElement>(null);
  // 会话消息列表状态管理
  // const [messages, setMessages] = useState<Message[]>([
  //   {
  //     id: 1,
  //     content: '你好！我是你的AI口语练习伙伴。今天想练习什么话题呢？',
  //     sender: 'ai',
  //     timestamp: '10:00',
  //   },
  // ]);
  //初始化空mssages
  const [messages, setMessages] = useState<Message[]>([]);
  
  // 文本输入框内容状态管理
  const [inputValue, setInputValue] = useState('');
  
  // 录音状态管理
  const [isRecording, setIsRecording] = useState(false);
  // 录音文件状态管理
  const [recordedFile, setRecordedFile] = useState<string | null>(null);
  
  // 音频播放状态管理
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  

  
  // WebSocket连接状态管理
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<any>(null);
    // WebSocket重试状态管理
    const [retryStatus, setRetryStatus] = useState<{
      isRetrying: boolean;
      attempt: number;
      maxRetries: number;
      interval: number;
      maxRetriesReached: boolean;
    }>({
      isRetrying: false,
      attempt: 0,
      maxRetries: 5,
      interval: 0,
      maxRetriesReached: false,
    });
    
    // 会话ID和用户ID（在实际应用中这些值应该从props或上下文中获取）
    const conversationId = 1;
    const userId = 1;
    
    // 用于生成唯一消息ID的计数器
    const [messageIdCounter, setMessageIdCounter] = useState(0);
    
    // 生成唯一消息ID的函数
    const generateMessageId = () => {
      setMessageIdCounter(prev => prev + 1);
      return Date.now() + Math.floor(Math.random() * 1000);
    };
  
  // 当消息列表更新时，自动滚动到最底部
  useEffect(() => {
    // 使用setTimeout确保DOM已经更新后再滚动
    const timer = setTimeout(() => {
      if (conversationEndRef.current) {
        conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]); // 依赖于messages状态，当messages改变时触发滚动
  
  // 组件挂载时连接WebSocket
    useEffect(() => {
      let wsSocket: any = null;
      
      try {
        // 连接WebSocket
        wsSocket = webSocketService.connect(userId, conversationId);
        setSocket(wsSocket);
        
        // 监听连接事件
        wsSocket.on('connect', () => {
          console.log('WebSocket 连接成功');
          setIsConnected(true);
          // 重置重试状态
          setRetryStatus(prev => ({
            ...prev,
            isRetrying: false,
            attempt: 0,
            maxRetriesReached: false,
          }));
        });
        
        // 监听断开连接事件
        wsSocket.on('disconnect', () => {
          console.log('WebSocket 连接断开');
          setIsConnected(false);
          if (!retryStatus.isRetrying && !retryStatus.maxRetriesReached) {
            setRetryStatus(prev => ({ ...prev, isRetrying: false }));
          }
        });
        
        // 监听重试事件
        wsSocket.on('retrying', (data: { attempt: number; maxRetries: number; interval: number }) => {
          console.log('WebSocket 正在重试连接', data);
          setRetryStatus({
            isRetrying: true,
            attempt: data.attempt,
            maxRetries: data.maxRetries,
            interval: data.interval,
            maxRetriesReached: false,
          });
        });
        
        // 监听重试达到最大次数事件
        wsSocket.on('maxRetriesReached', (data: { maxRetries: number }) => {
          console.log('WebSocket 重试达到最大次数', data);
          setRetryStatus(prev => ({
            ...prev,
            isRetrying: false,
            maxRetriesReached: true,
          }));
        });
        
        // 监听接收消息事件
        wsSocket.on('receive_message', (data: { content: string }) => {
          console.log('收到WebSocket消息:', data);
          
          // 创建AI回复消息
        const aiMessage: Message = {
          id: generateMessageId(),
          content: data.content || '我收到了你的消息！',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        });
        
        // 监听错误事件
        wsSocket.on('error', (error: any) => {
          console.error('WebSocket 错误:', error);
          setIsConnected(false);
        });
      } catch (error) {
        console.error('WebSocket连接初始化失败:', error);
      }
      
      // 组件卸载时断开连接
      return () => {
        console.log('断开WebSocket连接');
        if (wsSocket) {
          wsSocket.disconnect();
        }
      };
    }, []);

  /**
   * 发送用户消息到后端API
   * @param conversation_id 会话ID
   * @param user_id 用户ID
   * @param content 用户输入的消息内容
   * @param seq 消息序号
   * @returns 创建的消息信息或null
   */
  const sendUserMessageToAPI = async (conversation_id: number, user_id: number, content: string, seq: number) => {
    try {
      // 构造API请求参数
      const response = await createMessage(
        {
          conversation_id: conversation_id,
          user_id: user_id,
        },
        {
          role: 'user',
          seq: seq,
          contents: [
            {
              content_type: 'text',
              text: content,
              seq: 1,
            },
          ],
        }
      );
      
      console.log('消息发送成功:', response);
      return response;
    } catch (error) {
      console.error('消息发送失败:', error);
      return null;
    }
    };
    
    /**
     * 通过API发送消息（作为WebSocket备用方案）
     */
    const handleApiMessageSend = async (conversationId: number, userId: number, content: string, seq: number) => {
      try {
        // 调用API发送消息到后端
        const apiResponse = await sendUserMessageToAPI(conversationId, userId, content, seq);
        
        if (!apiResponse) {
          console.warn('消息发送未成功，可能存在API问题');
        }
        
        // 调用接口获取会话详情
        const response = await getConversationDetail({
          conversation_id: conversationId,
          user_id: userId,
        });

        // 创建AI回复消息
        let aiMessageContent = '收到你的消息！让我为你提供一些有用的信息。';
        
        // 处理API返回的数据，提取最后一条消息内容
        if (response && response.messages && response.messages.length > 0) {
          const lastMessage = response.messages[response.messages.length - 1];
          aiMessageContent = lastMessage.contents?.[0]?.text || aiMessageContent;
        }
        
        // 创建AI回复消息
        const aiMessage: Message = {
          id: generateMessageId(),
          content: aiMessageContent,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('处理消息发送失败:', error);
        
        // 错误情况下的默认回复
        const aiMessage: Message = {
          id: generateMessageId(),
          content: '抱歉，暂时无法获取回复。你的回答很好！让我给你一些反馈...',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      }
    };

  /**
   * 处理发送消息
   * 1. 创建用户消息并添加到消息列表
   * 2. 清空输入框
   * 3. 通过WebSocket发送消息
   * 4. 同时调用API作为备用方案
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // 创建用户消息
    const userMessage: Message = {
      id: generateMessageId(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    
    // 将用户消息添加到消息列表
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // 清空输入框
    setInputValue('');
    
    // 计算消息序号（基于当前消息列表长度）
    const messageSeq = messages.length + 1;
    
    // 通过WebSocket发送消息
    if (isConnected && socket) {
      try {
        // 使用原生WebSocket的send方法，发送JSON格式数据
        socket.send(JSON.stringify({
          'type': 'answer', // 添加消息类型标识
          conversation_id: conversationId,
          'content': inputValue,
          round_num: 1,
        }));
        console.log('通过WebSocket发送消息');
      } catch (error) {
        console.error('WebSocket发送消息失败:', error);
        // 发送失败时回退到API
        // handleApiMessageSend(conversationId, userId, inputValue, messageSeq);
      }
    } else {
    }
  };

  /**
   * 处理录音完成
   * 接收录音文件路径并更新状态
   */
  const handleRecordFinish = (filePath: string) => {
    setRecordedFile(filePath);
    setIsRecording(false);
    //打印filePath
    console.log('录音文件路径:', filePath);
    // 创建语音消息
    const newMessageId = Date.now() + Math.floor(Math.random() * 1000);
    const newMessage: Message = {
      id: newMessageId,
      content: '（语音消息）',
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      audioFilePath: filePath,
      messageType: 'voice',
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // 模拟AI分析回复和评分
    // setTimeout(() => {
    //   const aiMessage: Message = {
    //     id: Date.now() + Math.floor(Math.random() * 1000),
    //     content: '你的发音很清晰！让我给你详细的评分反馈。',
    //     sender: 'ai',
    //     timestamp: new Date().toLocaleTimeString([], {
    //       hour: '2-digit',
    //       minute: '2-digit',
    //     }),
    //   };
    //   setMessages(prevMessages => [...prevMessages, aiMessage]);
    // }, 1500);
  };

  /**
   * 处理录音取消
   */
  const handleRecordCancel = () => {
    setIsRecording(false);
    setRecordedFile(null);
  };

  /**
   * 处理录音按钮点击
   * 使用AudioRecorder06组件的弹框模式
   */
  const handleStartRecording = () => {
    // AudioRecorder06组件会处理弹框显示和录音逻辑
    // 这里不需要设置isRecording状态，由组件内部处理
  };

  /**
   * 播放音频消息
   */
  const playAudioMessage = (message: Message) => {
    if (!message.audioFilePath) return;
    
    // 如果正在播放其他音频，先停止
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    // 创建新的音频对象
    const audio = new Audio(message.audioFilePath);
    setAudioElement(audio);
    setPlayingMessageId(message.id);
    
    // 播放音频
    audio.play().catch(error => {
      console.error('音频播放失败:', error);
      setPlayingMessageId(null);
      setAudioElement(null);
    });
    
    // 音频播放结束时的处理
    audio.onended = () => {
      setPlayingMessageId(null);
      setAudioElement(null);
    };
    
    // 音频播放错误时的处理
    audio.onerror = () => {
      console.error('音频播放出错');
      setPlayingMessageId(null);
      setAudioElement(null);
    };
  };

  /**
   * 停止播放音频
   */
  const stopAudioMessage = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setPlayingMessageId(null);
      setAudioElement(null);
    }
  };

  // 渲染组件UI
  return (
    <Layout className="spoken-practice-layout">
      {/* 头部导航栏 */}
      <Header className="spoken-practice-header">
        <div className="header-left">
          <Avatar
            size={40}
            icon={<AudioOutlined />}
            className="app-icon"
          />
        </div>
        <div className="header-center">
          <h1 className="app-title">AI口语练习</h1>
        </div>
        <div className="header-right">
          <Space size="middle">
            <Button
              icon={<SettingOutlined />}
              ghost
              className="header-button"
            />
            <Avatar size={40} icon={<UserOutlined />} className="user-avatar" />
          </Space>
        </div>
      </Header>
      
      {/* 主内容区域 */}
      <Content className="spoken-practice-content">
        {/* 对话消息显示区域 */}
      <div className="conversation-area">
        {messages.map((message) => (
          <div key={message.id} className={`message-item ${message.sender}`}>
            <div className="message-bubble">
              {message.messageType === 'voice' && message.audioFilePath ? (
                <div className="voice-message-content">
                  <Button
                    type="text"
                    icon={playingMessageId === message.id ? 
                      <PauseOutlined style={{ color: '#ffffff' }} /> : 
                      <PlayCircleOutlined style={{ color: '#ffffff' }} />
                    }
                    onClick={() => 
                      playingMessageId === message.id ? 
                        stopAudioMessage() : 
                        playAudioMessage(message)
                    }
                    className="voice-play-button"
                    style={{ 
                      padding: '4px 8px',
                      height: 'auto',
                      lineHeight: 'normal',
                      color: '#ffffff',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {playingMessageId === message.id ? '暂停' : '播放'}
                  </Button>
                  <span className="voice-message-text">语音消息</span>
                </div>
              ) : (
                <p className="message-content">{message.content}</p>
              )}
              <p className="message-timestamp">{message.timestamp}</p>
            </div>
          </div>
        ))}
        {/* 滚动参考元素，用于定位到最新消息 */}
        <div ref={conversationEndRef} />
      </div>
        
        {/* 输入区域 */}
        <div className="input-area">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入内容..."
            rows={3}
            className="text-input"
            onPressEnter={(e) => {
              // Ctrl/Cmd + Enter 快速发送消息
              if (e.ctrlKey || e.metaKey) handleSendMessage();
            }}
          />
          <Space size="middle" className="input-buttons">
            {/* 语音按钮 - 使用AudioRecorder06组件的弹框模式 */}
            <AudioRecorder
              maxDuration={60}
              onFinish={handleRecordFinish}
              onCancel={handleRecordCancel}
              modalMode={true}
              triggerButton={
                <Button
                  icon={<AudioOutlined />}
                  type="primary"
                  className="voice-button"
                />
              }
            />
            {/* 发送按钮 */}
            <Button
              icon={<SendOutlined />}
              type="primary"
              onClick={handleSendMessage}
              className="send-button"
              loading={!isConnected}
              title={isConnected ? '发送消息' : '正在连接WebSocket...'}
            />
          </Space>
          {/* WebSocket连接状态指示器 */}
          <div style={styles.connectionStatus}>
            <span style={{...styles.statusIndicator, ...(isConnected ? styles.connected : styles.disconnected)}}></span>
            <span style={styles.statusText}>
              {isConnected 
                ? 'WebSocket已连接'
                : retryStatus.isRetrying
                  ? `连接中... (${retryStatus.attempt}/${retryStatus.maxRetries})`
                  : retryStatus.maxRetriesReached
                    ? '连接失败，已达到最大重试次数'
                    : 'WebSocket未连接'
              }
            </span>
            {retryStatus.maxRetriesReached && (
              <Button
                size="small"
                type="link"
                onClick={() => {
                  console.log('手动触发WebSocket重试');
                  if (socket && socket.retry) {
                    socket.retry();
                    // 重置最大重试状态
                    setRetryStatus(prev => ({ ...prev, maxRetriesReached: false }));
                  }
                }}
                style={{ marginLeft: '8px' }}
              >
                重试
              </Button>
            )}
          </div>
        </div>
        

      </Content>
    </Layout>
  );
};

export default SpokenPractice;
