import React, { useState, useEffect } from 'react';
import { Input, Select, DatePicker, Button, Table, Card, Space, Tag, Avatar, Modal, Form, Row, Col, Popconfirm } from 'antd';
import { SearchOutlined, ExportOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import styles from './style.less';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// 模拟数据类型定义
interface Session {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  updateTime: string;
  status: 'active' | 'deleted';
}

interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  sequence: number;
  preview: string;
  type: 'text' | 'image';
  createTime: string;
}

interface Content {
  id: string;
  messageId: string;
  sequence: number;
  content: string;
  type: 'text';
}

// 模拟数据
const mockSessions: Session[] = [
  { id: 'S001', userId: 'U123', title: '技术支持咨询', messageCount: 15, updateTime: '2024-06-20 14:30:00', status: 'active' },
  { id: 'S002', userId: 'U456', title: '产品功能建议', messageCount: 8, updateTime: '2024-06-19 09:15:00', status: 'active' },
  { id: 'S003', userId: 'U789', title: '账单问题', messageCount: 5, updateTime: '2024-06-18 16:45:00', status: 'deleted' },
  { id: 'S004', userId: 'U101', title: '账号登录异常', messageCount: 12, updateTime: '2024-06-17 11:20:00', status: 'active' },
  { id: 'S005', userId: 'U102', title: '使用教程查询', messageCount: 6, updateTime: '2024-06-16 15:30:00', status: 'active' },
];

const mockMessages: Message[] = [
  { id: 'M001', sessionId: 'S001', role: 'user', sequence: 1, preview: '你好，我遇到了一个技术问题...', type: 'text', createTime: '2024-06-20 14:00:00' },
  { id: 'M002', sessionId: 'S001', role: 'assistant', sequence: 2, preview: '请详细描述您的问题，我会尽力帮助您...', type: 'text', createTime: '2024-06-20 14:05:00' },
  { id: 'M003', sessionId: 'S001', role: 'user', sequence: 3, preview: '系统报错截图', type: 'image', createTime: '2024-06-20 14:10:00' },
  { id: 'M004', sessionId: 'S001', role: 'assistant', sequence: 4, preview: '根据您的描述和截图，问题可能是...', type: 'text', createTime: '2024-06-20 14:15:00' },
  { id: 'M005', sessionId: 'S002', role: 'user', sequence: 1, preview: '我建议增加一个功能...', type: 'text', createTime: '2024-06-19 09:00:00' },
  { id: 'M006', sessionId: 'S002', role: 'assistant', sequence: 2, preview: '感谢您的建议，我们会考虑的...', type: 'text', createTime: '2024-06-19 09:10:00' },
];

const mockContents: Content[] = [
  { id: 'C001', messageId: 'M001', sequence: 1, content: '你好，我遇到了一个技术问题。当我尝试登录系统时，页面显示错误信息。', type: 'text' },
  { id: 'C002', messageId: 'M002', sequence: 2, content: '请详细描述您的问题，我会尽力帮助您解决。您可以提供错误截图或具体的错误信息吗？', type: 'text' },
  { id: 'C003', messageId: 'M003', sequence: 3, content: '这是系统报错的截图。', type: 'text' },
  { id: 'C004', messageId: 'M004', sequence: 4, content: '根据您的描述和截图，问题可能是由于浏览器缓存导致的。建议您尝试清除浏览器缓存后再重新登录。如果问题仍然存在，请提供更多的信息，我会进一步帮助您解决。', type: 'text' },
];

