import React, { useState, useEffect, useCallback } from 'react';
import { Input, Select, DatePicker, Button, Table, Pagination, Space, Tag, Modal, Form, message, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Session, Message, MessageContent, SessionStatus, MessageRole, MessageType, SearchParams, FilterParams, PaginationParams } from './types';
import { mockApi } from './mockData';
import './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const MessagesManagement: React.FC = () => {
  // 搜索和筛选参数
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  
  // 分页参数
  const [sessionPagination, setSessionPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [messagePagination, setMessagePagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  
  // 数据状态
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContents, setMessageContents] = useState<MessageContent[]>([]);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  
  // 选中状态
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // 模态框状态
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<MessageContent | null>(null);
  
  // 表单实例
  const [contentForm] = Form.useForm();
  
  // 获取会话列表
  const fetchSessions = useCallback(async () => {
    try {
      const { data, total } = await mockApi.getSessions({
        search: searchParams.sessionTitle || searchParams.userId,
        filter: {
          status: filterParams.status,
          startDate: filterParams.startDate,
          endDate: filterParams.endDate
        },
        page: sessionPagination.page,
        pageSize: sessionPagination.pageSize
      });
      setSessions(data);
      setTotalSessions(total);
      
      // 如果没有选中会话，默认选中第一个
      if (!selectedSession && data.length > 0) {
        setSelectedSession(data[0]);
      }
    } catch (error) {
      message.error('获取会话列表失败');
    }
  }, [searchParams, filterParams, sessionPagination, selectedSession]);
  
  // 获取消息列表
  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const { data, total } = await mockApi.getMessages(sessionId, {
        search: searchParams.messageContent,
        filter: {
          role: filterParams.role
        },
        page: messagePagination.page,
        pageSize: messagePagination.pageSize
      });
      setMessages(data);
      setTotalMessages(total);
      
      // 如果没有选中消息，默认选中第一个
      if (!selectedMessage && data.length > 0) {
        setSelectedMessage(data[0]);
      }
    } catch (error) {
      message.error('获取消息列表失败');
    }
  }, [searchParams, filterParams, messagePagination, selectedMessage]);
  
  // 获取消息内容
  const fetchMessageContents = useCallback(async (messageId: string) => {
    try {
      const contents = await mockApi.getMessageContents(messageId);
      setMessageContents(contents);
    } catch (error) {
      message.error('获取消息内容失败');
    }
  }, []);
  
  // 初始化数据
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  // 会话选中变化
  useEffect(() => {
    if (selectedSession) {
      setMessagePagination({ page: 1, pageSize: 10 });
      fetchMessages(selectedSession.id);
    } else {
      setMessages([]);
      setTotalMessages(0);
      setSelectedMessage(null);
      setMessageContents([]);
    }
  }, [selectedSession, fetchMessages]);
  
  // 消息选中变化
  useEffect(() => {
    if (selectedMessage) {
      fetchMessageContents(selectedMessage.id);
    } else {
      setMessageContents([]);
    }
  }, [selectedMessage, fetchMessageContents]);
  
  // 搜索处理
  const handleSearch = (field: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
    setSessionPagination({ page: 1, pageSize: 10 });
    setMessagePagination({ page: 1, pageSize: 10 });
  };
  
  // 筛选处理
  const handleFilter = (field: keyof FilterParams, value: any) => {
    setFilterParams(prev => ({ ...prev, [field]: value }));
    setSessionPagination({ page: 1, pageSize: 10 });
    setMessagePagination({ page: 1, pageSize: 10 });
  };
  
  // 日期范围筛选
  const handleDateRangeChange = (dates: any, dateStrings: string[]) => {
    setFilterParams(prev => ({
      ...prev,
      startDate: dateStrings[0],
      endDate: dateStrings[1]
    }));
    setSessionPagination({ page: 1, pageSize: 10 });
  };
  
  // 重置搜索和筛选
  const handleReset = () => {
    setSearchParams({});
    setFilterParams({});
    setSessionPagination({ page: 1, pageSize: 10 });
    setMessagePagination({ page: 1, pageSize: 10 });
    setSelectedSession(null);
    setSelectedMessage(null);
    setMessageContents([]);
  };
  
  // 导出数据
  const handleExport = () => {
    message.success('导出功能开发中...');
  };
  
  // 删除会话
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await mockApi.deleteSession(sessionId);
      message.success('会话删除成功');
      fetchSessions();
      
      // 如果删除的是当前选中的会话，清除选中状态
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      message.error('删除会话失败');
    }
  };
  
  // 删除消息
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await mockApi.deleteMessage(messageId);
      message.success('消息删除成功');
      if (selectedSession) {
        fetchMessages(selectedSession.id);
      }
      
      // 如果删除的是当前选中的消息，清除选中状态
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      message.error('删除消息失败');
    }
  };
  
  // 删除消息内容
  const handleDeleteContent = async (contentId: string) => {
    try {
      await mockApi.deleteMessageContent(contentId);
      message.success('内容删除成功');
      if (selectedMessage) {
        fetchMessageContents(selectedMessage.id);
      }
    } catch (error) {
      message.error('删除内容失败');
    }
  };
  
  // 打开添加内容模态框
  const handleAddContent = () => {
    if (!selectedMessage) {
      message.warning('请先选择一条消息');
      return;
    }
    setEditingContent(null);
    contentForm.resetFields();
    setContentModalVisible(true);
  };
  
  // 打开编辑内容模态框
  const handleEditContent = (content: MessageContent) => {
    setEditingContent(content);
    contentForm.setFieldsValue(content);
    setContentModalVisible(true);
  };
  
  // 保存内容
  const handleSaveContent = async () => {
    try {
      const values = await contentForm.validateFields();
      
      if (editingContent) {
        // 编辑模式
        await mockApi.updateMessageContent(editingContent.id, values);
        message.success('内容更新成功');
      } else {
        // 添加模式
        if (!selectedMessage) return;
        await mockApi.addMessageContent(selectedMessage.id, values);
        message.success('内容添加成功');
      }
      
      setContentModalVisible(false);
      if (selectedMessage) {
        fetchMessageContents(selectedMessage.id);
      }
    } catch (error) {
      message.error('保存内容失败');
    }
  };
  
  // 会话列表列配置
  const sessionColumns = [
    {
      title: '会话 ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
      render: (text: string) => <span className="session-id">{text}</span>
    },
    {
      title: '用户 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      ellipsis: true,
      render: (text: string) => <span className="user-id">{text}</span>
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      flex: 1,
      ellipsis: true,
      render: (text: string) => <span className="session-title">{text}</span>
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
      width: 80,
      align: 'center',
      render: (count: number) => <span className="message-count">{count}</span>
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
      ellipsis: true,
      render: (text: string) => <span className="update-time">{new Date(text).toLocaleString()}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: SessionStatus) => (
        <span className={`session-status ${status === SessionStatus.ACTIVE ? 'status-active' : 'status-deleted'}`}>
          {status === SessionStatus.ACTIVE ? '有效' : '已删除'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_: any, record: Session) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => setSelectedSession(record)}
          >
            查看
          </Button>
          <Button type="text" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个会话吗？"
            onConfirm={() => handleDeleteSession(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  // 消息列表列配置
  const messageColumns = [
    {
      title: '消息 ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
      render: (text: string) => <span className="message-id">{text}</span>
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 80,
      align: 'center',
      render: (role: MessageRole) => {
        let className = 'role-tag';
        let text = '';
        
        switch (role) {
          case MessageRole.USER:
            className += ' role-user';
            text = '用户';
            break;
          case MessageRole.ASSISTANT:
            className += ' role-assistant';
            text = '助手';
            break;
          case MessageRole.SYSTEM:
            className += ' role-system';
            text = '系统';
            break;
        }
        
        return <span className={className}>{text}</span>;
      }
    },
    {
      title: '序号',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 60,
      align: 'center',
      render: (seq: number) => <span className="sequence-number">#{seq}</span>
    },
    {
      title: '内容预览',
      dataIndex: 'preview',
      key: 'preview',
      flex: 1,
      ellipsis: {
        showTitle: true
      },
      render: (text: string, record: Message) => (
        <div className="message-preview">
          {record.type === MessageType.IMAGE && (
            <img 
              src="https://via.placeholder.com/60x40" 
              alt="预览" 
              className="image-preview"
            />
          )}
          {text}
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      align: 'center',
      render: (type: MessageType) => (
        <span className="message-type">
          {type === MessageType.TEXT ? '文本' : 
           type === MessageType.IMAGE ? '图片' : 
           type === MessageType.AUDIO ? '音频' : '视频'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      ellipsis: true,
      render: (text: string) => <span className="create-time">{new Date(text).toLocaleString()}</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_: any, record: Message) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => setSelectedMessage(record)}
          >
            查看
          </Button>
          <Button type="text" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条消息吗？"
            onConfirm={() => handleDeleteMessage(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  return (
    <div className="messages-management">
      {/* 顶部搜索和筛选栏 */}
      <div className="top-bar">
        <div className="search-filter-row">
          <div className="search-group">
            <Input
              placeholder="搜索会话标题"
              prefix={<SearchOutlined />}
              value={searchParams.sessionTitle || ''}
              onChange={(e) => handleSearch('sessionTitle', e.target.value)}
              style={{ width: 200 }}
            />
            <Input
              placeholder="搜索消息内容"
              prefix={<SearchOutlined />}
              value={searchParams.messageContent || ''}
              onChange={(e) => handleSearch('messageContent', e.target.value)}
              style={{ width: 200 }}
            />
            <Input
              placeholder="搜索用户 ID"
              prefix={<SearchOutlined />}
              value={searchParams.userId || ''}
              onChange={(e) => handleSearch('userId', e.target.value)}
              style={{ width: 150 }}
            />
          </div>
          
          <div className="filter-group">
            <Select
              placeholder="选择状态"
              value={filterParams.status || undefined}
              onChange={(value) => handleFilter('status', value)}
              style={{ width: 120 }}
            >
              <Option value={SessionStatus.ACTIVE}>有效</Option>
              <Option value={SessionStatus.DELETED}>已删除</Option>
            </Select>
            
            <Select
              placeholder="选择角色"
              value={filterParams.role || undefined}
              onChange={(value) => handleFilter('role', value)}
              style={{ width: 120 }}
            >
              <Option value={MessageRole.USER}>用户</Option>
              <Option value={MessageRole.ASSISTANT}>助手</Option>
              <Option value={MessageRole.SYSTEM}>系统</Option>
            </Select>
            
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeChange}
              style={{ width: 240 }}
            />
          </div>
          
          <div className="action-group">
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" danger icon={<DeleteOutlined />}>
              批量删除
            </Button>
          </div>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="main-content">
        {/* 左侧会话列表 */}
        <div className="session-list">
          <div className="list-header">会话列表</div>
          <div className="list-content">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="session-header">
                  <div className="session-title">{session.title}</div>
                  <div className={`session-status ${session.status === SessionStatus.ACTIVE ? 'status-active' : 'status-deleted'}`}>
                    {session.status === SessionStatus.ACTIVE ? '有效' : '已删除'}
                  </div>
                </div>
                <div className="session-meta">
                  <div className="session-id">{session.id}</div>
                  <div className="user-id">{session.userId}</div>
                </div>
                <div className="session-footer">
                  <div className="message-count">{session.messageCount} 条消息</div>
                  <div className="update-time">{new Date(session.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination-wrapper">
            <Pagination
              current={sessionPagination.page}
              pageSize={sessionPagination.pageSize}
              total={totalSessions}
              onChange={(page, pageSize) => setSessionPagination({ page, pageSize })}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              showTotal={(total) => `共 ${total} 条`}
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>
        
        {/* 中间消息列表 */}
        <div className="message-list">
          <div className="list-header">
            <div className="header-title">
              消息列表
              {selectedSession && (
                <span className="session-info">
                  会话: {selectedSession.title}
                </span>
              )}
            </div>
          </div>
          <div className="list-content">
            {messages.map(message => (
              <div
                key={message.id}
                className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="message-header">
                  <div className="message-id">{message.id}</div>
                  <div className="message-meta">
                    <span className={`role-tag role-${message.role}`}>
                      {message.role === MessageRole.USER ? '用户' : 
                       message.role === MessageRole.ASSISTANT ? '助手' : '系统'}
                    </span>
                    <span className="sequence-number">#{message.sequence}</span>
                  </div>
                </div>
                <div className="message-preview">
                  {message.type === MessageType.IMAGE && (
                    <img 
                      src="https://via.placeholder.com/60x40" 
                      alt="预览" 
                      className="image-preview"
                    />
                  )}
                  {message.preview}
                </div>
                <div className="message-footer">
                  <div className="message-type">
                    {message.type === MessageType.TEXT ? '文本' : 
                     message.type === MessageType.IMAGE ? '图片' : 
                     message.type === MessageType.AUDIO ? '音频' : '视频'}
                  </div>
                  <div className="create-time">{new Date(message.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination-wrapper">
            <Pagination
              current={messagePagination.page}
              pageSize={messagePagination.pageSize}
              total={totalMessages}
              onChange={(page, pageSize) => setMessagePagination({ page, pageSize })}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              showTotal={(total) => `共 ${total} 条`}
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>
        
        {/* 右侧内容详情 */}
        <div className="content-detail">
          <div className="detail-header">
            <span>内容详情</span>
            {selectedMessage && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                onClick={handleAddContent}
              >
                添加内容
              </Button>
            )}
          </div>
          <div className="detail-content">
            {selectedMessage ? (
              <>
                {/* 消息基础信息 */}
                <div className="message-info">
                  <div className="info-item">
                    <div className="info-label">消息 ID:</div>
                    <div className="info-value">{selectedMessage.id}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">角色:</div>
                    <div className="info-value">
                      {selectedMessage.role === MessageRole.USER ? '用户' : 
                       selectedMessage.role === MessageRole.ASSISTANT ? '助手' : '系统'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">序号:</div>
                    <div className="info-value">#{selectedMessage.sequence}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">类型:</div>
                    <div className="info-value">
                      {selectedMessage.type === MessageType.TEXT ? '文本' : 
                       selectedMessage.type === MessageType.IMAGE ? '图片' : 
                       selectedMessage.type === MessageType.AUDIO ? '音频' : '视频'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">创建时间:</div>
                    <div className="info-value">{new Date(selectedMessage.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                
                {/* 消息内容列表 */}
                <div className="content-section">
                  <div className="section-header">
                    <span>内容列表 ({messageContents.length} 项)</span>
                  </div>
                  <div className="content-list">
                    {messageContents.map(content => (
                      <div key={content.id} className="content-item">
                        <div className="content-header">
                          <span className="content-sequence">序列 #{content.sequence}</span>
                          <div className="content-actions">
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              size="small"
                              onClick={() => handleEditContent(content)}
                            >
                              编辑
                            </Button>
                            <Popconfirm
                              title="确定要删除这个内容吗？"
                              onConfirm={() => handleDeleteContent(content.id)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button type="text" danger icon={<DeleteOutlined />} size="small">
                                删除
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                        <div className="content-body">
                          <span className="content-type">
                            {content.type === MessageType.TEXT ? '文本' : 
                             content.type === MessageType.IMAGE ? '图片' : 
                             content.type === MessageType.AUDIO ? '音频' : '视频'}
                          </span>
                          {content.type === MessageType.IMAGE ? (
                            <img 
                              src={content.content} 
                              alt="内容" 
                              className="image-content"
                            />
                          ) : (
                            <div className="text-content">{content.content}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {messageContents.length === 0 && (
                      <div className="empty-state">暂无内容</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">请选择一条消息查看详情</div>
            )}
          </div>
          <div className="detail-footer">
            <Button>关闭</Button>
          </div>
        </div>
      </div>
      
      {/* 内容编辑模态框 */}
      <Modal
        title={editingContent ? '编辑内容' : '添加内容'}
        visible={contentModalVisible}
        onOk={handleSaveContent}
        onCancel={() => setContentModalVisible(false)}
        width={500}
      >
        <Form form={contentForm} layout="vertical">
          <Form.Item
            name="sequence"
            label="序列"
            rules={[{ required: true, message: '请输入序列' }]}
          >
            <Input type="number" placeholder="请输入序列" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Option value={MessageType.TEXT}>文本</Option>
              <Option value={MessageType.IMAGE}>图片</Option>
              <Option value={MessageType.AUDIO}>音频</Option>
              <Option value={MessageType.VIDEO}>视频</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入内容"
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesManagement;
