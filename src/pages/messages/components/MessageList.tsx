import React from 'react';
import { Table, Button, Tag, Space, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  selectedMessage?: Message | null;
  onMessageSelect: (message: Message) => void;
  onBatchSelect?: (selectedRowKeys: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
}

const MessageList: React.FC<MessageListProps> = ({ messages, onMessageSelect, onBatchSelect, selectedRowKeys }) => {
  // 表格列配置
  const columns = [
    {
      title: '消息ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 80,
      align: 'center' as const,
      render: (role: string) => {
        const roleMap = {
          user: { text: '用户', class: 'role-user' },
          assistant: { text: '助手', class: 'role-assistant' },
          system: { text: '系统', class: 'role-system' },
        };
        const config = roleMap[role as keyof typeof roleMap] || roleMap.user;
        return <Tag className={config.class}>{config.text}</Tag>;
      },
    },
    {
      title: '序号',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 60,
      align: 'center' as const,
    },
    {
      title: '内容预览',
      dataIndex: 'contentPreview',
      key: 'contentPreview',
      ellipsis: true,
      render: (text: string, record: Message) => {
        if (record.type === 'image') {
          return (
            <Tooltip title="图片内容">
              <span>🖼️ 图片</span>
            </Tooltip>
          );
        }
        return <Tooltip title={text}>{text}</Tooltip>;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      align: 'center' as const,
      render: (type: string) => {
        const typeMap = {
          text: { text: '文本', class: 'type-text' },
          image: { text: '图片', class: 'type-image' },
          audio: { text: '音频', class: 'type-audio' },
          video: { text: '视频', class: 'type-video' },
        };
        const config = typeMap[type as keyof typeof typeMap] || typeMap.text;
        return <span className={config.class}>{config.text}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: Message) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onMessageSelect(record)}
          >
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Button type="link" icon={<DeleteOutlined />} size="small" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 表格行选择器
  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys: selectedRowKeys || [],
    onChange: (selectedRowKeys: React.Key[]) => {
      if (onBatchSelect) {
        onBatchSelect(selectedRowKeys);
      }
    },
    onSelect: (record: Message, selected: boolean) => {
      if (selected) {
        // 如果选择了行，同时更新单选状态
        onMessageSelect(record);
      }
    },
  };

  // 空状态处理
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💬</div>
        <div className="empty-text">请先选择左侧的会话</div>
      </div>
    );
  }

  return (
    <div>
      <Table
        rowKey="id"
        dataSource={messages}
        columns={columns}
        rowSelection={rowSelection}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        size="small"
        bordered
      />
    </div>
  );
};

export default MessageList;