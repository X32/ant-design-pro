// 导入所需的图标组件
import {
  AudioOutlined,  // 音频图标
  SendOutlined,   // 发送图标
  SettingOutlined,// 设置图标
  PlayCircleOutlined,
  PauseOutlined,
  ExperimentOutlined, // 测试图标
  CloseOutlined,      // 关闭图标
  ArrowLeftOutlined,  // 返回箭头图标
} from '@ant-design/icons';

// 导入所需的Ant Design组件
import { Avatar, Button, Input, Layout, Progress, Space, Modal, App, Dropdown, Card } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, history } from '@umijs/max'; // 导入useSearchParams用于获取URL参数
import UserAvatar from '@/components/UserAvatar';
import FireworkAnimation from '@/components/fireworkAnimation';  // 导入烟花动画组件
import winSound from '@/components/fireworkAnimation/win.mp3';  // 导入胜利音效

// 导入AudioRecorder06组件
import AudioRecorderInline from '@/pages/AudioRecorder06/AudioRecorderInline';
import { 
  getConversationDetail, 
  createMessage, 
  uploadAudioWithTranscription, 
  getTranscriptionStatus,
  createSpokenConversation,
  getSpokenMessages,
  createSpokenTextMessage,
  createSpokenVoiceMessage,
  createSpokenImageMessage,
  createSpokenScoreMessage,
  getWorkflowTypes,
  consumeCoins,
  getWalletBalance,
} from '@/services/ant-design-pro/api'; // 导入API函数
import { getMySubscription } from '@/services/ant-design-pro/api/vipSubscription'; // 导入VIP订阅接口
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
  improvedAnswer?: string;      // 改进的回答
}

/**
 * 消息数据接口定义
 */
interface Message {
  id: number;           // 消息ID
  content: string | ScoreContent; // 消息内容（文本或评分对象）
  sender: 'user' | 'ai'; // 发送者角色
  timestamp: string;    // 发送时间戳（显示用，格式：HH:mm）
  fullTimestamp?: Date; // 完整时间戳（保存用）
  audioFilePath?: string; // 音频文件路径（用户语音消息，本地Blob URL）
  serverAudioPath?: string; // 🔥 新增：服务器音频路径（用于保存到数据库）
  messageType?: 'text' | 'voice' | 'image' | 'score' | 'finish'; // 消息类型（新增 finish 类型）
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
const AI_AUDIO_BASE_URL = 'http://localhost:9002';
// const AI_AUDIO_BASE_URL = 'https://api.qtoplay.com';

/**
 * AI口语练习组件
 * 提供文本对话、语音录制和口语评分功能
 */
const SpokenPractice: React.FC = () => {
  // 获取URL参数
  const [searchParams] = useSearchParams();
  
  // 工作流类型价格映射表（从接口动态获取）
  const [workflowPriceMap, setWorkflowPriceMap] = useState<Map<string, number>>(new Map());
  // 💡 新增：使用 Ref 存储价格映射的副本，确保实时可用（解决状态更新异步问题）
  const workflowPriceMapRef = useRef<Map<string, number>>(new Map());
  const [priceLoading, setPriceLoading] = useState(false);
  
  /**
   * 将前端 timestamp 转换为 ISO 8601 格式
   * @param timestamp 显示时间戳（HH:mm）或完整时间戳
   * @param fullTimestamp 完整时间对象（优先使用）
   * @returns ISO 8601 格式字符串（如 2026-01-10T15:30:00）
   */
  const convertTimestampToISO = (timestamp: string, fullTimestamp?: Date): string => {
    if (fullTimestamp) {
      return fullTimestamp.toISOString().slice(0, 19); // 格式：2026-01-10T15:30:00
    }
    
    // 如果没有完整时间戳，使用当前日期 + 显示时间
    const now = new Date();
    const [hours, minutes] = timestamp.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);
    return now.toISOString().slice(0, 19);
  };
  
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
  
  // 调试模式：控制文本框和发送按钮的显示（默认隐藏，调试时改为true）
  const [showTextInput, setShowTextInput] = useState(false);
  