const MessagesPage: React.FC = () => {
  // 状态管理
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [searchParams, setSearchParams] = useState({ sessionTitle: '', messageContent: '', userId: '' });
  const [filterParams, setFilterParams] = useState({ status: '', role: '', dateRange: [] });
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [form] = Form.useForm();

  // 初始化数据
  useEffect(() => {
    if (sessions.length > 0) {
      setSelectedSession(sessions[0].id);
    }
  }, [sessions]);

  // 当选中会话变化时，加载对应消息
  useEffect(() => {
    if (selectedSession) {
      const filteredMessages = mockMessages.filter(msg => msg.sessionId === selectedSession);
      setMessages(filteredMessages);
      if (filteredMessages.length > 0) {
        setSelectedMessage(filteredMessages[0].id);
      } else {
        setSelectedMessage(null);
      }
    }
  }, [selectedSession]);

  // 当选中消息变化时，加载对应内容
  useEffect(() => {
    if (selectedMessage) {
      const filteredContents = mockContents.filter(content => content.messageId === selectedMessage);
      setContents(filteredContents);
    }
  }, [selectedMessage]);

  // 搜索功能
  const handleSearch = (values: any) => {
    setSearchParams(values);
    // 实际应用中这里会调用API进行搜索
    console.log('搜索参数:', values);
  };

  // 筛选功能
  const handleFilter = (values: any) => {
    setFilterParams(values);
    // 实际应用中这里会调用API进行筛选
    console.log('筛选参数:', values);
  };

  // 重置功能
  const handleReset = () => {
    setSearchParams({ sessionTitle: '', messageContent: '', userId: '' });
    setFilterParams({ status: '', role: '', dateRange: [] });
    // 实际应用中这里会重置搜索和筛选条件
  };

  // 导出功能
  const _handleExport = () => {
    // 实际应用中这里会实现导出功能
    console.log('导出数据');
  };

  // 批量删除功能
  const handleBatchDelete = () => {
    // 实际应用中这里会实现批量删除功能
    console.log('批量删除数据');
  };

  // 会话列表列定义
  const sessionColumns = [
    { title: '会话 ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户 ID', dataIndex: 'userId', key: 'userId', width: 80 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '消息数', dataIndex: 'messageCount', key: 'messageCount', width: 70 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 120 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 70,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'gray'}>
          {status === 'active' ? '有效' : '已删除'}
        </Tag>
      )
    },
    { 
      title: '操作', 
      key: 'actions', 
      width: 120,
      render: (_: any, record: Session) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedSession(record.id)}>查看</Button>
          <Button size="small" icon={<EditOutlined />}>编辑</Button>
          <Popconfirm title="确定删除此会话？" onConfirm={() => handleDeleteSession(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  // 消息列表列定义
  const messageColumns = [
    { title: '消息 ID', dataIndex: 'id', key: 'id', width: 80 },
    { 
      title: '角色', 
      dataIndex: 'role', 
      key: 'role', 
      width: 70,
      render: (role: string) => (
        <Tag color={role === 'user' ? 'blue' : 'orange'}>
          {role === 'user' ? '用户' : '助手'}
        </Tag>
      )
    },
    { title: '序号', dataIndex: 'sequence', key: 'sequence', width: 60 },
    { 
      title: '内容预览', 
      dataIndex: 'preview', 
      key: 'preview', 
      ellipsis: true,
      render: (preview: string, record: Message) => (
        <div>
          {record.type === 'image' ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size={40} icon={<img alt="预览" src="https://via.placeholder.com/40" />} /> 
              <span style={{ marginLeft: 8 }}>{preview}</span>
            </div>
          ) : (
            preview
          )}
        </div>
      )
    },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type', 
      width: 60,
      render: (type: string) => type === 'text' ? '文本' : '图片'
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 120 },
    { 
      title: '操作', 
      key: 'actions', 
      width: 80,
      render: (_: any, record: Message) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedMessage(record.id)}>查看</Button>
          <Button size="small" icon={<EditOutlined />}>编辑</Button>
          <Popconfirm title="确定删除此消息？" onConfirm={() => handleDeleteMessage(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  // 删除会话
  const handleDeleteSession = (id: string) => {
    // 实际应用中这里会调用API删除会话
    setSessions(sessions.filter(session => session.id !== id));
    if (selectedSession === id) {
      setSelectedSession(null);
    }
  };

  // 删除消息
  const handleDeleteMessage = (id: string) => {
    // 实际应用中这里会调用API删除消息
    setMessages(messages.filter(message => message.id !== id));
    if (selectedMessage === id) {
      setSelectedMessage(null);
    }
  };

  // 打开内容编辑模态框
  const openContentModal = (content?: Content) => {
    if (content) {
      setEditingContent(content);
      form.setFieldsValue(content);
    } else {
      setEditingContent(null);
      form.resetFields();
    }
    setContentModalVisible(true);
  };

  // 关闭内容编辑模态框
  const closeContentModal = () => {
    setContentModalVisible(false);
    setEditingContent(null);
  };

  // 保存内容
  const saveContent = (values: Content) => {
    // 实际应用中这里会调用API保存内容
    if (editingContent) {
      // 编辑模式
      setContents(contents.map(content => content.id === editingContent.id ? { ...content, ...values } : content));
    } else {
      // 新增模式
      const newContent: Content = {
        ...values,
        id: `C${String(contents.length + 1).padStart(3, '0')}`,
        messageId: selectedMessage || '',
        sequence: contents.length + 1
      };
      setContents([...contents, newContent]);
    }
    closeContentModal();
  };

  // 删除内容
  const deleteContent = (id: string) => {
    // 实际应用中这里会调用API删除内容
    setContents(contents.filter(content => content.id !== id));
  };

  return (
    <div style={{ padding: 24, minHeight: 360 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1890ff' }}>消息管理</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
          <Form.Item label="会话标题" name="sessionTitle">
            <Input placeholder="会话标题" prefix={<SearchOutlined />} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item label="消息内容" name="messageContent">
            <Input placeholder="消息内容" prefix={<SearchOutlined />} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item label="用户 ID" name="userId">
            <Input placeholder="用户 ID" prefix={<SearchOutlined />} style={{ width: 150 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" onClick={() => form.submit()}>搜索</Button>
          <Button onClick={handleReset}>重置</Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item label="状态" name="status">
              <Select placeholder="状态" style={{ width: 120 }}>
                <Option value="active">有效</Option>
                <Option value="deleted">已删除</Option>
              </Select>
            </Form.Item>
            <Form.Item label="角色" name="role">
              <Select placeholder="角色" style={{ width: 120 }}>
                <Option value="user">用户</Option>
                <Option value="assistant">助手</Option>
              </Select>
            </Form.Item>
            <Form.Item label="时间范围" name="dateRange">
              <RangePicker style={{ width: 250 }} placeholder={['开始日期', '结束日期']} />
            </Form.Item>
            <Button type="primary" htmlType="submit" onClick={() => form.submit()}>筛选</Button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<ExportOutlined />} onClick={_handleExport}>导出</Button>
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>批量删除</Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.7fr', gap: 24 }}>
        <Card title="会话列表" bordered={false} style={{ height: '100%' }} bodyStyle={{ padding: 0 }}>
          <Table
            columns={sessionColumns}
            dataSource={sessions}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            rowSelection={{ type: 'radio', selectedRowKeys: selectedSession ? [selectedSession] : [], onChange: (keys) => setSelectedSession(keys[0] as string) }}
            scroll={{ y: 'calc(100vh - 350px)' }}
          />
        </Card>

        <Card title="消息列表" bordered={false} style={{ height: '100%' }} bodyStyle={{ padding: 0 }}>
          <Table
            columns={messageColumns}
            dataSource={messages}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            rowSelection={{ type: 'radio', selectedRowKeys: selectedMessage ? [selectedMessage] : [], onChange: (keys) => setSelectedMessage(keys[0] as string) }}
            scroll={{ y: 'calc(100vh - 350px)' }}
          />
        </Card>

        <Card 
          title="内容详情" 
          bordered={false} 
          style={{ height: '100%' }} 
          extra={<Button icon={<PlusOutlined />} onClick={() => openContentModal()}>添加内容</Button>} 
        >
          {selectedMessage ? (
            <div>
              {contents.length > 0 ? (
                <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
                  {contents.sort((a, b) => a.sequence - b.sequence).map(content => (
                    <div key={content.id} style={{ padding: 16, border: '1px solid #e8e8e8', borderRadius: 4, marginBottom: 16, background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 500, color: '#1890ff' }}>序号: {content.sequence}</span>
                        <Space size="small">
                          <Button size="small" icon={<EditOutlined />} onClick={() => openContentModal(content)}>编辑</Button>
                          <Popconfirm title="确定删除此内容？" onConfirm={() => deleteContent(content.id)}>
                            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                          </Popconfirm>
                        </Space>
                      </div>
                      <div style={{ lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{content.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                  暂无内容
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
              请选择一条消息查看详情
            </div>
          )}
        </Card>
      </div>

      {/* 内容编辑模态框 */}
      <Modal
        title={editingContent ? '编辑内容' : '添加内容'}
        visible={contentModalVisible}
        onCancel={closeContentModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={saveContent}>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={6} placeholder="请输入内容" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={closeContentModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesPage;