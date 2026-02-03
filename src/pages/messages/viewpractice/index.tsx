// 导入React及相关Hook
import React, { useState, useEffect, useCallback } from 'react';
// 导入Ant Design组件
import { Card, List, Button, Space, Tag, Empty, Spin, App, Layout } from 'antd';
// 导入Ant Design图标
import { 
  ArrowLeftOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined
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
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationTitle, setConversationTitle] = useState<string>('会话详情');
  const [conversationStatus, setConversationStatus] = useState<string>('');
  
  // 🔊 音频播放状态
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  /**
   * 获取会话消息
   */
  const fetchMessages = useCallback(async (convId: number) => {
    setLoading(true);
    
    try {
      const response = await getSpokenMessages(convId);
      
      if (response.success && response.data) {
        setMessages(response.data);
        
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
    } finally {
      setLoading(false);
    }
  }, [message]);

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
            {messages.length > 0 ? (
              <List
                dataSource={messages}
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
    </Layout>
  );
};

export default ViewPractice;
