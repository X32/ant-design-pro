// 导入React及相关Hook
import React, { useState, useEffect, useCallback } from 'react';
// 导入Ant Design组件
import { Input, Select, DatePicker, Button, Table, Pagination, Space, Tag, Modal, Form, App, Popconfirm } from 'antd';
// 导入Ant Design图标
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
// 导入类型定义
import { 
  SpokenConversation, 
  SpokenMessage, 
  SessionStatus, 
  MessageRole, 
  MessageType, 
  SearchParams, 
  FilterParams, 
  PaginationParams 
} from './types';
// 导入模拟数据API
import { mockApi } from './mockData';
// 导入API服务
import { 
  getSpokenConversations,
  getSpokenMessages,
  updateSpokenConversation,
  createSpokenConversation,
  deleteSpokenConversation  // 💡 新增：导入删除接口
} from '@/services/ant-design-pro/api';
// 导入样式文件
import './index.less';

// 解构常用组件
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

/**
 * 口语练习会话管理组件
 * 提供口语练习会话和消息的管理功能
 */
const MessagesManagement: React.FC = () => {
  // 使用 App 组件提供的 message API
  const { message } = App.useApp();
  
  // 搜索和筛选参数
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  
  // 分页参数
  const [sessionPagination, setSessionPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [messagePagination, setMessagePagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  
  // 数据状态
  const [conversations, setConversations] = useState<SpokenConversation[]>([]); // 口语会话列表
  const [messages, setMessages] = useState<SpokenMessage[]>([]); // 消息列表
  const [totalConversations, setTotalConversations] = useState<number>(0); // 会话总数
  const [totalMessages, setTotalMessages] = useState<number>(0); // 消息总数
  
  // 加载状态使用 ref 避免依赖项变化
  const isFetchingConversationsRef = React.useRef<boolean>(false); // 会话列表加载状态
  const isFetchingMessagesRef = React.useRef<boolean>(false); // 消息列表加载状态
  
  // 选中状态
  const [selectedConversation, setSelectedConversation] = useState<SpokenConversation | null>(null); // 当前选中的会话
  const [selectedMessage, setSelectedMessage] = useState<SpokenMessage | null>(null); // 当前选中的消息
  
  // 模态框状态
  const [editModalVisible, setEditModalVisible] = useState(false); // 会话编辑模态框显示状态
  const [editingConversation, setEditingConversation] = useState<SpokenConversation | null>(null); // 正在编辑的会话
  
  // 表单实例
  const [editForm] = Form.useForm(); // 会话编辑表单实例
  
  /**
   * 获取口语练习会话列表
   * 1. 调用API获取真实数据
   * 2. 数据转换为组件所需格式
   */
  const fetchConversations = useCallback(async () => {
    // 防止重复调用
    if (isFetchingConversationsRef.current) return;
    
    isFetchingConversationsRef.current = true;
    
    try {
      // 使用口语练习会话接口
      const response = await getSpokenConversations({
        status_filter: filterParams.status as 'active' | 'completed' | 'archived' | undefined,
        limit: sessionPagination.pageSize,
        offset: (sessionPagination.page - 1) * sessionPagination.pageSize,
      });
      
      // 根据实际接口返回格式处理数据
      if (response.success && response.data) {
        setConversations(response.data);
        setTotalConversations(response.total || response.data.length);
        message.success('获取会话列表成功');
      } else {
        throw new Error('API返回数据格式错误');
      }
    } catch (error) {
      console.error('获取会话列表失败:', error);
      message.error('获取会话列表失败');
      setConversations([]);
      setTotalConversations(0);
    } finally {
      isFetchingConversationsRef.current = false;
    }
  }, [searchParams, filterParams, sessionPagination]);
  
  /**
   * 获取消息列表
   * 1. 根据会话 ID 调用 API 获取消息数据
   * 2. 数据转换为组件所需格式
   */
  const fetchMessages = useCallback(async (conversationId: number) => {
    // 防止重复调用
    if (isFetchingMessagesRef.current) return;
      
    isFetchingMessagesRef.current = true;
      
    try {
      // 使用口语练习消息接口
      const response = await getSpokenMessages(conversationId);
        
      if (response.success && response.data) {
        setMessages(response.data);
        setTotalMessages(response.data.length);
          
        // 如果没有选中消息，默认选中第一个
        if (response.data.length > 0 && !selectedMessage) {
          setSelectedMessage(response.data[0]);
        }
          
        message.success('获取消息列表成功');
      } else {
        throw new Error('API返回数据格式错误');
      }
    } catch (error) {
      console.error('获取消息列表失败:', error);
      message.error('获取消息列表失败');
      setMessages([]);
      setTotalMessages(0);
    } finally {
      isFetchingMessagesRef.current = false;
    }
  }, [selectedMessage]);
  

  // 初始化数据
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]); // 只在fetchConversations函数变化时调用
    
  // 使用ref来跟踪上一个会话ID，避免不必要的重复调用
  const prevConversationIdRef = React.useRef<number | null>(null);
    
  /**
   * 会话选中变化处理
   * 1. 检测会话 ID 是否真正变化
   * 2. 重置消息分页
   * 3. 获取新会话的消息列表
   * 4. 会话为空时清空相关状态
   */
  useEffect(() => {
    if (selectedConversation && selectedConversation.id) {
      // 只有当会话 ID 真正变化时才调用 fetchMessages
      if (selectedConversation.id !== prevConversationIdRef.current) {
        setMessagePagination({ page: 1, pageSize: 10 });
        fetchMessages(selectedConversation.id);
        prevConversationIdRef.current = selectedConversation.id;
      }
    } else {
      setMessages([]);
      setTotalMessages(0);
      setSelectedMessage(null);
      prevConversationIdRef.current = null;
    }
  }, [selectedConversation, fetchMessages]);
  
  /**
   * 会话列表变化处理
   * 当没有选中会话时，自动选中第一个会话
   */
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);
  
  /**
   * 搜索参数处理
   * 更新搜索参数并重置分页
   */
  const handleSearch = (field: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
    setSessionPagination({ page: 1, pageSize: 10 });
    setMessagePagination({ page: 1, pageSize: 10 });
  };
  
  /**
   * 筛选参数处理
   * 更新筛选参数并重置分页
   */
  const handleFilter = (field: keyof FilterParams, value: any) => {
    setFilterParams(prev => ({ ...prev, [field]: value }));
    setSessionPagination({ page: 1, pageSize: 10 });
    setMessagePagination({ page: 1, pageSize: 10 });
  };
  
  /**
   * 日期范围筛选处理
   * 更新日期范围筛选参数并重置会话分页
   */
  const handleDateRangeChange = (dates: any, dateStrings: string[]) => {
    setFilterParams(prev => ({
      ...prev,
      startDate: dateStrings[0],
      endDate: dateStrings[1]
    }));
    setSessionPagination({ page: 1, pageSize: 10 });
  };
  
  /**
   * 重置搜索和筛选
   * 清空所有搜索筛选参数和相关状态
   */
  const handleReset = () => {
    setSearchParams({});
    setFilterParams({});
    setSessionPagination({ page: 1, pageSize: 10 });
    setMessagePagination({ page: 1, pageSize: 10 });
    setSelectedConversation(null);
    setSelectedMessage(null);
  };
  
  /**
   * 导出数据
   * 提示功能开发中
   */
  const handleExport = () => {
    message.success('导出功能开发中...');
  };
  
  /**
   * 删除会话（软删除或硬删除）
   * @param conversationId 会话 ID
   * @param hardDelete 是否硬删除（默认 false 为软删除）
   */
  const handleDeleteConversation = async (conversationId: number, hardDelete: boolean = false) => {
    try {
      const response = await deleteSpokenConversation(conversationId, hardDelete);
      
      if (response.success) {
        const deleteType = hardDelete ? '硬删除' : '软删除（归档）';
        message.success(`会话${deleteType}成功`);
        
        // 刷新会话列表
        fetchConversations();
        
        // 如果删除的是当前选中的会话，清除选中状态
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
          setTotalMessages(0);
          setSelectedMessage(null);
        }
      } else {
        throw new Error(response.message || '删除失败');
      }
    } catch (error: any) {
      console.error('删除会话失败:', error);
      
      // 检查是否是会话不存在错误
      if (error?.data?.error_code === 'CONVERSATION_NOT_FOUND') {
        message.error('会话不存在');
      } else {
        message.error('删除会话失败');
      }
    }
  };
  
  /**
   * 编辑会话
   * 打开编辑模态框
   */
  const handleEditConversation = (conversation: SpokenConversation) => {
    setEditingConversation(conversation);
    editForm.setFieldsValue({
      title: conversation.title,
      status: conversation.status
    });
    setEditModalVisible(true);
  };
  
  /**
   * 保存会话编辑
   */
  const handleSaveConversation = async () => {
    try {
      const values = await editForm.validateFields();
      
      if (editingConversation) {
        await updateSpokenConversation(editingConversation.id, values);
        message.success('会话更新成功');
        setEditModalVisible(false);
        fetchConversations();
      }
    } catch (error) {
      message.error('保存会话失败');
    }
  };
  
  /**
   * 会话列表列配置
   */
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
      width: 180,
      align: 'center',
      render: (_: any, record: SpokenConversation) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => setSelectedConversation(record)}
          >
            查看
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditConversation(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="选择删除方式"
            description={
              <div style={{ maxWidth: 300 }}>
                <p style={{ marginBottom: 10 }}>请选择删除方式：</p>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li style={{ marginBottom: 5 }}><strong>软删除（归档）：</strong>会话状态设置为 archived，数据保留</li>
                  <li><strong>硬删除：</strong>物理删除会话及所有关联消息</li>
                </ul>
              </div>
            }
            onConfirm={() => handleDeleteConversation(record.id, false)}
            onCancel={() => {
              Modal.confirm({
                title: '确定硬删除？',
                content: '硬删除将永久删除会话及所有消息，此操作不可恢复！',
                okText: '确定硬删除',
                cancelText: '取消',
                okType: 'danger',
                onOk: () => handleDeleteConversation(record.id, true),
              });
            }}
            okText="软删除（归档）"
            cancelText="硬删除"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  /**
   * 消息列表列配置
   */
  const messageColumns = [
    {
      title: '消息 ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
      render: (text: number) => <span className="message-id">{text}</span>
    },
    {
      title: '发送者',
      dataIndex: 'sender',
      key: 'sender',
      width: 80,
      align: 'center',
      render: (sender: 'user' | 'ai') => (
        <span className={`role-tag role-${sender}`}>
          {sender === 'user' ? '用户' : 'AI'}
        </span>
      )
    },
    {
      title: '轮次',
      dataIndex: 'round_num',
      key: 'round_num',
      width: 60,
      align: 'center',
      render: (num: number) => <span className="sequence-number">#{num || 0}</span>
    },
    {
      title: '内容预览',
      dataIndex: 'content',
      key: 'content',
      flex: 1,
      ellipsis: {
        showTitle: true
      },
      render: (text: string, record: SpokenMessage) => (
        <div className="message-preview">
          {record.message_type === 'image' && record.image_url && (
            <img 
              src={record.image_url} 
              alt="预览" 
              className="image-preview"
              style={{maxHeight: '40px'}}
            />
          )}
          {record.message_type === 'voice' && record.transcription_text && (
            <span>[语音] {record.transcription_text.substring(0, 50)}...</span>
          )}
          {record.message_type === 'text' && text.substring(0, 100)}
          {record.message_type === 'score' && '[评分消息]'}
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'message_type',
      key: 'message_type',
      width: 80,
      align: 'center',
      render: (type: string) => (
        <span className="message-type">
          {type === 'text' ? '文本' : 
           type === 'voice' ? '语音' : 
           type === 'image' ? '图片' : '评分'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      ellipsis: true,
      render: (text: string) => <span className="create-time">{new Date(text).toLocaleString()}</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_: any, record: SpokenMessage) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => setSelectedMessage(record)}
          >
            查看
          </Button>
        </Space>
      )
    }
  ];
  
  // 渲染组件UI
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
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`session-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="session-header">
                  <div className="session-title">{conversation.title}</div>
                  <div className="session-actions">
                    <Space size="small">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          handleEditConversation(conversation);
                        }}
                        title="编辑会话"
                      />
                      <Popconfirm
                        title="选择删除方式"
                        description={
                          <div style={{ maxWidth: 300 }}>
                            <p style={{ marginBottom: 10 }}>请选择删除方式：</p>
                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                              <li style={{ marginBottom: 5 }}><strong>软删除（归档）：</strong>会话状态设置为 archived，数据保留</li>
                              <li><strong>硬删除：</strong>物理删除会话及所有关联消息</li>
                            </ul>
                          </div>
                        }
                        onConfirm={(e) => {
                          e?.stopPropagation(); // 阻止事件冒泡
                          handleDeleteConversation(conversation.id, false);
                        }}
                        onCancel={(e) => {
                          e?.stopPropagation(); // 阻止事件冒泡
                          Modal.confirm({
                            title: '确定硬删除？',
                            content: '硬删除将永久删除会话及所有消息，此操作不可恢复！',
                            okText: '确定硬删除',
                            cancelText: '取消',
                            okType: 'danger',
                            onOk: () => handleDeleteConversation(conversation.id, true),
                          });
                        }}
                        okText="软删除（归档）"
                        cancelText="硬删除"
                      >
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          size="small"
                          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
                          title="删除会话"
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
                <div className="session-meta">
                  <div className={`session-status ${conversation.status === 'active' ? 'status-active' : 'status-deleted'}`}>
                    {conversation.status === 'active' ? '活跃' : conversation.status === 'completed' ? '已完成' : '已归档'}
                  </div>
                  <div className="session-id">{conversation.id}</div>
                  <div className="user-id">{conversation.user_id}</div>
                </div>
                <div className="session-footer">
                  <div className="message-count">{conversation.total_messages} 条消息 / {conversation.total_rounds} 轮</div>
                  <div className="update-time">{new Date(conversation.last_message_time || conversation.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination-wrapper">
            <Pagination
              current={sessionPagination.page}
              pageSize={sessionPagination.pageSize}
              total={totalConversations}
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
              {selectedConversation && (
                <span className="session-info">
                  会话: {selectedConversation.title}
                </span>
              )}
            </div>
          </div>
          <div className="list-content">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message-item ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="message-header">
                  <div className="message-id">{msg.id}</div>
                  <div className="message-meta">
                    <span className={`role-tag role-${msg.sender}`}>
                      {msg.sender === 'user' ? '用户' : 'AI'}
                    </span>
                    <span className="sequence-number">#{msg.round_num || 0}</span>
                  </div>
                </div>
                <div className="message-preview">
                  {msg.message_type === 'image' && msg.image_url && (
                    <img 
                      src={msg.image_url} 
                      alt="预览" 
                      className="image-preview"
                    />
                  )}
                  {msg.message_type === 'voice' && msg.transcription_text && (
                    <span>[语音] {msg.transcription_text.substring(0, 50)}...</span>
                  )}
                  {msg.message_type === 'text' && msg.content.substring(0, 100)}
                  {msg.message_type === 'score' && '[评分消息]'}
                </div>
                <div className="message-footer">
                  <div className="message-type">
                    {msg.message_type === 'text' ? '文本' : 
                     msg.message_type === 'voice' ? '语音' : 
                     msg.message_type === 'image' ? '图片' : '评分'}
                  </div>
                  <div className="create-time">{new Date(msg.timestamp).toLocaleString()}</div>
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
        
        {/* 右侧消息详情 */}
        <div className="content-detail">
          <div className="detail-header">
            <span>消息详情</span>
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
                    <div className="info-label">发送者:</div>
                    <div className="info-value">
                      {selectedMessage.sender === 'user' ? '用户' : 'AI'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">轮次:</div>
                    <div className="info-value">#{selectedMessage.round_num || 0}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">类型:</div>
                    <div className="info-value">
                      {selectedMessage.message_type === 'text' ? '文本' : 
                       selectedMessage.message_type === 'voice' ? '语音' : 
                       selectedMessage.message_type === 'image' ? '图片' : '评分'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">创建时间:</div>
                    <div className="info-value">{new Date(selectedMessage.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                
                {/* 消息内容显示 */}
                <div className="content-section">
                  <div className="section-header">
                    <span>消息内容</span>
                  </div>
                  
                  {/* 文本消息 */}
                  {selectedMessage.message_type === 'text' && (
                    <div className="text-content">
                      <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{selectedMessage.content}</pre>
                    </div>
                  )}
                  
                  {/* 语音消息 */}
                  {selectedMessage.message_type === 'voice' && (
                    <div className="voice-content">
                      {selectedMessage.audio_url && (
                        <div className="audio-player" style={{marginBottom: '10px'}}>
                          <audio controls src={selectedMessage.audio_url} style={{width: '100%'}}></audio>
                        </div>
                      )}
                      {selectedMessage.transcription_text && (
                        <div className="transcription">
                          <div style={{fontWeight: 'bold', marginBottom: '5px'}}>转写文本:</div>
                          <div>{selectedMessage.transcription_text}</div>
                        </div>
                      )}
                      <div className="transcription-status" style={{marginTop: '10px', color: '#666'}}>
                        转写状态: {selectedMessage.transcription_status || 'pending'}
                      </div>
                    </div>
                  )}
                  
                  {/* 图片消息 */}
                  {selectedMessage.message_type === 'image' && selectedMessage.image_url && (
                    <div className="image-content">
                      <img src={selectedMessage.image_url} alt="消息图片" style={{maxWidth: '100%'}} />
                    </div>
                  )}
                  
                  {/* 评分消息 */}
                  {selectedMessage.message_type === 'score' && (
                    <div className="score-content">
                      {selectedMessage.total_score && (
                        <div style={{marginBottom: '10px'}}>
                          <strong>总分:</strong> {selectedMessage.total_score}
                        </div>
                      )}
                      {selectedMessage.dimension_scores && (
                        <div style={{marginBottom: '10px'}}>
                          <strong>维度评分:</strong>
                          <pre style={{whiteSpace: 'pre-wrap', marginTop: '5px'}}>{selectedMessage.dimension_scores}</pre>
                        </div>
                      )}
                      {selectedMessage.advantages && (
                        <div style={{marginBottom: '10px'}}>
                          <strong>优点:</strong>
                          <pre style={{whiteSpace: 'pre-wrap', marginTop: '5px'}}>{selectedMessage.advantages}</pre>
                        </div>
                      )}
                      {selectedMessage.disadvantages && (
                        <div style={{marginBottom: '10px'}}>
                          <strong>缺点:</strong>
                          <pre style={{whiteSpace: 'pre-wrap', marginTop: '5px'}}>{selectedMessage.disadvantages}</pre>
                        </div>
                      )}
                      {selectedMessage.suggestions && (
                        <div style={{marginBottom: '10px'}}>
                          <strong>建议:</strong>
                          <pre style={{whiteSpace: 'pre-wrap', marginTop: '5px'}}>{selectedMessage.suggestions}</pre>
                        </div>
                      )}
                      {selectedMessage.improved_answer && (
                        <div style={{marginBottom: '10px'}}>
                          <strong>改进答案:</strong>
                          <pre style={{whiteSpace: 'pre-wrap', marginTop: '5px'}}>{selectedMessage.improved_answer}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">请选择一条消息查看详情</div>
            )}
          </div>
          <div className="detail-footer">
            <Button onClick={() => setSelectedMessage(null)}>关闭</Button>
          </div>
        </div>
      </div>
      
      {/* 会话编辑模态框 */}
      <Modal
        title="编辑会话"
        open={editModalVisible}
        onOk={handleSaveConversation}
        onCancel={() => setEditModalVisible(false)}
        afterClose={() => editForm.resetFields()}
        width={500}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="会话标题"
            rules={[{ required: true, message: '请输入会话标题' }]}
          >
            <Input placeholder="请输入会话标题" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="会话状态"
            rules={[{ required: true, message: '请选择会话状态' }]}
          >
            <Select placeholder="请选择会话状态">
              <Option value="active">活跃</Option>
              <Option value="completed">已完成</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesManagement;
