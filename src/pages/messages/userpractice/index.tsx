// 导入React及相关Hook
import React, { useState, useEffect, useCallback } from 'react';
// 导入Ant Design组件
import { Card, List, Button, Space, Tag, Empty, Spin, App, Layout } from 'antd';
// 导入Ant Design图标
import { 
  ReloadOutlined, 
  EyeOutlined, 
  ClockCircleOutlined,
  TrophyOutlined,
  HomeOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
// 导入API服务
import { getSpokenConversations } from '@/services/ant-design-pro/api';
// 导入类型定义
import { SpokenConversation } from '../types';
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
   * 查看会话详情 - 跳转到查看页面
   */
  const handleViewConversation = (conversation: SpokenConversation) => {
    history.push(`/messages/viewpractice?conversationId=${conversation.id}`);
  };

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; style?: React.CSSProperties }> = {
      active: { color: 'blue', text: '进行中', style: { background: '#4ECDC4', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } },
      completed: { color: 'green', text: '已完成', style: { background: '#FFD93D', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } },
      archived: { color: 'default', text: '已归档', style: { background: '#FFF', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } },
    };

    const config = statusMap[status] || { color: 'default', text: status, style: { background: '#FFF', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000' } };
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
              查看您的所有口语练习会话和成绩 · 共 <strong style={{ color: '#FF6B6B', textShadow: '1px 1px 0px #000' }}>{statistics.total}</strong> 次练习
            </p>
          </div>
          <div className="header-right">
            <Space>
              <Tag style={{ background: '#4ECDC4', border: '2px solid #000', fontWeight: 'bold', boxShadow: '3px 3px 0px #000', color: '#1A535C' }} icon={<ClockCircleOutlined />}>
                进行中: {statistics.active}
              </Tag>
              <Tag style={{ background: '#FFD93D', border: '2px solid #000', fontWeight: 'bold', boxShadow: '3px 3px 0px #000', color: '#1A535C' }} icon={<TrophyOutlined />}>
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
                          <Tag style={{ background: '#95E1D3', border: '2px solid #000', fontWeight: 'bold', boxShadow: '2px 2px 0px #000', color: '#1A535C' }}>
                            类型: {conversation.workflow_type}
                          </Tag>
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
      </Content>
    </Layout>
  );
};

export default UserPractice;
