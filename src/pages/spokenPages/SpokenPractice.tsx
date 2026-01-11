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
import { Avatar, Button, Input, Layout, Progress, Space, Image } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from '@umijs/max'; // 导入useSearchParams用于获取URL参数

// 导入AudioRecorder06组件
import AudioRecorder from '@/pages/AudioRecorder06/AudioRecorder';
import { getConversationDetail, createMessage, uploadAudioWithTranscription, getTranscriptionStatus } from '@/services/ant-design-pro/api'; // 导入API函数
import { TOKEN_KEY, USER_ID_KEY, CONVERSATION_ID_KEY } from '@/config/apiConfig'; // 导入Token键名常量
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
 * 评分详情接口
 */
interface ScoreContent {
  rawText: string;              // 原始文本
  dimensionScores?: string;     // 维度分数（第一行）
  totalScore?: string;          // 总分行
  advantages?: string;          // 优势部分
  disadvantages?: string;       // 不足部分
  suggestions?: string;         // 改进建议
}

/**
 * 消息数据接口定义
 */
interface Message {
  id: number;           // 消息ID
  content: string | ScoreContent; // 消息内容（文本或评分对象）
  sender: 'user' | 'ai'; // 发送者角色
  timestamp: string;    // 发送时间戳
  audioFilePath?: string; // 音频文件路径（用户语音消息）
  messageType?: 'text' | 'voice' | 'image' | 'score'; // 消息类型
  transcriptionText?: string; // 转写文本（语音消息专用）
  transcriptionStatus?: 'pending' | 'processing' | 'done' | 'failed'; // 转写状态
  // AI消息音频相关字段
  audioUrl?: string;      // AI消息的音频URL
  audioLoaded?: boolean;  // 音频是否已加载
  roundNum?: number;      // 轮次号
  // 图片消息相关字段
  imageUrl?: string;      // 图片URL
  // 评分消息相关字段
  score?: string;         // 总分
}

// AI音频基础URL
// const AI_AUDIO_BASE_URL = 'http://localhost:9002';

const AI_AUDIO_BASE_URL = 'http://192.168.4.30:9002';

/**
 * AI口语练习组件
 * 提供文本对话、语音录制和口语评分功能
 */
