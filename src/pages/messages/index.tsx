import React, { useState } from 'react';
import { Layout, Card, Table, Input, Select, DatePicker, Button, Space, Tag, Avatar, Popconfirm, message } from 'antd';
import { SearchOutlined, ExportOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import './index.less';

const { Header, Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 类型定义
interface Session {
  id: number;
  userId: string;
  title: string;
  messageCount: number;
  updateTime: string;
  status: 'active' | 'deleted';
}

interface Message {
  id: number;
  role: 'user' | 'admin';
  sequence: number;
  contentPreview: string;
  type: 'text' | 'image';
  createTime: string;
}

interface MessageContent {
  id: number;
  sequence: number;
  content: string;
  type: 'text' | 'image';
}

// 模拟数据
const mockSessions: Session[] = [
  { id: 1, userId: 'user_001', title: '咨询产品功能', messageCount: 15, updateTime: '2024-01-15 14:30:00', status: 'active' },
  { id: 2, userId: 'user_002', title: '投诉服务态度', messageCount: 8, updateTime: '2024-01-14 09:15:00', status: 'active' },
  { id: 3, userId: 'user_003', title: '寻求技术支持', messageCount: 22, updateTime: '2024-01-13 16:45:00', status: 'deleted' },
  { id: 4, userId: 'user_004', title: '反馈使用体验', messageCount: 10, updateTime: '2024-01-12 11:20:00', status: 'active' },
  { id: 5, userId: 'user_005', title: '购买意向咨询', messageCount: 18, updateTime: '2024-01-11 15:30:00', status: 'active' },
];

const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 101, role: 'user', sequence: 1, contentPreview: '你好，我想了解一下你们的产品功能', type: 'text', createTime: '2024-01-15 14:30:00' },
    { id: 102, role: 'admin', sequence: 2, contentPreview: '您好，请问有什么具体的功能想了解吗？', type: 'text', createTime: '2024-01-15 14:31:00' },
    { id: 103, role: 'user', sequence: 3, contentPreview: '主要想了解一下数据分析和报表功能', type: 'text', createTime: '2024-01-15 14:32:00' },
  ],
  2: [
    { id: 201, role: 'user', sequence: 1, contentPreview: '我要投诉你们的客服人员态度不好', type: 'text', createTime: '2024-01-14 09:15:00' },
    { id: 202, role: 'admin', sequence: 2, contentPreview: '非常抱歉给您带来不好的体验，请具体说明情况', type: 'text', createTime: '2024-01-14 09:16:00' },
  ],
  3: [
    { id: 301, role: 'user', sequence: 1, contentPreview: '我的系统出现了错误，无法登录', type: 'text', createTime: '2024-01-13 16:45:00' },
    { id: 302, role: 'admin', sequence: 2, contentPreview: '请提供您的用户名和错误信息截图', type: 'text', createTime: '2024-01-13 16:46:00' },
  ],
  4: [
    { id: 401, role: 'user', sequence: 1, contentPreview: '使用了一段时间，感觉整体不错，但有几个小问题', type: 'text', createTime: '2024-01-12 11:20:00' },
  ],
  5: [
    { id: 501, role: 'user', sequence: 1, contentPreview: '我想购买你们的产品，请问价格是多少？', type: 'text', createTime: '2024-01-11 15:30:00' },
  ],
};

const mockMessageContents: Record<number, MessageContent[]> = {
  101: [{ id: 1001, sequence: 1, content: '你好，我想了解一下你们的产品功能', type: 'text' }],
  102: [{ id: 1002, sequence: 1, content: '您好，请问有什么具体的功能想了解吗？', type: 'text' }],
  103: [{ id: 1003, sequence: 1, content: '主要想了解一下数据分析和报表功能', type: 'text' }],
  201: [{ id: 2001, sequence: 1, content: '我要投诉你们的客服人员态度不好', type: 'text' }],
  202: [{ id: 2002, sequence: 1, content: '非常抱歉给您带来不好的体验，请具体说明情况', type: 'text' }],
  301: [{ id: 3001, sequence: 1, content: '我的系统出现了错误，无法登录', type: 'text' }],
  302: [{ id: 3002, sequence: 1, content: '请提供您的用户名和错误信息截图', type: 'text' }],
  401: [{ id: 4001, sequence: 1, content: '使用了一段时间，感觉整体不错，但有几个小问题', type: 'text' }],
  501: [{ id: 5001, sequence: 1, content: '我想购买你们的产品，请问价格是多少？', type: 'text' }],
};

