import React from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Session } from '../types';

interface SessionListProps {
  sessions: Session[];
  selectedSession?: Session | null;
  onSessionSelect: (session: Session) => void;
  onBatchSelect?: (selectedRowKeys: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onSessionSelect, onBatchSelect, selectedRowKeys }) => {
  // 表格列配置
  const columns = [
    {
      title: '会话ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      ellipsis: true,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center' as const,
      render: (status: string) => {
        const statusMap = {
          active: { text: '有效', class: 'status-active' },
          deleted: { text: '已删除', class: 'status-deleted' },
        };
        const config = statusMap[status as keyof typeof statusMap] || statusMap.active;
        return <Tag className={config.class}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: Session) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onSessionSelect(record)}
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
    onSelect: (record: Session, selected: boolean) => {
      if (selected) {
        // 如果选择了行，同时更新单选状态
        onSessionSelect(record);
      }
    },
  };

  return (
    <div>
      <Table
        rowKey="id"
        dataSource={sessions}
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

export default SessionList;