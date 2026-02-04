// 导入React及相关Hook
import React, { useState, useEffect, useCallback } from 'react';
// 导入Ant Design组件
import { Card, List, Button, Space, Tag, Empty, Spin, App, Layout, Modal, Descriptions, Progress } from 'antd';
// 导入Ant Design图标
import { 
  ArrowLeftOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
// 导入API服务
import { getSpokenMessages } from '@/services/ant-design-pro/api';
// 导入类型定义
import { SpokenMessage } from '../types';
// 导入样式文件
import './index.less';
// 导入history和useSearchParams用于路由
import { history, useSearchParams } from '@umijs/max';

const { Header, Content } = Layout;

/**
 * 练习记录查看页面
 * 展示单个会话的完整消息历史
 */
const ViewPractice: React.FC = () => {
  // 使用 App 组件提供的 message API
  const { message } = App.useApp();
  
  // 从 URL 获取参数
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  
  // 数据状态
  const [messages, setMessages] = useState<SpokenMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<SpokenMessage[]>([]);
  const [grammarMap, setGrammarMap] = useState<Map<string, SpokenMessage>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationTitle, setConversationTitle] = useState<string>('会话详情');
  const [conversationStatus, setConversationStatus] = useState<string>('');
  
  // 🆕 Grammar Modal 状态
  const [grammarModalData, setGrammarModalData] = useState<{
    visible: boolean;
    data: SpokenMessage | null;
  }>({ visible: false, data: null });
  
  // 🔊 音频播放状态
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  /**
   * 🆕 判断消息实际类型
   */
  const getActualMessageType = (msg: SpokenMessage): string => {
    // 🔥 Grammar 消息的严格判断：
    // 1. origin_message_id 有值
    // 2. grammar_origin_message_id 有值
    // 同时满足才是 grammar 消息
    if (msg.grammar_origin_message_id) {
      return 'grammar';
    }
    return msg.message_type;
  };

  /**
   * 🆕 处理消息列表，分离 grammar 消息
   */
  const processMessages = (rawMessages: SpokenMessage[]) => {
    const displayList: SpokenMessage[] = [];
    const grammarMapping = new Map<string, SpokenMessage>();
    
    rawMessages.forEach(msg => {
      const actualType = getActualMessageType(msg);
      
      if (actualType === 'grammar') {
        // 🔥 grammar 消息存入映射表，key 为 grammar_origin_message_id 或 origin_message_id
        const key = msg.grammar_origin_message_id || msg.origin_message_id;
        if (key) {
          grammarMapping.set(key, msg);
          console.log(`📝 Grammar 消息关联: key=${key}`);
        } else {
          console.warn('⚠️ Grammar 消息缺少关联ID:', msg);
        }
      } else {
        // 👉 普通消息（包括 user 和 AI）全部加入显示列表
        displayList.push(msg);
      }
    });
    
    // 🔢 按 origin_message_id 排序（升序）
    displayList.sort((a, b) => {
      const idA = a.origin_message_id ? parseInt(a.origin_message_id, 10) : 0;
      const idB = b.origin_message_id ? parseInt(b.origin_message_id, 10) : 0;
      return idA - idB;
    });
    
    console.log(`✅ 消息处理完成: 显示${displayList.length}条, Grammar映射${grammarMapping.size}条`);
    console.log(`🔢 排序后的 origin_message_id 顺序:`, displayList.map(m => m.origin_message_id || 'N/A'));
    return { displayMessages: displayList, grammarMap: grammarMapping };
  };

  /**
   * 获取会话消息
   */
  const fetchMessages = useCallback(async (convId: number) => {
    setLoading(true);
    
    try {
      const response = await getSpokenMessages(convId);
      
      if (response.success && response.data) {
        setMessages(response.data);
        
        // 🆕 处理消息列表，分离 grammar 消息
        const { displayMessages: processedMessages, grammarMap: processedGrammarMap } = processMessages(response.data);
        setDisplayMessages(processedMessages);
        setGrammarMap(processedGrammarMap);
        
        // 从第一条消息中提取会话信息（如果需要）
        if (response.data.length > 0) {
          // 这里可以根据实际API返回的数据结构调整
          message.success('加载消息成功');
        }
      } else {
        throw new Error('获取消息失败');
      }
    } catch (error) {
      console.error('获取消息失败:', error);
      message.error('获取消息失败，请重试');
      setMessages([]);
      setDisplayMessages([]);
      setGrammarMap(new Map());
    } finally {
      setLoading(false);
    }
  }, [message]);

  /**
   * 🆕 打开 Grammar Modal
   */
  const handleShowGrammar = (messageId: number) => {
    // 🔥 使用 origin_message_id 作为 key 查找 grammar 消息
    const userMsg = displayMessages.find(m => m.id === messageId);
    if (!userMsg || !userMsg.origin_message_id) {
      message.warning('该消息没有关联的语法反馈');
      return;
    }
    
    const grammarData = grammarMap.get(userMsg.origin_message_id);
    if (grammarData) {
      setGrammarModalData({ visible: true, data: grammarData });
    } else {
      message.warning('未找到该消息的语法反馈');
    }
  };

  /**
   * 🆕 关闭 Grammar Modal
   */
  const handleCloseGrammarModal = () => {
    setGrammarModalData({ visible: false, data: null });
  };

  /**
   * 🆕 获取质量等级标签
   */
  const getQualityTag = (quality?: string | null) => {
    if (!quality) return null;
    
    const qualityMap: Record<string, { text: string; color: string }> = {
      excellent: { text: '优秀', color: '#52c41a' },
      good: { text: '良好', color: '#1890ff' },
      fair: { text: '一般', color: '#faad14' },
      poor: { text: '较差', color: '#f5222d' },
    };
    
    const config = qualityMap[quality] || { text: quality, color: '#d9d9d9' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 🆕 获取相关性等级标签
   */
  const getRelevanceTag = (level?: string | null) => {
    if (!level) return null;
    
    const levelMap: Record<string, { text: string; color: string }> = {
      on_topic: { text: '切题', color: '#52c41a' },
      partially_on_topic: { text: '部分相关', color: '#faad14' },
      off_topic: { text: '离题', color: '#f5222d' },
    };
    
    const config = levelMap[level] || { text: level, color: '#d9d9d9' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 🔊 播放或暂停音频
   */
  const handlePlayAudio = (messageId: number, audioUrl: string) => {
    // 如果当前正在播放该音频，则暂停
    if (playingAudioId === messageId && audioElement) {
      audioElement.pause();
      setPlayingAudioId(null);
      return;
    }
    
    // 停止其他音频
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    // 创建新的音频元素
    const audio = new Audio(audioUrl);
    
    // 监听播放结束
    audio.onended = () => {
      setPlayingAudioId(null);
      setAudioElement(null);
    };
    
    // 监听错误
    audio.onerror = () => {
      message.error('音频播放失败');
      setPlayingAudioId(null);
      setAudioElement(null);
    };
    
    // 开始播放
    audio.play().catch(err => {
      console.error('播放失败:', err);
      message.error('音频播放失败');
      setPlayingAudioId(null);
    });
    
    setAudioElement(audio);
    setPlayingAudioId(messageId);
  };

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { text: string; style: React.CSSProperties }> = {
      active: { 
        text: '进行中', 
        style: { background: '#4ECDC4', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } 
      },
      completed: { 
        text: '已完成', 
        style: { background: '#FFD93D', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } 
      },
      archived: { 
        text: '已归档', 
        style: { background: '#FFF', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } 
      },
    };

    const config = statusMap[status] || { 
      text: status, 
      style: { background: '#FFF', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } 
    };
    return <Tag style={config.style}>{config.text}</Tag>;
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 获取消息类型图标
   */
  const getMessageTypeIcon = (messageType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      text: '📝',
      voice: '🎤',
      image: '🖼️',
      score: '📊',
    };
    return iconMap[messageType] || '💬';
  };

  // 初始化数据
  useEffect(() => {
    if (conversationId) {
      const convId = parseInt(conversationId, 10);
      if (!isNaN(convId) && convId > 0) {
        fetchMessages(convId);
      } else {
        message.error('无效的会话ID');
        history.back();
      }
    } else {
      message.error('缺少会话ID参数');
      history.back();
    }
  }, [conversationId, fetchMessages, message]);

  // 组件卸载时停止音频
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  return (
    <Layout className="view-practice-layout">
      {/* 自定义顶部导航栏 */}
      <Header className="custom-header">
        <div className="header-container">
          <div className="header-left-section">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              onClick={() => history.back()}
              className="back-button"
            >
              返回
            </Button>
            <div className="header-title">
              <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <span>{conversationTitle}</span>
              {conversationStatus && getStatusTag(conversationStatus)}
            </div>
          </div>
          <div className="header-right-section">
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => conversationId && fetchMessages(parseInt(conversationId))}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        </div>
      </Header>
      
      <Content className="view-practice-container">
        <Card className="message-list-card">
          <Spin spinning={loading}>
            {displayMessages.length > 0 ? (
              <List
                dataSource={displayMessages}
                renderItem={(msg) => (
                  <List.Item
                    key={msg.id}
                    className={`message-item message-${msg.sender}`}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <Space>
                          <Tag style={{
                            background: msg.sender === 'user' ? '#FFD93D' : '#4ECDC4',
                            border: '2px solid #000',
                            fontWeight: 'bold',
                            boxShadow: '2px 2px 0px #000',
                            color: '#1A535C'
                          }}>
                            {msg.sender === 'user' ? '我' : 'AI'}
                          </Tag>
                          <span>{getMessageTypeIcon(msg.message_type)}</span>
                          <span className="message-time">
                            {formatTime(msg.timestamp)}
                          </span>
                        </Space>
                      </div>
                      <div className="message-body">
                        {msg.message_type === 'text' && (
                          <p>{msg.content}</p>
                        )}
                        {msg.message_type === 'voice' && (
                          <div className="voice-message-container">
                            <div className="voice-info">
                              <span>🎤 语音消息</span>
                              {msg.transcription_text && (
                                <p className="transcription">转写: {msg.transcription_text}</p>
                              )}
                            </div>
                            {(msg.audio_file_path || msg.audio_url) && (
                              <div className="audio-controls">
                                <Button
                                  type="primary"
                                  shape="circle"
                                  size="large"
                                  icon={playingAudioId === msg.id ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                  onClick={() => handlePlayAudio(msg.id, msg.audio_file_path || msg.audio_url!)}
                                  style={{
                                    backgroundColor: playingAudioId === msg.id ? '#FF5252' : '#4ECDC4',
                                    borderColor: '#000',
                                    border: '3px solid #000',
                                    boxShadow: '3px 3px 0px #000',
                                  }}
                                />
                                <span style={{ marginLeft: '8px', color: '#999', fontSize: '12px' }}>
                                  {playingAudioId === msg.id ? '正在播放...' : '点击播放'}
                                </span>
                                <span style={{ marginLeft: 'auto', color: '#999', fontSize: '11px' }}>
                                  {msg.audio_file_path ? '💾 服务器路径' : '🌐 音频链接'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {msg.message_type === 'image' && msg.image_url && (
                          <img 
                            src={msg.image_url} 
                            alt="图片消息" 
                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                          />
                        )}
                        {msg.message_type === 'score' && (
                          <div className="score-content">
                            <p><strong>📊 评分结果</strong></p>
                            {msg.total_score && (
                              <p>总分: <strong style={{ fontSize: '18px', color: '#FF6B6B', textShadow: '1px 1px 0px #000' }}>{msg.total_score}</strong></p>
                            )}
                            {msg.dimension_scores && (
                              <p>维度评分: {msg.dimension_scores}</p>
                            )}
                            {msg.advantages && (
                              <div>
                                <p><strong>✅ 优势:</strong></p>
                                <p>{msg.advantages}</p>
                              </div>
                            )}
                            {msg.disadvantages && (
                              <div>
                                <p><strong>⚠️ 不足:</strong></p>
                                <p>{msg.disadvantages}</p>
                              </div>
                            )}
                            {msg.suggestions && (
                              <div>
                                <p><strong>💡 建议:</strong></p>
                                <p>{msg.suggestions}</p>
                              </div>
                            )}
                            {msg.improved_answer && (
                              <div>
                                <p><strong>✨ 改进的回答:</strong></p>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.improved_answer}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🆕 语法反馈按钮 - 只在 user 消息且有 origin_message_id 时显示 */}
                        {msg.sender === 'user' && msg.origin_message_id && grammarMap.has(msg.origin_message_id) && (
                          <div style={{ marginTop: '16px', borderTop: '1px dashed #d9d9d9', paddingTop: '12px' }}>
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleShowGrammar(msg.id)}
                              style={{
                                background: '#52c41a',
                                borderColor: '#000',
                                border: '2px solid #000',
                                fontWeight: 'bold',
                                boxShadow: '2px 2px 0px #000',
                              }}
                            >
                              查看语法反馈
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="该会话暂无消息" />
            )}
          </Spin>
        </Card>
      </Content>
      
      {/* 🆕 Grammar Modal */}
      <Modal
        title={
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            📝 语法反馈详情
          </span>
        }
        open={grammarModalData.visible}
        onCancel={handleCloseGrammarModal}
        footer={[
          <Button key="close" onClick={handleCloseGrammarModal}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        {grammarModalData.data && (
          <div>
            {/* 基础信息 */}
            <Descriptions bordered column={2} size="small" style={{ marginBottom: '16px' }}>
              {grammarModalData.data.exam_level && (
                <Descriptions.Item label="考试等级">
                  <Tag color="blue">{grammarModalData.data.exam_level}</Tag>
                </Descriptions.Item>
              )}
              {grammarModalData.data.error_count !== null && grammarModalData.data.error_count !== undefined && (
                <Descriptions.Item label="错误数量">
                  <Tag color={grammarModalData.data.error_count === 0 ? 'success' : 'warning'}>
                    {grammarModalData.data.error_count} 处
                  </Tag>
                </Descriptions.Item>
              )}
              {grammarModalData.data.overall_quality && (
                <Descriptions.Item label="整体质量">
                  {getQualityTag(grammarModalData.data.overall_quality)}
                </Descriptions.Item>
              )}
              {grammarModalData.data.relevance_level && (
                <Descriptions.Item label="相关性">
                  {getRelevanceTag(grammarModalData.data.relevance_level)}
                </Descriptions.Item>
              )}
              {grammarModalData.data.relevance_score !== null && grammarModalData.data.relevance_score !== undefined && (
                <Descriptions.Item label="相关性分数" span={2}>
                  <Progress 
                    percent={Math.round((grammarModalData.data.relevance_score || 0) * 100)} 
                    size="small"
                    status={grammarModalData.data.relevance_score > 0.7 ? 'success' : 'normal'}
                  />
                </Descriptions.Item>
              )}
              {grammarModalData.data.origin_message_id && (
                <Descriptions.Item label="关联消息ID" span={2}>
                  <Tag>{grammarModalData.data.origin_message_id}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 改进版本 */}
            {grammarModalData.data.grammar_improved_version && (
              <Card 
                title="✨ 改进版本" 
                size="small" 
                style={{ marginBottom: '16px' }}
                headStyle={{ background: '#f0f5ff', fontWeight: 'bold' }}
              >
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {grammarModalData.data.grammar_improved_version}
                </p>
              </Card>
            )}

            {/* 原始内容（如果有） */}
            {grammarModalData.data.content && (
              <Card 
                title="📄 原始内容" 
                size="small"
                headStyle={{ background: '#fff7e6', fontWeight: 'bold' }}
              >
                <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#666' }}>
                  {grammarModalData.data.content}
                </p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ViewPractice;