  // 图片放大状态管理：记录哪些图片消息处于放大状态
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());
  
  // 历史消息加载状态
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  // 💡 新增：会话结束状态
  const [conversationFinished, setConversationFinished] = useState(false);
  
  // 💡 新增：消息缓存 Ref（待保存的消息）
  const messageCacheRef = useRef<Message[]>([]);
  
  // 💡 新增：余额检查标记（避免重复检查）
  const balanceCheckedRef = useRef(false);
  
  // 💡 新增：VIP订阅状态
  const [hasVipSubscription, setHasVipSubscription] = useState(false);
  const [vipRemainingDays, setVipRemainingDays] = useState(0);
  const [vipLoading, setVipLoading] = useState(false);
  
  // 💡 新增：测试面板显示状态
  const [showTestPanel, setShowTestPanel] = useState(false);

  // 🎆 烟花动画状态
  const [showFirework, setShowFirework] = useState(false);

  
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
     * 从 URL 参数获取 paper_id
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
     * 从接口加载工作流类型价格映射
     */
    const fetchWorkflowPrices = async (): Promise<void> => {
      try {
        setPriceLoading(true);
        const response = await getWorkflowTypes({ only_active: true });
        
        if (response && response.success && Array.isArray(response.data)) {
          // 构建 value -> price 的映射表
          const priceMap = new Map<string, number>();
          response.data.forEach((item: API.WorkflowTypeOption) => {
            // 确保 price 是数字类型
            const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price));
            priceMap.set(item.value, price);
          });
          
          setWorkflowPriceMap(priceMap);
          workflowPriceMapRef.current = priceMap; // 🔥 同步更新 Ref
          console.log('✅ 工作流价格映射加载成功:', Object.fromEntries(priceMap));
        } else {
          console.error('❌ 获取工作流价格失败:', response);
        }
      } catch (error) {
        console.error('❌ 加载工作流价格异常:', error);
      } finally {
        setPriceLoading(false);
      }
    };
    
    /**
     * 💡 新增：获取用户VIP订阅状态
     * 查询用户是否有有效的VIP订阅（has_subscription == true && remaining_days > 0）
     */
    const fetchVipSubscriptionStatus = async (): Promise<void> => {
      try {
        setVipLoading(true);
        console.log('🔍 开始查询VIP订阅状态...');
        
        const response = await getMySubscription();
        
        if (response.success && response.data) {
          const { has_subscription, subscriptions } = response.data;
          
          // 检查是否有有效订阅：has_subscription 为 true 且至少有一个订阅的 remaining_days > 0
          let hasValidSubscription = false;
          let maxRemainingDays = 0;
          
          if (has_subscription && subscriptions && subscriptions.length > 0) {
            // 遍历所有订阅，找到最大的 remaining_days
            subscriptions.forEach((sub) => {
              if (sub.remaining_days > 0) {
                hasValidSubscription = true;
                maxRemainingDays = Math.max(maxRemainingDays, sub.remaining_days);
              }
            });
          }
          
          setHasVipSubscription(hasValidSubscription);
          setVipRemainingDays(maxRemainingDays);
          
          if (hasValidSubscription) {
            console.log(`✅ 用户拥有VIP订阅，剩余天数: ${maxRemainingDays} 天`);
            console.log('💎 VIP用户可以免费使用所有功能，无需金币支付');
          } else {
            console.log('❌ 用户没有有效的VIP订阅，需要金币支付');
          }
        } else {
          console.error('❌ 查询VIP订阅状态失败:', response.message);
          setHasVipSubscription(false);
          setVipRemainingDays(0);
        }
      } catch (error: any) {
        console.error('❌ 查询VIP订阅状态异常:', error);
        setHasVipSubscription(false);
        setVipRemainingDays(0);
      } finally {
        setVipLoading(false);
      }
    };
    
    /**
     * 根据 workflow_type 获取价格
     * @param workflowType 工作流类型（如 'fce_part1'）
     * @returns 价格（金币数），未找到返回 0
     */
    const getWorkflowPrice = (workflowType: string): number => {
      // ⭐ 优先使用 Ref，确保获取到最新的价格映射
      const priceMap = workflowPriceMapRef.current.size > 0 ? workflowPriceMapRef.current : workflowPriceMap;
      const price = priceMap.get(workflowType);
      
      if (price === undefined) {
        console.warn(`⚠️ 未找到 workflow_type "${workflowType}" 的价格，返回默认值 0`);
        console.warn(`⚠️ 当前价格映射:`, Object.fromEntries(priceMap));
        return 0;
      }
      return price;
    };
    
    /**
     * 获取当前会话的 workflow_type 和价格
     * @returns { workflowType: string, price: number }
     */
    const getCurrentWorkflowInfo = (): { workflowType: string; price: number } => {
      const workflowType = searchParams.get('workflow_type') || 'fce_part1';
      const price = getWorkflowPrice(workflowType);
      
      console.log(`💰 当前工作流: ${workflowType}, 价格: ${price} 金币`);
      
      return { workflowType, price };
    };
    
    /**
     * 检查用户余额是否充足
     * 💡 新增：如果用户有VIP订阅，直接返回充足状态，跳过金币检查
     * @param showModal 是否显示余额不足弹框（默认true）
     * @returns { sufficient: boolean, balance: number, price: number }
     */
    const checkBalance = async (showModal: boolean = true): Promise<{ sufficient: boolean; balance: number; price: number }> => {
      try {
        // 获取当前价格
        const { price } = getCurrentWorkflowInfo();
        
        // ✅ VIP用户特权：直接返回充足状态，无需金币
        if (hasVipSubscription && vipRemainingDays > 0) {
          console.log(`💎 VIP用户特权：跳过金币检查（剩余${vipRemainingDays}天）`);
          return {
            sufficient: true,
            balance: 0,
            price: 0,
          };
        }
        
        // 如果价格为0，直接返回充足
        if (price <= 0) {
          console.log('💰 练习价格为 0，跳过余额检查');
          return {
            sufficient: true,
            balance: 0,
            price: 0,
          };
        }
        
        // 查询用户余额
        const response = await getWalletBalance();
        
        if (response.success && response.data) {
          const balance = response.data.balance;
          const sufficient = balance >= price;
          console.log(`💰 用户余额: ${balance} 金币, 需要: ${price} 金币, 充足: ${sufficient}`);
          
          // 如果余额不足且需要显示弹框
          if (!sufficient && showModal) {
            Modal.confirm({
              title: '余额不足',
              content: (
                <div>
                  <p>您的金币余额不足，无法开始练习。</p>
                  <p style={{ marginTop: '12px' }}>
                    <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>当前余额：{balance} 金币</span>
                  </p>
                  <p>
                    <span style={{ color: '#1890ff', fontWeight: 'bold' }}>需要金币：{price} 金币</span>
                  </p>
                  <p style={{ marginTop: '12px', color: '#666' }}>是否前往充值页面？</p>
                </div>
              ),
              okText: '去充值',
              cancelText: '取消',
              onOk: () => {
                console.log('👉 跳转到充值页面');
                history.push('/orders/recharge');
              },
              onCancel: () => {
                console.log('❌ 用户取消充值');
              },
            });
          }
          
          return {
            sufficient: sufficient,
            balance: balance,
            price: price,
          };
        } else {
          console.error('❌ 查询余额失败:', response.message);
          return {
            sufficient: false,
            balance: 0,
            price: price,
          };
        }
      } catch (error: any) {
        console.error('❌ 查询余额异常:', error);
        return {
          sufficient: false,
          balance: 0,
          price: 0,
        };
      }
    };
    
    /**
     * 扣款方法：使用金币支付练习费用
     * 💡 新增：VIP用户跳过扣款，直接返回成功
     * @returns 扣款是否成功
     */
    const handleConsumeCoins = async (): Promise<boolean> => {
      try {
        // ✅ VIP用户特权：跳过扣款，直接返回成功
        if (hasVipSubscription && vipRemainingDays > 0) {
          console.log(`💎 VIP用户特权：跳过扣款（剩余${vipRemainingDays}天）`);
          
          // 在消息栏显示VIP特权消息
          const now = new Date();
          const vipMessage: Message = {
            id: generateMessageId(),
            content: `💎 VIP会员特权：本次练习免费（剩余${vipRemainingDays}天）`,
            sender: 'ai',
            timestamp: now.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            fullTimestamp: now,
            messageType: 'text',
          };
          
          setMessages(prevMessages => [...prevMessages, vipMessage]);
          console.log('💬 VIP特权消息已添加到消息栏');
          
          return true;
        }
        
        // 获取练习题目 ID
        const exerciseId = getPaperIdFromUrl();
        if (!exerciseId) {
          console.error('❌ 无法获取 exercise_id，无法扣款');
          Modal.error({
            title: '扣款失败',
            content: '无法获取练习题目 ID',
          });
          return false;
        }
        
        // 获取工作流类型和价格
        const { workflowType, price } = getCurrentWorkflowInfo();
        
        // 检查价格是否有效
        if (price <= 0) {
          console.warn('⚠️ 练习价格为 0，跳过扣款');
          return true;
        }
        
        // 获取课程名称（作为 remark）
        const remark = `口语练习 - ${workflowType}`;
        
        console.log(`💳 开始扣款: exercise_id=${exerciseId}, price=${price}, remark=${remark}`);
        
        // 调用扣款接口
        const response = await consumeCoins({
          coin_amount: price,
          biz_type: 'consume_practice',
          biz_id: exerciseId,
          remark: remark,
        });
        
        if (response.success) {
          console.log('✅ 扣款成功:', response.data);
          console.log(`💰 余额变化: ${response.data.balance_before} → ${response.data.balance_after}`);
          
          // 在消息栏显示支付成功消息
          const now = new Date();
          const paymentMessage: Message = {
            id: generateMessageId(),
            content: `💰 支付成功！已消费 ${response.data.consumed_amount} 金币，剩余余额: ${response.data.balance_after} 金币`,
            sender: 'ai',
            timestamp: now.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            fullTimestamp: now,
            messageType: 'text',
          };
          
          setMessages(prevMessages => [...prevMessages, paymentMessage]);
          console.log('💬 支付成功消息已添加到消息栏');
          
          return true;
        } else {
          console.error('❌ 扣款失败:', response.message);
          Modal.error({
            title: '支付失败',
            content: response.message || '金币支付失败，请重试',
          });
          return false;
        }
      } catch (error: any) {
        console.error('❌ 扣款异常:', error);
        
        // 解析错误信息
        let errorMessage = '金币支付失败，请重试';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Modal.error({
          title: '支付失败',
          content: errorMessage,
        });
        
        return false;
      }
    };
    
    /**
     * 处理对话结束时的扣款逻辑
     * 检查余额并执行扣款，余额不足时显示警告但不阻塞流程
     */
    const handleFinishConsumeCoins = async (): Promise<void> => {
      console.log('💳 开始执行对话结束扣款流程...');
      
      // 静默检查余额（不显示弹框）
      const balanceCheck = await checkBalance(false);
      
      if (!balanceCheck.sufficient) {
        console.warn(`⚠️ 余额不足: 当前余额=${balanceCheck.balance}, 需要=${balanceCheck.price}`);
        console.warn('⚠️ 扣款失败，但对话已结束');
        
        // 显示余额不足提示（但不影响对话结束流程）
        Modal.warning({
          title: '扣款失败',
          content: (
            <div>
              <p>练习已完成，但金币扣款失败（余额不足）。</p>
              <p style={{ marginTop: '12px' }}>
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>当前余额：{balanceCheck.balance} 金币</span>
              </p>
              <p>
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>需要金币：{balanceCheck.price} 金币</span>
              </p>
              <p style={{ marginTop: '12px', color: '#666' }}>请充值后再进行练习。</p>
            </div>
          ),
          okText: '我知道了',
        });
        
        // 余额不足，不执行扣款，但继续完成对话结束流程
        return;
      }
      
      // 余额充足，执行扣款
      console.log('💰 余额充足，开始执行扣款...');
      const consumeSuccess = await handleConsumeCoins();
      
      if (!consumeSuccess) {
        console.warn('⚠️ 扣款失败，但对话已结束');
      }
    };
        

    /**
     * 💾 批量保存缓存消息到数据库
     * @param conversationId 会话 ID
     * @param messages 待保存的消息列表
     */
    const batchSaveMessages = async (
      conversationId: number,
      messages: Message[]
    ): Promise<void> => {
      if (messages.length === 0) {
        console.log('⚠️ 无消息需要保存');
        return;
      }
      
      console.log(`💾 开始批量保存 ${messages.length} 条消息...`);
      console.log('🕒 消息时间顺序:', messages.map(m => ({
        id: m.id,
        type: m.messageType,
        timestamp: m.timestamp,
        fullTimestamp: m.fullTimestamp?.toISOString(),
        sender: m.sender
      })));
      
      // ⭐ 并发保存所有消息，使用缓存的精确时间戳
      const savePromises = messages.map((msg, index) => {
        // 将前端的 timestamp 转换为 ISO 8601 格式
        const createdAt = convertTimestampToISO(msg.timestamp, msg.fullTimestamp);
        console.log(`💾 [${index + 1}/${messages.length}] 准备保存消息: ${msg.messageType}, sender: ${msg.sender}, created_at: ${createdAt}`);
        
        if (msg.messageType === 'text' || !msg.messageType) {
          // 文本消息
          return createSpokenTextMessage(conversationId, {
            sender: msg.sender,
            content: typeof msg.content === 'string' ? msg.content : '',
            round_num: msg.roundNum,
            created_at: createdAt, // ⭐ 传入精确时间戳
          }).catch(err => {
            console.error(`❌ 保存文本消息失败 [${index + 1}/${messages.length}]:`, err);
            return null;
          });
        } else if (msg.messageType === 'voice') {
          // 语音消息
          // 🔥 优先使用服务器路径，如果没有则使用本地路径
          const audioPath = msg.serverAudioPath || msg.audioFilePath;
          console.log(`📦 保存语音消息 [${index + 1}/${messages.length}], 音频路径:`, audioPath);
          
          return createSpokenVoiceMessage(conversationId, {
            sender: msg.sender,
            audio_file_path: audioPath,
            round_num: msg.roundNum,
            transcription_text: msg.transcriptionText || '',
            created_at: createdAt, // ⭐ 传入精确时间戳
          }).catch(err => {
            console.error(`❌ 保存语音消息失败 [${index + 1}/${messages.length}]:`, err);
            return null;
          });
        } else if (msg.messageType === 'image') {
          // 图片消息
          return createSpokenImageMessage(conversationId, {
            image_url: msg.imageUrl!,
            round_num: msg.roundNum,
            created_at: createdAt, // ⭐ 传入精确时间戳
          }).catch(err => {
            console.error(`❌ 保存图片消息失败 [${index + 1}/${messages.length}]:`, err);
            return null;
          });
        } else if (msg.messageType === 'score') {
          // 评分消息
          const content = msg.content as ScoreContent;
          return createSpokenScoreMessage(conversationId, {
            raw_text: content.rawText,
            round_num: msg.roundNum,
            total_score: msg.score,
            dimension_scores: content.dimensionScores,
            advantages: content.advantages,
            disadvantages: content.disadvantages,
            suggestions: content.suggestions,
            improved_answer: content.improvedAnswer,
            created_at: createdAt, // ⭐ 传入精确时间戳
          }).catch(err => {
            console.error(`❌ 保存评分消息失败 [${index + 1}/${messages.length}]:`, err);
            return null;
          });
        }
        return Promise.resolve(null);
      });
      
      // 并发保存所有消息
      await Promise.all(savePromises);
      
      console.log('✅ 所有消息保存完成');
    };

    /**
     * 创建新的口语练习会话
     * @returns 返回新创建的会话 ID，失败返回 null
     */
    const createNewConversation = async (): Promise<number | null> => {
      console.log('开始创建新会话...');
      
      // 获取练习题目 ID 和工作流类型
      const exerciseId = getPaperIdFromUrl();
      const workflowType = searchParams.get('workflow_type') || 'fce_part1';
      
      try {
        const createResponse = await createSpokenConversation({
          exercise_id: exerciseId,
          workflow_type: workflowType,
          title: `口语练习 - ${new Date().toLocaleString('zh-CN')}`,
        });
        
        if (createResponse.success && createResponse.data) {
          const newConversationId = createResponse.data.id;
          console.log('新会话创建成功, ID:', newConversationId);
          
          // 更新 localStorage 中的会话 ID
          localStorage.setItem(CONVERSATION_ID_KEY, newConversationId.toString());
          
          // 初始化为空消息列表
          setMessages([]);
          setHistoryLoaded(true);
          
          console.log('新会话已创建，等待用户发送消息');
          return newConversationId;
        } else {
          console.error('创建会话失败:', createResponse);
          setHistoryLoaded(true);
          return null;
        }
      } catch (createError) {
        console.error('创建会话异常:', createError);
        setHistoryLoaded(true);
        return null;
      }
    };

    /**
     * 连接 WebSocket
     * @param realConversationId 真实的会话 ID
     */
    const connectWebSocket = (realConversationId: number) => {
      try {
        // 从 localStorage 获取 token
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (!token) {
          console.error('未找到认证Token，请先登录');
          return;
        }
        
        console.log('使用Token连接WebSocket:', token);
        console.log('使用真实会话ID连接:', realConversationId);
        
        // 从 URL 获取 paper_id
        let paperId = getPaperIdFromUrl();
        console.log('从URL获取的paper_id:', paperId);
        if (paperId === undefined || paperId === 0) {
          paperId = 25;
          console.log('没有从URL获取paper_id使用默认id :', paperId);
        }
        
        // 从 URL 获取 workflow_type
        let workflowType = searchParams.get('workflow_type');
        if (!workflowType) {
          workflowType = 'fce_part1';
          console.log('没有从URL获取workflow_type使用默认workflow_type :', workflowType);
        }
        console.log('从URL获取的workflow_type:', workflowType);
       
        // 连接 WebSocket，传入 token、workflow_type 和 paper_id
        const wsSocket = webSocketService.connect(userId, realConversationId, token, workflowType, paperId);
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
        wsSocket.on('receive_message', async (data: { 
          type?: string;
          content: any;
          timestamp?: number;
          round_num?: number;
          audio_url?: string;
          audio_cached?: boolean;
          score?: string;
        }) => {
          console.log('📨 收到 WebSocket 消息:', data);
          
          // 🏁 检查是否是 finish 消息
          if (data.type === 'finish') {
            console.log('🏁 对话结束，开始保存缓存消息...');
            
            try {
              // 1. 批量保存缓存消息
              await batchSaveMessages(realConversationId, messageCacheRef.current);

              // 2. 清空缓存
              messageCacheRef.current = [];
              
              // 3. 处理对话结束扣款
              await handleFinishConsumeCoins();
              
              // 4. 设置会话结束状态（触发 UI 禁用）
              setConversationFinished(true);
              
              // 🎆 触发烟花动画
              setShowFirework(true);
              console.log('🎆 烟花动画已触发');
              
              // 5. 移除 disconnect 事件监听器（避免触发自动刷新）
              console.log('🔌 移除 disconnect 事件监听器');
              wsSocket.off('disconnect');
              
              // 6. 断开 WebSocket
              console.log('🔌 断开 WebSocket 连接');
              wsSocket.disconnect();
              setSocket(null);
              setIsConnected(false);
              setIsAuthenticated(false);
              
              // 7. 插入结束消息到消息列表
              const now = new Date();
              const finishMessage: Message = {
                id: generateMessageId(),
                content: '🎉 对话已结束，您的口语练习已完成，成绩已保存！',
                sender: 'ai',
                timestamp: now.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                fullTimestamp: now, // ⭐ 保存完整时间戳
                messageType: 'finish',
              };
              
              setMessages(prevMessages => [...prevMessages, finishMessage]);
              console.log('✅ 对话结束处理完成，已插入结束消息');
              
            } catch (error) {
              console.error('❌ 保存消息失败:', error);
              
              Modal.error({
                title: '保存失败',
                content: '消息保存失败，请稍后重试',
              });
            }
            
            return; // finish 消息处理完毕，不继续处理
          }
                  
          const messageId = generateMessageId();
                  
          // 判断消息类型
          if (data.type === 'image_url') {
            // 图片消息
            const now = new Date();
            const imageMessage: Message = {
              id: messageId,
              content: data.content,
              sender: 'ai',
              timestamp: now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              fullTimestamp: now, // ⭐ 保存完整时间戳
              messageType: 'image',
              imageUrl: data.content,
              roundNum: data.round_num,
            };
                    
            setMessages(prevMessages => [...prevMessages, imageMessage]);
            messageCacheRef.current.push(imageMessage); // ⭐ 添加到缓存
            console.log('📝 收到图片消息，已缓存:', data.content);
                    
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
              let improvedAnswerText = '';

              
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
                if (line === '改进的回答：') {
                  currentSection = 'improved_answer';
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
                else if (currentSection === 'improved_answer' && line) {
                  improvedAnswerText += line + '\n';
                }
              }
              
              result.advantages = advantagesText.trim();
              result.disadvantages = disadvantagesText.trim();
              result.suggestions = suggestionsText.trim();
              result.improvedAnswer = improvedAnswerText.trim();
              
              return result;
            };
            
            const parsedContent = parseScoreContent(contentText);
            
            const now = new Date();
            const scoreMessage: Message = {
              id: messageId,
              content: parsedContent,
              sender: 'ai',
              timestamp: now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              fullTimestamp: now, // ⭐ 保存完整时间戳
              messageType: 'score',
              score: data.score,
              roundNum: data.round_num,
            };
            
            setMessages(prevMessages => [...prevMessages, scoreMessage]);
            messageCacheRef.current.push(scoreMessage); // ⭐ 添加到缓存
            console.log('📝 收到评分消息，已缓存, 总分:', data.score);
          } else {
            // 文本/音频消息
            // 构建完整音频URL
            let fullAudioUrl: string | undefined;
            if (data.audio_url) {
              fullAudioUrl = `${AI_AUDIO_BASE_URL}${data.audio_url}`;
              console.log('AI音频URL:', fullAudioUrl);
            }
            
            // 创建AI回复消息
            const now = new Date();
            const aiMessage: Message = {
              id: messageId,
              content: typeof data.content === 'string' ? data.content : '我收到了你的消息！',
              sender: 'ai',
              timestamp: now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              fullTimestamp: now, // ⭐ 保存完整时间戳
              audioUrl: fullAudioUrl,
              audioLoaded: false,
              roundNum: data.round_num,
              messageType: 'text',
            };
            
            setMessages(prevMessages => [...prevMessages, aiMessage]);
            messageCacheRef.current.push(aiMessage); // ⭐ 添加到缓存
            console.log('📝 收到文本消息，已缓存');
            
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
        
        console.log('✅ WebSocket 连接已初始化');
      } catch (error) {
        console.error('WebSocket连接初始化失败:', error);
      }
    };

    /**
     * 加载历史消息
     * @param conversationId 会话 ID
     * @returns 返回真实的会话 ID（可能创建了新会话）
     */
    const loadHistoryMessages = async (conversationId: number): Promise<number> => {
      if (historyLoaded || isLoadingHistory) {
        console.log('历史消息已加载或正在加载中');
        return conversationId;
      }
          
      try {
        setIsLoadingHistory(true);
        console.log('加载历史消息, 会话 ID:', conversationId);
            
        // 使用 skipErrorHandler 跳过全局错误处理，手动处理响应
        const response = await getSpokenMessages(conversationId, {
          skipErrorHandler: true,
        });
        
        // 🔍 调试：打印完整响应
        console.log('📦 getSpokenMessages 完整响应:', JSON.stringify(response, null, 2));
            
        if (response.success && response.data) {
          console.log(`✅ 成功加载 ${response.data.length} 条历史消息`);
              
          // 将后端数据转换为前端 Message 格式
          const historyMessages: Message[] = response.data.map((msg) => {
            const baseMessage: Message = {
              id: msg.id,
              content: msg.content,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              messageType: msg.message_type,
              roundNum: msg.round_num,
            };
                
            // 根据消息类型添加额外字段
            if (msg.message_type === 'voice') {
              baseMessage.audioFilePath = msg.audio_file_path;
              baseMessage.audioUrl = msg.audio_url;
              baseMessage.transcriptionText = msg.transcription_text;
              baseMessage.transcriptionStatus = msg.transcription_status;
            } else if (msg.message_type === 'image') {
              baseMessage.imageUrl = msg.image_url;
            } else if (msg.message_type === 'score') {
              baseMessage.score = msg.total_score;
              // 构建 ScoreContent 对象
              baseMessage.content = {
                rawText: msg.raw_text || msg.content,
                dimensionScores: msg.dimension_scores,
                totalScore: msg.total_score,
                advantages: msg.advantages,
                disadvantages: msg.disadvantages,
                suggestions: msg.suggestions,
                improvedAnswer: msg.improved_answer,
              };
            }
                
            return baseMessage;
          });
              
          setMessages(historyMessages);
          setHistoryLoaded(true);
          
          // 会话存在，返回当前 ID
          return conversationId;
        } else {
          // success=false 或其他情况，统一处理
          console.warn('⚠️ 加载失败，响应:', {
            success: response.success,
            error_code: response.error_code,
            message: response.message,
            data: response.data,
          });
          
          // 🎯 判断是否是会话不存在（多种方式）
          const isConversationNotFound = 
            response.error_code === 'CONVERSATION_NOT_FOUND' ||  // 方式1: error_code
            (response.message && response.message.includes('不存在')) ||  // 方式2: message内容
            (response.message && response.message.includes('not found')) ||  // 方式3: 英文message
            (response.data && Array.isArray(response.data) && response.data.length === 0 && response.total === 0);  // 方式4: 空数据
          
          if (isConversationNotFound) {
            console.log('💡 判断为会话不存在，创建新会话...');
            const newId = await createNewConversation();
            return newId || conversationId;
          }
          
          return conversationId;
        }
      } catch (error: any) {
        console.error('❌ 加载历史消息异常:', error);
        console.error('异常详情:', {
          name: error.name,
          message: error.message,
          info: error.info,
        });
        
        // 🔧 由于 skipErrorHandler 可能无效，异常仍会抛出
        // 这种情况下，我们直接认为是新会话，创建它
        if (error.name === 'BizError') {
          console.log('🔄 捕获到 BizError，默认创建新会话...');
          const newId = await createNewConversation();
          return newId || conversationId;
        }
        
        return conversationId;
      } finally {
        setIsLoadingHistory(false);
      }
    };
        
    /**
     * 获取或生成会话 ID
     * 优先级: URL参数 > localStorage > 生成新ID
     * 注意：此函数仅返回 ID，不执行异步操作（避免无限循环）
     */
    const getOrCreateConversationId = (): number => {
      // 1. 尝试从URL参数获取
      const urlConversationId = searchParams.get('conversationId');
      if (urlConversationId) {
        const id = parseInt(urlConversationId, 10);
        if (!isNaN(id) && id > 0) {
          // 保存到localStorage
          localStorage.setItem(CONVERSATION_ID_KEY, id.toString());
          console.log('从URL获取会话 ID:', id);
          return id;
        }
      }
          
      // 2. 尝试从localStorage获取
      const storedId = localStorage.getItem(CONVERSATION_ID_KEY);
      if (storedId) {
        const id = parseInt(storedId, 10);
        if (!isNaN(id) && id > 0) {
          console.log('从localStorage获取会话 ID:', id);
          return id;
        }
      }
            
      // 3. 生成新的会话ID（使用时间戳确保唯一性）
      const newId = Date.now();
      localStorage.setItem(CONVERSATION_ID_KEY, newId.toString());
      console.log('生成临时会话ID:', newId);
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
    // 使用setTimeout确保 DOM 已经更新后再滚动
    const timer = setTimeout(() => {
      if (conversationEndRef.current) {
        conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
      
    return () => clearTimeout(timer);
  }, [messages]); // 依赖于 messages 状态，当 messages 改变时触发滚动
    
  // 组件挂载时加载历史消息并连接 WebSocket
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // 0. 加载工作流价格映射和VIP订阅状态
        await Promise.all([
          fetchWorkflowPrices(),
          fetchVipSubscriptionStatus(), // ✅ 新增：加载VIP订阅状态
        ]);
        
        // 1. 加载历史消息（如果会话不存在会创建新会话）
        console.log('初始化会话 ID:', conversationId);
        const realConversationId = await loadHistoryMessages(conversationId);
        
        // 2. 使用真实的会话 ID 连接 WebSocket
        console.log('使用真实会话 ID 连接 WebSocket:', realConversationId);
        connectWebSocket(realConversationId);
      } catch (error) {
        console.error('初始化会话失败:', error);
      }
    };
      
    initializeConversation();
    
    // 组件卸载时断开连接并清理音频缓存
    return () => {
      console.log('🧹 组件卸载，开始清理资源...');
      
      // 1. 断开 WebSocket 连接
      if (socket) {
        console.log('🔌 断开 WebSocket 连接');
        socket.disconnect();
      }
      
      // 2. 停止并清理当前正在播放的音频
      if (audioElement) {
        console.log('🔇 停止当前正在播放的音频');
        audioElement.pause();
        audioElement.src = '';
        audioElement.load(); // 重置音频元素
        setAudioElement(null);
        setPlayingMessageId(null);
      }
      
      // 3. 清理所有缓存的 AI 音频
      if (aiAudioCacheRef.current.size > 0) {
        console.log(`🧹 清理 ${aiAudioCacheRef.current.size} 个缓存的 AI 音频`);
        aiAudioCacheRef.current.forEach((audio, messageId) => {
          audio.pause();
          audio.src = '';
          audio.load();
          console.log(`  • 已清理消息 ID ${messageId} 的音频`);
        });
        aiAudioCacheRef.current.clear();
      }
      
      console.log('✅ 资源清理完成');
    };
  }, []); // 空依赖数组，仅在组件挂载时执行一次
  
  // 💡 新增：beforeunload 事件处理（页面刷新/关闭时清除 conversationId）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果有未保存的消息，提示用户
      if (messageCacheRef.current.length > 0 && !conversationFinished) {
        e.preventDefault();
        e.returnValue = '对话尚未结束，离开将丢失未保存的消息！';
      }
      
      // 无论如何都清除 conversationId
      localStorage.removeItem(CONVERSATION_ID_KEY);
      console.log('🧹 页面关闭/刷新，已清除 conversationId');
    };
    
    // 监听浏览器返回/前进事件（使用 popstate）
    const handlePopState = () => {
      console.log('🔙 检测到浏览器返回操作，开始清理资源...');
      
      // 🧹 清理音频资源
      if (audioElement) {
        console.log('🔇 停止当前正在播放的音频');
        audioElement.pause();
        audioElement.src = '';
        audioElement.load();
        setAudioElement(null);
        setPlayingMessageId(null);
      }
      
      // 清理所有缓存的 AI 音频
      if (aiAudioCacheRef.current.size > 0) {
        console.log(`🧹 清理 ${aiAudioCacheRef.current.size} 个缓存的音频`);
        aiAudioCacheRef.current.forEach((audio) => {
          audio.pause();
          audio.src = '';
          audio.load();
        });
        aiAudioCacheRef.current.clear();
      }
      
      // 清除 conversationId
      localStorage.removeItem(CONVERSATION_ID_KEY);
      console.log('✅ 浏览器返回清理完成');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // 组件卸载时也清除（路由跳转时）
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      
      // 组件卸载时清除 conversationId
      console.log('🧹 组件卸载，清除 conversationId');
      localStorage.removeItem(CONVERSATION_ID_KEY);
    };
  }, [conversationFinished, audioElement]);


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
   * 2. 添加到缓存（不立即保存数据库）
   * 3. 清空输入框
   * 4. 通过 WebSocket 发送消息
   */
  const handleSendMessage = async () => {
    // 🚫 对话结束后不允许发送
    if (!inputValue.trim() || conversationFinished) {
      if (conversationFinished) {
        console.warn('⚠️ 对话已结束，不能发送消息');
      }
      return;
    }
    
    // 💰 首次操作时检查余额（仅检查一次）
    if (!balanceCheckedRef.current) {
      console.log('💰 首次发送消息，检查余额...');
      const balanceCheck = await checkBalance(true); // 显示弹框
      balanceCheckedRef.current = true; // 标记已检查
      
      if (!balanceCheck.sufficient) {
        console.warn('⚠️ 余额不足，终止发送操作');
        return;
      }
    }
    
    const currentInputValue = inputValue;
    const currentRoundNum = Math.floor(messages.length / 2) + 1; // 简单计算轮次
    
    // 创建用户消息
    const now = new Date();
    const userMessage: Message = {
      id: generateMessageId(),
      content: currentInputValue,
      sender: 'user',
      timestamp: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fullTimestamp: now, // ⭐ 保存完整时间戳
      messageType: 'text',
      roundNum: currentRoundNum,
    };
    
    // 将用户消息添加到消息列表
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // ⭐ 添加到缓存（不立即保存数据库）
    messageCacheRef.current.push(userMessage);
    console.log('📝 用户消息已缓存');
    
    // 清空输入框
    setInputValue('');
    
    // 通过 WebSocket 发送消息
    if (isConnected && socket) {
      try {
        // 使用原生 WebSocket 的 send 方法，发送 JSON 格式数据
        socket.send(JSON.stringify({
          'type': 'answer', // 添加消息类型标识
          conversation_id: conversationId,
          'content': currentInputValue,
          round_num: currentRoundNum,
        }));
        console.log('📤 通过 WebSocket 发送消息');
      } catch (error) {
        console.error('WebSocket 发送消息失败:', error);
      }
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
    // 🚫 对话结束后不允许录音
    if (conversationFinished) {
      console.warn('⚠️ 对话已结束，不能录音');
      return;
    }
    
    // 💰 首次操作时检查余额（仅检查一次）
    if (!balanceCheckedRef.current) {
      console.log('💰 首次录音，检查余额...');
      const balanceCheck = await checkBalance(true); // 显示弹框
      balanceCheckedRef.current = true; // 标记已检查
      
      if (!balanceCheck.sufficient) {
        console.warn('⚠️ 余额不足，终止录音操作');
        return;
      }
    }
    
    setRecordedFile(filePath);
    setIsRecording(false);
    
    console.log('录音文件路径:', filePath);
    
    // 创建语音消息（本地播放用）
    const newMessageId = Date.now() + Math.floor(Math.random() * 1000);
    const now = new Date();
    const newMessage: Message = {
      id: newMessageId,
      content: '（语音消息）',
      sender: 'user',
      timestamp: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fullTimestamp: now, // ⭐ 保存完整时间戳
      audioFilePath: filePath,
      messageType: 'voice',
      transcriptionStatus: 'pending',
      transcriptionText: '转写中...',
      roundNum: Math.floor(messages.length / 2) + 1,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    messageCacheRef.current.push(newMessage); // ⭐ 添加到缓存
    console.log('📝 语音消息已缓存');

    try {
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `recording_${timestamp}.wav`;
      
      // 上传音频文件到服务器
      const uploadResult = await uploadAudioToServer(audioBlob, filename);
      
      // 如果上传成功，更新消息的服务器音频路径
      if (uploadResult && uploadResult.filePath) {
        // 注意：不更新audioFilePath，因为服务器返回的路径可能不是可直接访问的URL
        // 保持使用本地Blob URL进行播放
        console.log('音频上传成功，服务器路径:', uploadResult.filePath);
        console.log('保持使用本地Blob URL进行播放:', filePath);
        
        // 🔥 更新消息的服务器路径（用于保存到数据库）
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessageId 
              ? { 
                  ...msg, 
                  serverAudioPath: uploadResult.filePath
                } 
              : msg
          )
        );
        
        // 🔥 同步更新缓存中的服务器路径
        messageCacheRef.current = messageCacheRef.current.map(msg =>
          msg.id === newMessageId
            ? {
                ...msg,
                serverAudioPath: uploadResult.filePath
              }
            : msg
        );
        console.log('✅ 已更新缓存中的服务器音频路径:', uploadResult.filePath);
        
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
            
            // ⭐ 同步更新缓存中的消息
            messageCacheRef.current = messageCacheRef.current.map(msg =>
              msg.id === newMessageId
                ? {
                    ...msg,
                    transcriptionText: transcriptionText,
                    transcriptionStatus: 'done' as const
                  }
                : msg
            );
            console.log('✅ 已更新缓存中的转写文本:', transcriptionText);
            
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
            
            // ⭐ 同步更新缓存中的消息
            messageCacheRef.current = messageCacheRef.current.map(msg =>
              msg.id === newMessageId
                ? {
                    ...msg,
                    transcriptionText: '转写失败',
                    transcriptionStatus: 'failed' as const
                  }
                : msg
            );
            console.log('❌ 转写失败，已更新缓存');
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
      
      // ⭐ 同步更新缓存中的消息
      messageCacheRef.current = messageCacheRef.current.map(msg =>
        msg.id === newMessageId
          ? {
              ...msg,
              transcriptionText: '上传失败',
              transcriptionStatus: 'failed' as const
            }
          : msg
      );
      console.log('❌ 上传失败，已更新缓存');
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
          {/* 返回按钮 */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ fontSize: '20px' }} />}
            onClick={() => {
              console.log('🔙 点击返回按钮');
              
              // 🧹 返回前主动清理音频资源
              if (audioElement) {
                console.log('🔇 停止当前正在播放的音频');
                audioElement.pause();
                audioElement.src = '';
                audioElement.load();
              }
              
              // 清理所有缓存的 AI 音频
              if (aiAudioCacheRef.current.size > 0) {
                console.log(`🧹 清理 ${aiAudioCacheRef.current.size} 个缓存的音频`);
                aiAudioCacheRef.current.forEach((audio) => {
                  audio.pause();
                  audio.src = '';
                  audio.load();
                });
                aiAudioCacheRef.current.clear();
              }
              
              // 无论如何都清除 conversationId
              localStorage.removeItem(CONVERSATION_ID_KEY);
              
              // 返回上一页
              history.back();
            }}
            className="back-button"
            style={{
              fontSize: '16px',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              padding: '4px 12px',
            }}
          >
            返回
          </Button>
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
              onClick={() => setShowTextInput(!showTextInput)}
              title={showTextInput ? "隐藏文本输入" : "显示文本输入"}
            />
            <Button
              icon={<ExperimentOutlined />}
              ghost
              className="header-button"
              onClick={() => setShowTestPanel(!showTestPanel)}
              title={showTestPanel ? "隐藏测试面板" : "显示测试面板"}
              style={{ color: showTestPanel ? '#52c41a' : undefined }}
            />
            <UserAvatar showName={false} size={40} />
          </Space>
        </div>
      </Header>
      
      {/* 主内容区域 */}
      <Content className="spoken-practice-content">
        {/* 测试面板 */}
        {showTestPanel && (
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🧪 测试面板</span>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setShowTestPanel(false)}
                />
              </div>
            }
            style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              width: '320px',
              maxHeight: '70vh',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {/* 余额相关测试 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1890ff', marginTop: '4px' }}>
                💰 余额测试
              </div>
              <Button
                size="small"
                block
                onClick={async () => {
                  console.log('🧪 测试：查询余额');
                  try {
                    const result = await checkBalance(false);
                    Modal.info({
                      title: '余额查询结果',
                      content: (
                        <div>
                          <p>当前余额：{result.balance} 金币</p>
                          <p>需要金币：{result.price} 金币</p>
                          <p>是否充足：{result.sufficient ? '✅ 是' : '❌ 否'}</p>
                        </div>
                      ),
                    });
                  } catch (error) {
                    console.error('测试失败:', error);
                    Modal.error({ title: '测试失败', content: String(error) });
                  }
                }}
              >
                查询余额
              </Button>
              
              <Button
                size="small"
                block
                onClick={async () => {
                  console.log('🧪 测试：检查余额（带弹框）');
                  try {
                    await checkBalance(true);
                  } catch (error) {
                    console.error('测试失败:', error);
                  }
                }}
              >
                检查余额（带提示）
              </Button>
              
              {/* 价格相关测试 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#722ed1', marginTop: '8px' }}>
                💎 价格测试
              </div>
              <Button
                size="small"
                block
                onClick={() => {
                  console.log('🧪 测试：获取当前工作流信息');
                  const info = getCurrentWorkflowInfo();
                  Modal.info({
                    title: '工作流信息',
                    content: (
                      <div>
                        <p>工作流类型：{info.workflowType}</p>
                        <p>价格：{info.price} 金币</p>
                      </div>
                    ),
                  });
                }}
              >
                获取工作流信息
              </Button>
              
              <Button
                size="small"
                block
                onClick={async () => {
                  console.log('🧪 测试：重新加载价格映射');
                  try {
                    await fetchWorkflowPrices();
                    Modal.success({ title: '成功', content: '价格映射已重新加载' });
                  } catch (error) {
                    console.error('测试失败:', error);
                    Modal.error({ title: '测试失败', content: String(error) });
                  }
                }}
              >
                重新加载价格
              </Button>
              
              {/* 扣款相关测试 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fa8c16', marginTop: '8px' }}>
                💳 扣款测试
              </div>
              <Button
                size="small"
                block
                danger
                onClick={async () => {
                  console.log('🧪 测试：执行扣款');
                  Modal.confirm({
                    title: '确认测试扣款',
                    content: '这将执行真实的扣款操作，确定继续吗？',
                    okText: '确定',
                    cancelText: '取消',
                    onOk: async () => {
                      try {
                        const result = await handleConsumeCoins();
                        if (result) {
                          console.log('✅ 扣款成功');
                        } else {
                          console.log('❌ 扣款失败');
                        }
                      } catch (error) {
                        console.error('测试失败:', error);
                      }
                    },
                  });
                }}
              >
                执行扣款（危险）
              </Button>
              
              {/* WebSocket 测试 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#52c41a', marginTop: '8px' }}>
                🔌 WebSocket 测试
              </div>
              <Button
                size="small"
                block
                onClick={() => {
                  console.log('🧪 测试：WebSocket 连接状态');
                  Modal.info({
                    title: 'WebSocket 状态',
                    content: (
                      <div>
                        <p>连接状态：{isConnected ? '✅ 已连接' : '❌ 未连接'}</p>
                        <p>认证状态：{isAuthenticated ? '✅ 已认证' : '❌ 未认证'}</p>
                        <p>会话ID：{conversationId}</p>
                        <p>用户ID：{userId}</p>
                        <p>是否结束：{conversationFinished ? '✅ 是' : '❌ 否'}</p>
                      </div>
                    ),
                  });
                }}
              >
                查看连接状态
              </Button>
              
              {/* 状态测试 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#eb2f96', marginTop: '8px' }}>
                🎯 状态测试
              </div>
              <Button
                size="small"
                block
                onClick={() => {
                  console.log('🧪 测试：查看当前状态');
                  const priceMapSize = workflowPriceMapRef.current.size || workflowPriceMap.size;
                  Modal.info({
                    title: '当前状态',
                    content: (
                      <div>
                        <p>消息数量：{messages.length}</p>
                        <p>缓存消息：{messageCacheRef.current.length}</p>
                        <p>余额已检查：{balanceCheckedRef.current ? '✅ 是' : '❌ 否'}</p>
                        <p>对话结束：{conversationFinished ? '✅ 是' : '❌ 否'}</p>
                        <p>价格加载：{priceLoading ? '⏳ 加载中' : '✅ 完成'}</p>
                        <p>价格映射数量：{priceMapSize} 条</p>
                        <p>历史加载：{historyLoaded ? '✅ 是' : '❌ 否'}</p>
                      </div>
                    ),
                  });
                }}
              >
                查看当前状态
              </Button>
              
              <Button
                size="small"
                block
                onClick={() => {
                  console.log('🧪 测试：查看缓存消息');
                  const cachedMessages = messageCacheRef.current;
                  console.group('📦 缓存消息详情');
                  console.log('缓存消息数量:', cachedMessages.length);
                  cachedMessages.forEach((msg, index) => {
                    console.group(`消息 [${index + 1}/${cachedMessages.length}]`);
                    console.log('ID:', msg.id);
                    console.log('类型:', msg.messageType);
                    console.log('发送者:', msg.sender);
                    console.log('时间:', msg.timestamp);
                    if (msg.messageType === 'voice') {
                      console.log('🎤 本地路径:', msg.audioFilePath);
                      console.log('🔥 服务器路径:', msg.serverAudioPath || '未设置');
                      console.log('转写文本:', msg.transcriptionText);
                      console.log('转写状态:', msg.transcriptionStatus);
                    }
                    console.groupEnd();
                  });
                  console.groupEnd();
                  Modal.info({
                    title: '缓存消息',
                    content: (
                      <div>
                        <p>缓存消息数量：{cachedMessages.length}</p>
                        <p>语音消息数量：{cachedMessages.filter(m => m.messageType === 'voice').length}</p>
                        <p style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                          详细信息已输出到控制台
                        </p>
                      </div>
                    ),
                  });
                }}
              >
                查看缓存消息
              </Button>
              
              {/* URL 参数测试 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#13c2c2', marginTop: '8px' }}>
                🔗 URL 参数
              </div>
              <Button
                size="small"
                block
                onClick={() => {
                  console.log('🧪 测试：查看URL参数');
                  const exerciseId = getPaperIdFromUrl();
                  const workflowType = searchParams.get('workflow_type');
                  Modal.info({
                    title: 'URL 参数',
                    content: (
                      <div>
                        <p>exercise_id: {exerciseId || '未设置'}</p>
                        <p>workflow_type: {workflowType || '未设置'}</p>
                        <p>conversationId: {searchParams.get('conversationId') || '未设置'}</p>
                      </div>
                    ),
                  });
                }}
              >
                查看URL参数
              </Button>
              
              {/* 工具按钮 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#595959', marginTop: '8px' }}>
                🛠️ 工具
              </div>
              <Button
                size="small"
                block
                type="dashed"
                onClick={() => {
                  console.log('🧪 测试：打印所有状态到控制台');
                  console.group('📊 完整状态信息');
                  console.log('消息列表:', messages);
                  console.log('缓存消息:', messageCacheRef.current);
                  console.log('余额已检查:', balanceCheckedRef.current);
                  console.log('对话结束:', conversationFinished);
                  console.log('WebSocket连接:', isConnected);
                  console.log('WebSocket认证:', isAuthenticated);
                  console.log('会话 ID:', conversationId);
                  console.log('用户ID:', userId);
                  console.log('价格映射(State):', Object.fromEntries(workflowPriceMap));
                  console.log('价格映射(Ref)⭐:', Object.fromEntries(workflowPriceMapRef.current));
                  console.groupEnd();
                  Modal.success({ title: '完成', content: '状态已打印到控制台' });
                }}
              >
                打印完整状态
              </Button>
                            
              {/* 动画测试 */}
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fa8c16', marginTop: '8px' }}>
                🎆 动画测试
              </div>
              <Button
                size="small"
                block
                type="primary"
                onClick={() => {
                  console.log('🎆 测试：触发烟花动画');
                  setShowFirework(true);
                  Modal.success({ 
                    title: '烟花动画已触发', 
                    content: '烟花动画将持续5秒，发射15朵烟花' 
                  });
                }}
              >
                🎆 触发烟花动画
              </Button>
            </Space>
          </Card>
        )}
        
        {/* 对话消息显示区域 */}
      <div className="conversation-area">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message-item ${message.sender} ${
              message.messageType === 'image' && expandedImages.has(message.id) ? 'image-expanded' : ''
            }`}
          >
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
                <div 
                  className="ai-image-message-content"
                  style={{
                    width: expandedImages.has(message.id) ? '100%' : 'auto',
                    transition: 'width 0.3s ease',
                  }}
                >
                  <img
                    src={message.imageUrl}
                    alt="图片消息"
                    onClick={() => {
                      setExpandedImages(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(message.id)) {
                          newSet.delete(message.id);
                        } else {
                          newSet.add(message.id);
                        }
                        return newSet;
                      });
                    }}
                    style={{ 
                      width: expandedImages.has(message.id) ? '100%' : '300px',
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'width 0.3s ease',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                  />
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center',
                  }}>
                    {expandedImages.has(message.id) ? '点击缩小' : '点击放大'}
                  </div>
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
                      
                      {/* 改进的回答 */}
                      {(message.content as ScoreContent).improvedAnswer && (
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#722ed1', 
                            marginBottom: '8px',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>✨</span>
                            <span>改进的回答</span>
                          </div>
                          <div style={{ 
                            paddingLeft: '12px',
                            color: '#262626',
                            whiteSpace: 'pre-wrap',
                            backgroundColor: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px',
                            borderLeft: '3px solid #722ed1'
                          }}>
                            {(message.content as ScoreContent).improvedAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : message.sender === 'ai' && message.messageType === 'finish' ? (
                /* 🏁 对话结束消息 */
                <div className="ai-finish-message-content" style={{
                  padding: '20px',
                  backgroundColor: '#fff7e6',
                  borderRadius: '12px',
                  border: '2px solid #ffc53d',
                  textAlign: 'center',
                  maxWidth: '500px'
                }}>
                  {/* 标题 */}
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#fa8c16',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '28px' }}>🎉</span>
                    <span>对话已结束</span>
                  </div>
                  
                  {/* 提示文字 */}
                  <div style={{
                    fontSize: '15px',
                    color: '#595959',
                    marginBottom: '20px',
                    lineHeight: '1.6'
                  }}>
                    {typeof message.content === 'string' ? message.content : '您的口语练习已完成，成绩已保存！'}
                  </div>
                  
                  {/* 开始新对话按钮 */}
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      console.log('👆 用户点击开始新对话，清除 conversationId 并刷新页面');
                      localStorage.removeItem(CONVERSATION_ID_KEY);
                      window.location.reload();
                    }}
                    style={{
                      backgroundColor: '#fa8c16',
                      borderColor: '#fa8c16',
                      fontSize: '16px',
                      height: '44px',
                      padding: '0 32px',
                      borderRadius: '8px',
                      fontWeight: '500'
                    }}
                  >
                    🆕 开始新对话
                  </Button>
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
          {/* 文本输入框（调试模式下显示） */}
          {showTextInput && (
            <div style={{ marginBottom: '12px' }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={conversationFinished ? '对话已结束' : '输入内容...'}
                rows={3}
                className="text-input"
                disabled={conversationFinished} // 🚫 finish 后禁用
                onPressEnter={(e) => {
                  // Ctrl/Cmd + Enter 快速发送消息
                  if (e.ctrlKey || e.metaKey) handleSendMessage();
                }}
              />
              <Button
                icon={<SendOutlined />}
                type="primary"
                onClick={handleSendMessage}
                className="send-button"
                loading={!isConnected || !isAuthenticated}
                disabled={conversationFinished || !isConnected || !isAuthenticated} // 🚫 finish 后禁用
                title={
                  conversationFinished
                    ? '对话已结束'
                    : !isConnected 
                      ? '正在连接WebSocket...'
                      : !isAuthenticated
                        ? '正在认证...'
                        : '发送消息'
                }
                style={{ marginTop: '8px', width: '100%' }}
              >
                {conversationFinished ? '对话已结束' : '发送消息'}
              </Button>
            </div>
          )}
          
          {/* 内联式录音组件 - finish 后禁用 */}
          {!conversationFinished ? (
            <AudioRecorderInline
              maxDuration={60}
              onFinish={handleRecordFinish}
              onCancel={handleRecordCancel}
            />
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              color: '#999',
              marginBottom: '12px'
            }}>
              🏁 对话已结束，请开始新对话
            </div>
          )}
          
          {/* WebSocket连接状态指示器 */}
          <div style={{...styles.connectionStatus, marginTop: '8px'}}>
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
      
      {/* 🎆 烟花动画组件 - 对话结束时显示 */}
      <FireworkAnimation
        visible={showFirework}
        duration={5000}
        fireworkCount={15}
        playSound={true}
        showTrophy={true}
        backgroundColor="transparent"
        soundUrl={winSound}
        onComplete={() => {
          setShowFirework(false);
          console.log('🎆 烟花动画完成');
        }}
      />
    </Layout>
  );
};

export default SpokenPractice;