const SpokenPractice: React.FC = () => {
  // 获取URL参数
  const [searchParams] = useSearchParams();
  
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
  
  // AI音频自动播放开关（默认开启）
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  // AI音频缓存 Map<messageId, HTMLAudioElement>
  const aiAudioCacheRef = useRef<Map<number, HTMLAudioElement>>(new Map());
  

  
  // WebSocket连接状态管理
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    
    /**
     * 从URL参数获取paper_id
     * @returns paper_id 或 undefined
     */
    const getPaperIdFromUrl = (): number | undefined => {
      const urlPaperId = searchParams.get('exercise_id');
      if (urlPaperId) {
        const id = parseInt(urlPaperId, 10);
        if (!isNaN(id) && id > 0) {
          return id;
        }
      }
      return undefined;
    };
    
    /**
     * 获取或生成会话ID
     * 优先级: URL参数 > localStorage > 生成新ID
     */
    const getOrCreateConversationId = (): number => {
      // 1. 尝试从URL参数获取
      const urlConversationId = searchParams.get('conversationId');
      if (urlConversationId) {
        const id = parseInt(urlConversationId, 10);
        if (!isNaN(id) && id > 0) {
          // 保存到localStorage
          localStorage.setItem(CONVERSATION_ID_KEY, id.toString());
          return id;
        }
      }
          
      // 2. 尝试从lectalStorage获取
      const storedId = localStorage.getItem(CONVERSATION_ID_KEY);
      if (storedId) {
        const id = parseInt(storedId, 10);
        if (!isNaN(id) && id > 0) {
          return id;
        }
      }
            
      // 3. 生成新的会话ID（使用时间戳确保唯一性）
      const newId = Date.now();
      localStorage.setItem(CONVERSATION_ID_KEY, newId.toString());
      console.log('生成新的会话ID:', newId);
      return newId;
    };
    
    // 会话ID和用户ID（从localStorage获取用户ID）
    const conversationId = getOrCreateConversationId();
    const userId = parseInt(localStorage.getItem(USER_ID_KEY) || '1', 10);
    
   
    // 用于生成唯一消息ID的计数器
    const [messageIdCounter, setMessageIdCounter] = useState(0);
    
    // 生成唯一消息ID的函数
    const generateMessageId = () => {
      setMessageIdCounter(prev => prev + 1);
      return Date.now() + Math.floor(Math.random() * 1000);
    };
    
    /**
     * 预加载并播放AI音频
     * @param messageId 消息ID
     * @param audioUrl 音频URL
     */
    const preloadAndPlayAiAudio = (messageId: number, audioUrl: string) => {
      // 停止当前正在播放的音频
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      
      // 创建新的Audio对象
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      
      // 缓存音频对象
      aiAudioCacheRef.current.set(messageId, audio);
      
      // 监听加载完成事件
      audio.onloadeddata = () => {
        console.log('AI音频加载完成:', messageId);
        // 更新消息的加载状态
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, audioLoaded: true } : msg
        ));
      };
      
      // 监听可以播放事件
      audio.oncanplaythrough = () => {
        // 如果开启了自动播放，开始播放
        if (autoPlayEnabled) {
          console.log('自动播放AI音频:', messageId);
          setPlayingMessageId(messageId);
          setAudioElement(audio);
          audio.play().catch(err => {
            console.error('自动播放失败（可能需要用户交互）:', err);
            setPlayingMessageId(null);
          });
        }
      };
      
      // 音频播放结束
      audio.onended = () => {
        console.log('AI音频播放结束:', messageId);
        setPlayingMessageId(null);
        setAudioElement(null);
      };
      
      // 音频加载错误
      audio.onerror = (e) => {
        console.error('AI音频加载失败:', messageId, e);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, audioLoaded: false } : msg
        ));
      };
    };
    
    /**
     * 播放AI消息音频（手动触发）
     */
    const playAiMessageAudio = (message: Message) => {
      if (!message.audioUrl) return;
      
      // 停止当前正在播放的音频
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      
      // 尝试从缓存获取音频
      let audio = aiAudioCacheRef.current.get(message.id);
      
      if (!audio) {
        // 缓存中没有，创建新的
        audio = new Audio(message.audioUrl);
        aiAudioCacheRef.current.set(message.id, audio);
      }
      
      // 重置播放位置
      audio.currentTime = 0;
      
      setPlayingMessageId(message.id);
      setAudioElement(audio);
      
      audio.onended = () => {
        setPlayingMessageId(null);
        setAudioElement(null);
      };
      
      audio.play().catch(err => {
        console.error('播放AI音频失败:', err);
        setPlayingMessageId(null);
        setAudioElement(null);
      });
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
        // 从localStorage获取token
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (!token) {
          console.error('未找到认证Token，请先登录');
          return;
        }
        
        console.log('使用Token连接WebSocket:', token);
        
        // 从URL获取paper_id
        let paperId = getPaperIdFromUrl();
        console.log('从URL获取的paper_id:', paperId);
        if (paperId === undefined || paperId === 0) {
          paperId = 25;
          console.log('没有从URL获取paper_id使用默认id :', paperId);
        }
        //从URL获取workflow_type
        let workflowType = searchParams.get('workflow_type');
        if (!workflowType) {
          workflowType = 'fce_part1';
          console.log('没有从URL获取workflow_type使用默认workflow_type :', workflowType);
        }
        console.log('从URL获取的workflow_type:', workflowType);
       
        
        // 连接WebSocket，传入token、workflow_type和paper_id
        wsSocket = webSocketService.connect(userId, conversationId, token, workflowType, paperId);
        setSocket(wsSocket);
        
        // 监听认证成功事件
        wsSocket.on('auth_success', (data: any) => {
          console.log('✅ WebSocket 认证成功');
          console.log('👤 用户信息:', data.user);
          setIsConnected(true);
          setIsAuthenticated(true);
          
          // 重置重试状态
          setRetryStatus(prev => ({
            ...prev,
            isRetrying: false,
            attempt: 0,
            maxRetriesReached: false,
          }));
        });
        
        // 监听认证失败事件
        wsSocket.on('auth_failed', (data: any) => {
          console.error('❌ WebSocket 认证失败:', data.message);
          setIsConnected(false);
          setIsAuthenticated(false);
          
          // 清理消息列表
          setMessages([]);
          
          // 可以显示错误提示给用户
          // message.error('认证失败，请重新登录');
          
          // 刷新页面
          setTimeout(() => {
            window.location.reload();
          }, 1000); // 延迟1秒刷新，让用户看到错误信息
        });
        
        // 监听认证超时事件
        wsSocket.on('auth_timeout', () => {
          console.error('❌ WebSocket 认证超时');
          setIsConnected(false);
          setIsAuthenticated(false);
          
          // 清理消息列表
          setMessages([]);
          
          // 刷新页面
          setTimeout(() => {
            window.location.reload();
          }, 1000); // 延迟1秒刷新
        });
        
        // 监听断开连接事件
        wsSocket.on('disconnect', () => {
          console.log('WebSocket 连接断开，清理消息并刷新页面');
          setIsConnected(false);
          setIsAuthenticated(false);
          
          // 清理消息列表
          setMessages([]);
          
          // 刷新页面
          setTimeout(() => {
            window.location.reload();
          }, 500); // 延迟500ms刷新，确保状态已更新
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
        wsSocket.on('receive_message', (data: { 
          type?: string;
          content: any;
          timestamp?: number;
          round_num?: number;
          audio_url?: string;
          audio_cached?: boolean;
          score?: string;
        }) => {
          console.log('收到WebSocket消息:', data);
          
          const messageId = generateMessageId();
          
          // 判断消息类型
          if (data.type === 'image_url') {
            // 图片消息
            const imageMessage: Message = {
              id: messageId,
              content: data.content,
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              messageType: 'image',
              imageUrl: data.content,
              roundNum: data.round_num,
            };
            
            setMessages(prevMessages => [...prevMessages, imageMessage]);
            console.log('收到图片消息:', data.content);
          } else if (data.type === 'score') {
            // 评分消息 - 解析文本内容
            const contentText = typeof data.content === 'string' ? data.content : '';
            
            // 解析评分内容
            const parseScoreContent = (text: string): ScoreContent => {
              const lines = text.split('\n');
              const result: ScoreContent = { rawText: text };
              
              // 提取第一行维度分数
              if (lines.length > 0) {
                result.dimensionScores = lines[0];
              }
              
              // 查找各部分
              let currentSection = '';
              let advantagesText = '';
              let disadvantagesText = '';
              let suggestionsText = '';
              
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // 识别总分行
                if (line.startsWith('总分：')) {
                  result.totalScore = line;
                  continue;
                }
                
                // 识别章节标题
                if (line === '详细评价：') {
                  currentSection = 'detail';
                  continue;
                }
                if (line === '优势：') {
                  currentSection = 'advantages';
                  continue;
                }
                if (line === '不足：') {
                  currentSection = 'disadvantages';
                  continue;
                }
                if (line === '改进建议：') {
                  currentSection = 'suggestions';
                  continue;
                }
                
                // 收集各部分内容
                if (currentSection === 'advantages' && line) {
                  advantagesText += line + '\n';
                } else if (currentSection === 'disadvantages' && line) {
                  disadvantagesText += line + '\n';
                } else if (currentSection === 'suggestions' && line) {
                  suggestionsText += line + '\n';
                }
              }
              
              result.advantages = advantagesText.trim();
              result.disadvantages = disadvantagesText.trim();
              result.suggestions = suggestionsText.trim();
              
              return result;
            };
            
            const parsedContent = parseScoreContent(contentText);
            
            const scoreMessage: Message = {
              id: messageId,
              content: parsedContent,
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              messageType: 'score',
              score: data.score,
              roundNum: data.round_num,
            };
            
            setMessages(prevMessages => [...prevMessages, scoreMessage]);
            console.log('收到评分消息, 总分:', data.score);
          } else {
            // 文本/音频消息
            // 构建完整音频URL
            let fullAudioUrl: string | undefined;
            if (data.audio_url) {
              fullAudioUrl = `${AI_AUDIO_BASE_URL}${data.audio_url}`;
              console.log('AI音频URL:', fullAudioUrl);
            }
            
            // 创建AI回复消息
            const aiMessage: Message = {
              id: messageId,
              content: typeof data.content === 'string' ? data.content : '我收到了你的消息！',
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              audioUrl: fullAudioUrl,
              audioLoaded: false,
              roundNum: data.round_num,
            };
            
            setMessages(prevMessages => [...prevMessages, aiMessage]);
            
            // 预加载并自动播放音频
            if (fullAudioUrl) {
              preloadAndPlayAiAudio(messageId, fullAudioUrl);
            }
          }
        });
        
        // 监听错误事件
        wsSocket.on('error', (error: any) => {
          console.error('WebSocket 错误:', error);
          setIsConnected(false);
        });
      } catch (error) {
        console.error('WebSocket连接初始化失败:', error);
      }
      
      // 组件卸载时断开连接并清理音频缓存
      return () => {
        console.log('断开WebSocket连接');
        if (wsSocket) {
          wsSocket.disconnect();
        }
        // 清理音频缓存
        aiAudioCacheRef.current.forEach((audio) => {
          audio.pause();
          audio.src = '';
        });
        aiAudioCacheRef.current.clear();
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
   * 将WebM格式的音频转换为WAV格式
   */
  const convertWebMToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 创建WAV文件头
          const length = audioBuffer.length * audioBuffer.numberOfChannels * 2;
          const buffer = new ArrayBuffer(44 + length);
          const view = new DataView(buffer);
          const sampleRate = audioBuffer.sampleRate;
          const numChannels = audioBuffer.numberOfChannels;

          // WAV文件头
          const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
              view.setUint8(offset + i, string.charCodeAt(i));
            }
          };

          // RIFF标识符
          writeString(0, 'RIFF');
          view.setUint32(4, 36 + length, true);
          writeString(8, 'WAVE');
          
          // fmt子块
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, numChannels, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * numChannels * 2, true);
          view.setUint16(32, numChannels * 2, true);
          view.setUint16(34, 16, true);
          
          // data子块
          writeString(36, 'data');
          view.setUint32(40, length, true);

          // 音频数据
          let offset = 44;
          for (let channel = 0; channel < numChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < audioBuffer.length; i++) {
              const sample = Math.max(-1, Math.min(1, channelData[i]));
              view.setInt16(offset, sample * 0x7FFF, true);
              offset += 2;
            }
          }

          const wavBlob = new Blob([buffer], { type: 'audio/wav' });
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('读取音频文件失败'));
      fileReader.readAsArrayBuffer(webmBlob);
    });
  };

  /**
   * 上传音频文件到服务器并转写为文字
   */
  const uploadAudioToServer = async (audioBlob: Blob, filename: string) => {
    try {
      // 转换为WAV格式
      const wavBlob = await convertWebMToWav(audioBlob);
      
      // 从localStorage获取token
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        console.error('未找到认证Token，请先登录');
        throw new Error('未找到认证Token，请先登录');
      }
      
      // 使用API服务层上传文件并开始转写，传入userId和token
      const uploadResult = await uploadAudioWithTranscription(
        wavBlob, 
        filename, 
        'en',
        userId,
        token
      );
      
      if (uploadResult.success) {
        console.log('文件上传成功:', uploadResult);
        console.log('任务ID:', uploadResult.task_id);
        
        // 返回结果，包含 task_id 用于后续查询
        return {
          success: true,
          task_id: uploadResult.task_id,
          filePath: uploadResult.file_path,
          message: uploadResult.message,
        };
      } else {
        throw new Error(uploadResult.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    }
  };

  /**
   * 轮询查询转写状态
   */
  const pollTranscriptionStatus = async (taskId: string, maxAttempts: number = 30, interval: number = 2000): Promise<string | null> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const statusResult = await getTranscriptionStatus(taskId);
        
        console.log(`转写状态查询 (${i + 1}/${maxAttempts}):`, statusResult.status);
        
        if (statusResult.status === 'DONE') {
          if (statusResult.result && statusResult.result.success) {
            console.log('转写成功:', statusResult.result.text);
            return statusResult.result.text;
          } else {
            console.error('转写失败:', statusResult.result?.error);
            return null;
          }
        } else if (statusResult.status === 'FAILED') {
          console.error('转写任务失败:', statusResult.error);
          return null;
        }
        
        // 如果还在处理中，等待一段时间后再查询
        if (i < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error('查询转写状态失败:', error);
        // 继续重试
        if (i < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
    }
    
    console.warn('转写状态查询超时');
    return null;
  };

  /**
   * 处理录音完成
   * 接收录音文件路径和音频Blob数据，并上传到服务器
   */
  const handleRecordFinish = async (filePath: string, audioBlob: Blob) => {
    setRecordedFile(filePath);
    setIsRecording(false);
    
    console.log('录音文件路径:', filePath);
    
    // 创建语音消息（本地播放用）
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
      transcriptionStatus: 'pending',
      transcriptionText: '转写中...',
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `recording_${timestamp}.wav`;
      
      // 上传音频文件到服务器
      const uploadResult = await uploadAudioToServer(audioBlob, filename);
      
      // 如果上传成功，更新消息的音频文件路径
      if (uploadResult && uploadResult.filePath) {
        // 注意：不更新audioFilePath，因为服务器返回的路径可能不是可直接访问的URL
        // 保持使用本地Blob URL进行播放
        console.log('音频上传成功，服务器路径:', uploadResult.filePath);
        console.log('保持使用本地Blob URL进行播放:', filePath);
        
        // 开始轮询转写状态
        if (uploadResult.task_id) {
          console.log('开始查询转写状态，任务ID:', uploadResult.task_id);
          
          // 轮询查询转写结果
          const transcriptionText = await pollTranscriptionStatus(uploadResult.task_id);
          
          if (transcriptionText) {
            // 转写成功，更新消息的转写文本
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === newMessageId 
                  ? { 
                      ...msg, 
                      transcriptionText: transcriptionText,
                      transcriptionStatus: 'done' as const
                    } 
                  : msg
              )
            );
            
            // 可以将转写结果通过WebSocket发送给服务器
            if (isConnected && socket) {
              try {
                socket.send(JSON.stringify({
                  'type': 'answer',
                  conversation_id: conversationId,
                  'content': transcriptionText,
                  round_num: 1,
                }));
                console.log('已将转写结果通过WebSocket发送');
              } catch (error) {
                console.error('WebSocket发送转写结果失败:', error);
              }
            }
          } else {
            // 转写失败，更新状态
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === newMessageId 
                  ? { 
                      ...msg, 
                      transcriptionText: '转写失败',
                      transcriptionStatus: 'failed' as const
                    } 
                  : msg
              )
            );
          }
        }
      }
    } catch (error) {
      console.error('音频上传失败:', error);
      // 即使上传失败，消息仍然保留，只是使用本地路径播放
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMessageId 
            ? { 
                ...msg, 
                transcriptionText: '上传失败',
                transcriptionStatus: 'failed' as const
              } 
            : msg
        )
      );
    }
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
    
    // 检查音频路径是否为本地Blob URL或者服务器URL
    let audioSrc = message.audioFilePath;
    
    // 如果是服务器路径，确保使用完整URL
    if (!audioSrc.startsWith('blob:') && !audioSrc.startsWith('http')) {
      // 假设服务器返回的是相对路径，需要添加基础URL
      console.warn('音频路径不是完整URL，跳过播放:', audioSrc);
      return;
    }
    
    console.log('开始播放音频:', audioSrc);
    
    // 创建新的音频对象
    const audio = new Audio();
    audio.src = audioSrc;
    audio.preload = 'auto';
    
    setAudioElement(audio);
    setPlayingMessageId(message.id);
    
    // 监听音频加载事件
    audio.onloadedmetadata = () => {
      console.log('音频元数据加载成功');
    };
    
    audio.oncanplaythrough = () => {
      console.log('音频可以播放');
    };
    
    // 播放音频
    audio.play().catch(error => {
      console.error('音频播放失败:', error);
      console.error('音频源:', audioSrc);
      setPlayingMessageId(null);
      setAudioElement(null);
    });
    
    // 音频播放结束时的处理
    audio.onended = () => {
      console.log('音频播放结束');
      setPlayingMessageId(null);
      setAudioElement(null);
    };
    
    // 音频播放错误时的处理
    audio.onerror = (e) => {
      console.error('音频播放出错:', e);
      console.error('错误类型:', audio.error?.code, audio.error?.message);
      console.error('音频源:', audioSrc);
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
              {/* 用户语音消息 */}
              {message.sender === 'user' && message.messageType === 'voice' && message.audioFilePath ? (
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
                  {/* 显示转写文本 */}
                  {message.transcriptionText && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: message.transcriptionStatus === 'failed' ? '#ff4d4f' : '#ffffff'
                    }}>
                      {message.transcriptionStatus === 'pending' && '🔄 '}
                      {message.transcriptionStatus === 'done' && '✅ '}
                      {message.transcriptionStatus === 'failed' && '❌ '}
                      {message.transcriptionText}
                    </div>
                  )}
                </div>
              ) : message.sender === 'ai' && message.messageType === 'image' && message.imageUrl ? (
                /* AI图片消息 */
                <div className="ai-image-message-content">
                  <Image
                    src={message.imageUrl}
                    alt="图片消息"
                    style={{ 
                      maxWidth: '300px',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    preview={{
                      mask: '点击放大',
                    }}
                  />
                </div>
              ) : message.sender === 'ai' && message.messageType === 'score' ? (
                /* AI评分消息 */
                <div className="ai-score-message-content" style={{
                  padding: '16px',
                  backgroundColor: '#f6ffed',
                  borderRadius: '12px',
                  border: '2px solid #b7eb8f',
                  maxWidth: '600px'
                }}>
                  {/* 标题 */}
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#52c41a',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '24px' }}>📊</span>
                    <span>口语评分结果</span>
                  </div>
                  
                  {/* 总分 */}
                  {message.score && (
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: '#52c41a',
                      marginBottom: '16px',
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #d9f7be'
                    }}>
                      总分: {message.score}
                    </div>
                  )}
                  
                  {typeof message.content === 'object' && message.content !== null && (
                    <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                      {/* 维度分数 */}
                      {(message.content as ScoreContent).dimensionScores && (
                        <div style={{ 
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #d9f7be'
                        }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#389e0d', 
                            marginBottom: '8px',
                            fontSize: '15px'
                          }}>
                            📈 各维度评分
                          </div>
                          <div style={{ color: '#595959', whiteSpace: 'pre-wrap' }}>
                            {(message.content as ScoreContent).dimensionScores}
                          </div>
                        </div>
                      )}
                      
                      {/* 总分行 */}
                      {(message.content as ScoreContent).totalScore && (
                        <div style={{ 
                          marginBottom: '16px',
                          padding: '10px',
                          backgroundColor: '#e6f7ff',
                          borderRadius: '6px',
                          color: '#0050b3',
                          fontWeight: '500'
                        }}>
                          {(message.content as ScoreContent).totalScore}
                        </div>
                      )}
                      
                      {/* 优势 */}
                      {(message.content as ScoreContent).advantages && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#52c41a', 
                            marginBottom: '8px',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>✅</span>
                            <span>优势</span>
                          </div>
                          <div style={{ 
                            paddingLeft: '12px',
                            color: '#262626',
                            whiteSpace: 'pre-wrap',
                            backgroundColor: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px',
                            borderLeft: '3px solid #52c41a'
                          }}>
                            {(message.content as ScoreContent).advantages}
                          </div>
                        </div>
                      )}
                      
                      {/* 不足 */}
                      {(message.content as ScoreContent).disadvantages && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#fa8c16', 
                            marginBottom: '8px',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>⚠️</span>
                            <span>不足</span>
                          </div>
                          <div style={{ 
                            paddingLeft: '12px',
                            color: '#262626',
                            whiteSpace: 'pre-wrap',
                            backgroundColor: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px',
                            borderLeft: '3px solid #fa8c16'
                          }}>
                            {(message.content as ScoreContent).disadvantages}
                          </div>
                        </div>
                      )}
                      
                      {/* 改进建议 */}
                      {(message.content as ScoreContent).suggestions && (
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#1890ff', 
                            marginBottom: '8px',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>💡</span>
                            <span>改进建议</span>
                          </div>
                          <div style={{ 
                            paddingLeft: '12px',
                            color: '#262626',
                            whiteSpace: 'pre-wrap',
                            backgroundColor: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px',
                            borderLeft: '3px solid #1890ff'
                          }}>
                            {(message.content as ScoreContent).suggestions}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : message.sender === 'ai' && message.audioUrl ? (
                /* AI消息带音频 */
                <div className="ai-audio-message-content">
                  <p className="message-content">{typeof message.content === 'string' ? message.content : 'AI消息'}</p>
                  <div style={{ 
                    marginTop: '8px', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Button
                      type="text"
                      size="small"
                      icon={playingMessageId === message.id ? 
                        <PauseOutlined /> : 
                        <PlayCircleOutlined />
                      }
                      onClick={() => 
                        playingMessageId === message.id ? 
                          stopAudioMessage() : 
                          playAiMessageAudio(message)
                      }
                      style={{ 
                        padding: '2px 8px',
                        height: 'auto',
                        color: '#1890ff',
                        backgroundColor: 'rgba(24, 144, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {playingMessageId === message.id ? '暂停' : '播放音频'}
                    </Button>
                    {!message.audioLoaded && (
                      <span style={{ fontSize: '12px', color: '#999' }}>加载中...</span>
                    )}
                  </div>
                </div>
              ) : (
                /* 普通文本消息 */
                <p className="message-content">{typeof message.content === 'string' ? message.content : 'AI消息'}</p>
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
              loading={!isConnected || !isAuthenticated}
              disabled={!isConnected || !isAuthenticated}
              title={
                !isConnected 
                  ? '正在连接WebSocket...'
                  : !isAuthenticated
                    ? '正在认证...'
                    : '发送消息'
              }
            />
          </Space>
          {/* WebSocket连接状态指示器 */}
          <div style={styles.connectionStatus}>
            <span style={{...styles.statusIndicator, ...(isConnected && isAuthenticated ? styles.connected : styles.disconnected)}}></span>
            <span style={styles.statusText}>
              {isConnected && isAuthenticated
                ? 'WebSocket已连接并认证'
                : isConnected && !isAuthenticated
                  ? '正在认证...'
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