const MessagesPage: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [messages, setMessages] = useState<Message[]>(mockMessages[1] || []);
  const [messageContents, setMessageContents] = useState<MessageContent[]>(mockMessageContents[101] || []);

  // 左侧会话列表列定义
  const sessionColumns: ColumnType<any>[] = [
    { title: '会话 ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '用户 ID', dataIndex: 'userId', key: 'userId', width: 120 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '消息数', dataIndex: 'messageCount', key: 'messageCount', width: 100 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 160 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'gray'}>
          {status === 'active' ? '有效' : '已删除'}
        </Tag>
      )
    },
    { 
      title: '操作', 
      key: 'actions', 
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewSession(record.id)}>查看</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditSession(record.id)}>编辑</Button>
          <Popconfirm title="确定删除该会话？" onConfirm={() => handleDeleteSession(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  // 中间消息列表列定义
  const messageColumns: ColumnType<any>[] = [
    { title: '消息 ID', dataIndex: 'id', key: 'id', width: 100 },
    { 
      title: '角色', 
      dataIndex: 'role', 
      key: 'role', 
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'user' ? 'blue' : 'orange'}>
          {role === 'user' ? '用户' : '管理员'}
        </Tag>
      )
    },
    { title: '序号', dataIndex: 'sequence', key: 'sequence', width: 80 },
    { title: '内容预览', dataIndex: 'contentPreview', key: 'contentPreview', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
    { 
      title: '操作', 
      key: 'actions', 
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewMessage(record.id)}>查看</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditMessage(record.id)}>编辑</Button>
          <Popconfirm title="确定删除该消息？" onConfirm={() => handleDeleteMessage(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  // 处理会话选择
  const handleSessionSelect = (record: Session) => {
    setSelectedSession(record.id);
    setMessages(mockMessages[record.id] || []);
    setSelectedMessage(null);
    setMessageContents([]);
  };

  // 处理消息选择
  const handleMessageSelect = (record: Message) => {
    setSelectedMessage(record.id);
    setMessageContents(mockMessageContents[record.id] || []);
  };

  // 会话操作
  const handleViewSession = (id: number) => {
    message.info(`查看会话 ${id}`);
  };

  const handleEditSession = (id: number) => {
    message.info(`编辑会话 ${id}`);
  };

  const handleDeleteSession = (id: number) => {
    setSessions(sessions.filter(session => session.id !== id));
    if (selectedSession === id) {
      setSelectedSession(null);
      setMessages([]);
      setSelectedMessage(null);
      setMessageContents([]);
    }
    message.success('会话删除成功');
  };

  // 消息操作
  const handleViewMessage = (id: number) => {
    message.info(`查看消息 ${id}`);
  };

  const handleEditMessage = (id: number) => {
    message.info(`编辑消息 ${id}`);
  };

  const handleDeleteMessage = (id: number) => {
    if (selectedSession) {
      const updatedMessages = messages.filter(message => message.id !== id);
      setMessages(updatedMessages);
      if (selectedMessage === id) {
        setSelectedMessage(null);
        setMessageContents([]);
      }
      message.success('消息删除成功');
    }
  };

  // 内容操作
  const handleAddContent = () => {
    message.info('添加内容');
  };

  const handleEditContent = (id: number) => {
    message.info(`编辑内容 ${id}`);
  };

  const handleDeleteContent = (id: number) => {
    const updatedContents = messageContents.filter(content => content.id !== id);
    setMessageContents(updatedContents);
    message.success('内容删除成功');
  };

  // 搜索和筛选
  const handleSearch = (value: string) => {
    message.info(`搜索: ${value}`);
  };

  const handleFilter = () => {
    message.info('筛选');
  };

  const handleReset = () => {
    message.info('重置');
  };

  const handleExport = () => {
    message.info('导出');
  };

  const handleBatchDelete = () => {
    message.info('批量删除');
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header className="messages-header">
        <div className="search-section">
          <Search 
            placeholder="输入会话标题、消息内容或用户 ID 搜索" 
            allowClear 
            enterButton={<SearchOutlined />} 
            size="middle" 
            onSearch={handleSearch}
            style={{ width: 500, marginRight: 16 }}
          />
        </div>
        <div className="filter-section">
          <Space size="middle">
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="active">有效</Option>
              <Option value="deleted">已删除</Option>
            </Select>
            <Select placeholder="角色" style={{ width: 120 }}>
              <Option value="user">用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
            <RangePicker style={{ width: 300 }} />
            <Button onClick={handleFilter}>筛选</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>批量删除</Button>
          </Space>
        </div>
      </Header>
      <Content className="messages-content">
        <div className="sessions-column">
          <Card title="会话列表" bordered={false} style={{ height: '100%' }}>
            <Table 
              columns={sessionColumns} 
              dataSource={sessions} 
              rowKey="id" 
              pagination={{ pageSize: 10 }} 
              onRow={(record) => ({
                onClick: () => handleSessionSelect(record),
                className: selectedSession === record.id ? 'selected-row' : '',
              })}
            />
          </Card>
        </div>
        <div className="messages-column">
          <Card title="消息列表" bordered={false} style={{ height: '100%' }}>
            <Table 
              columns={messageColumns} 
              dataSource={messages} 
              rowKey="id" 
              pagination={{ pageSize: 10 }} 
              onRow={(record) => ({
                onClick: () => handleMessageSelect(record),
                className: selectedMessage === record.id ? 'selected-row' : '',
              })}
            />
          </Card>
        </div>
        <div className="content-column">
          <Card 
            title="内容详情" 
            bordered={false} 
            style={{ height: '100%' }} 
            extra={<Button icon={<PlusOutlined />} onClick={handleAddContent}>添加内容</Button>}
          >
            {selectedMessage ? (
              <div className="content-details">
                {messageContents.map((content) => (
                  <div key={content.id} className="content-item">
                    <div className="content-header">
                      <span className="content-sequence">序号: {content.sequence}</span>
                      <Space size="small">
                        <Button size="small" icon={<EditOutlined />} onClick={() => handleEditContent(content.id)}>编辑</Button>
                        <Popconfirm title="确定删除该内容？" onConfirm={() => handleDeleteContent(content.id)}>
                          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>
                      </Space>
                    </div>
                    <div className="content-body">
                      {content.type === 'text' ? (
                        <p>{content.content}</p>
                      ) : content.type === 'image' ? (
                        <Avatar src={content.content} size={100} /> 
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-selection">请选择一条消息查看详情</div>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default MessagesPage;