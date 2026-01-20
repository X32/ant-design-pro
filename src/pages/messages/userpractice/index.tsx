// 导入React及相关Hook
import React, { useState, useEffect, useCallback } from 'react';
// 导入Ant Design组件
import { Card, List, Button, Space, Tag, Modal, Empty, Spin, App, Layout } from 'antd';
// 导入Ant Design图标
import { 
  ReloadOutlined, 
  EyeOutlined, 
  MessageOutlined, 
  ClockCircleOutlined,
  TrophyOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,  // 新增：播放图标
  PauseCircleOutlined  // 新增：暂停图标
} from '@ant-design/icons';
// 导入API服务
import { 
  getSpokenConversations,
  getSpokenMessages
} from '@/services/ant-design-pro/api';
// 导入类型定义
import { SpokenConversation, SpokenMessage } from '../types';
// 导入样式文件
import './index.less';
// 导入history用于路由跳转
import { history } from '@umijs/max';

const { Header, Content } = Layout;

/**
 * 用户口语练习记录页面
 * 展示当前用户的所有口语练习会话
 */
const UserPractice: React.FC = () => {
  // 使用 App 组件提供的 message API
  const { message } = App.useApp();
  
  // 数据状态
  const [conversations, setConversations] = useState<SpokenConversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] = useState<SpokenConversation | null>(null);
  const [messages, setMessages] = useState<SpokenMessage[]>([]);
  const [messageModalVisible, setMessageModalVisible] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  // 🔊 新增：音频播放状态
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // 统计数据
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalMessages: 0
  });

  /**
   * 获取用户的口语练习会话列表
   */
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await getSpokenConversations({
        limit: 100, // 获取最近100条记录
        offset: 0,
      });
      
      if (response.success && response.data) {
        setConversations(response.data);
        
        // 计算统计数据
        const total = response.data.length;
        const active = response.data.filter(c => c.status === 'active').length;
        const completed = response.data.filter(c => c.status === 'completed').length;
        
        setStatistics({
          total,
          active,
          completed,
          totalMessages: 0 // 需要后续计算
        });
        
        message.success(`获取到 ${total} 条练习记录`);
      } else {
        throw new Error('获取数据失败');
      }
    } catch (error) {
      console.error('获取会话列表失败:', error);
      message.error('获取练习记录失败，请重试');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [message]);

  /**
   * 查看会话详情
   */
  const handleViewConversation = async (conversation: SpokenConversation) => {
    setSelectedConversation(conversation);
    setMessageModalVisible(true);
    setLoadingMessages(true);
    
    try {
      const response = await getSpokenMessages(conversation.id);
      
      if (response.success && response.data) {
        setMessages(response.data);
        message.success('加载消息成功');
      } else {
        throw new Error('获取消息失败');
      }
    } catch (error) {
      console.error('获取消息失败:', error);
      message.error('获取消息失败，请重试');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * 关闭消息详情弹窗
   */
  const handleCloseModal = () => {
    // 停止播放音频
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
    }
    setPlayingAudioId(null);
    
    setMessageModalVisible(false);
    setSelectedConversation(null);
    setMessages([]);
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
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'blue', text: '进行中' },
      completed: { color: 'green', text: '已完成' },
      archived: { color: 'default', text: '已归档' },
    };
    
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
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
    fetchConversations();
  }, [fetchConversations]);

  return (
    <Layout className="user-practice-layout">
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
              <TrophyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <span>我的口语练习记录</span>
            </div>
          </div>
          <div className="header-right-section">
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              onClick={() => history.push('/exam-catalog')}
            >
              开始练习
            </Button>
          </div>
        </div>
      </Header>
      
      <Content className="user-practice-container">
      {/* 页面标题和操作栏 */}
      <Card className="header-card">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">
              <TrophyOutlined /> 我的口语练习记录
            </h1>
            <p className="page-description">
              查看您的所有口语练习会话和成绩 · 共 <strong style={{ color: '#1890ff' }}>{statistics.total}</strong> 次练习
            </p>
          </div>
          <div className="header-right">
            <Space>
              <Tag color="blue" icon={<ClockCircleOutlined />}>
                进行中: {statistics.active}
              </Tag>
              <Tag color="green" icon={<TrophyOutlined />}>
                已完成: {statistics.completed}
              </Tag>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchConversations}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* 会话列表 */}
      <Card className="conversation-list-card" title="练习历史">
        <Spin spinning={loading}>
          {conversations.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={conversations}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              renderItem={(conversation) => (
                <List.Item
                  key={conversation.id}
                  className="conversation-item"
                  actions={[
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewConversation(conversation)}
                    >
                      查看详情
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span className="conversation-title">{conversation.title}</span>
                        {getStatusTag(conversation.status)}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <div>
                          <ClockCircleOutlined /> 创建时间: {formatTime(conversation.created_at)}
                        </div>
                        {conversation.updated_at && (
                          <div>
                            <ClockCircleOutlined /> 更新时间: {formatTime(conversation.updated_at)}
                          </div>
                        )}
                        {conversation.workflow_type && (
                          <Tag color="purple">类型: {conversation.workflow_type}</Tag>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description="暂无练习记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                onClick={() => history.push('/exam-catalog')}
              >
                开始练习
              </Button>
            </Empty>
          )}
        </Spin>
      </Card>

      {/* 消息详情弹窗 */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            <span>{selectedConversation?.title || '会话详情'}</span>
            {selectedConversation && getStatusTag(selectedConversation.status)}
          </Space>
        }
        open={messageModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            关闭
          </Button>
        ]}
        width={800}
        className="message-detail-modal"
      >
        <Spin spinning={loadingMessages}>
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
                        <Tag color={msg.sender === 'user' ? 'blue' : 'green'}>
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
                          {/* 🔥 优先使用 audio_file_path，没有再使用 audio_url */}
                          {(msg.audio_file_path || msg.audio_url) && (
                            <div className="audio-controls">
                              <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={playingAudioId === msg.id ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                onClick={() => handlePlayAudio(msg.id, msg.audio_file_path || msg.audio_url!)}
                                style={{
                                  backgroundColor: playingAudioId === msg.id ? '#ff4d4f' : '#1890ff',
                                  borderColor: playingAudioId === msg.id ? '#ff4d4f' : '#1890ff',
                                }}
                              />
                              <span style={{ marginLeft: '8px', color: '#999', fontSize: '12px' }}>
                                {playingAudioId === msg.id ? '正在播放...' : '点击播放'}
                              </span>
                              {/* 📝 显示使用的音频源 */}
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
                            <p>总分: <strong style={{ fontSize: '18px', color: '#52c41a' }}>{msg.total_score}</strong></p>
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
      </Modal>
      </Content>
    </Layout>
  );
};

export default UserPractice;
