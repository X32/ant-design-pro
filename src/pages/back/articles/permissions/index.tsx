import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Space,
  message,
  Modal,
  Tag,
  Avatar,
  Checkbox,
  Popconfirm,
  Form,
  Input,
} from 'antd';
import {
  UserAddOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CheckOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  grantArticlePermission,
  revokeArticlePermission,
  getUsersWithPermissions,
} from '@/services/ant-design-pro/api';
import './index.less';

// 权限类型配置
const PERMISSION_CONFIG = {
  create: {
    label: '创建文章',
    description: '允许创建草稿文章',
    color: '#52c41a',
    icon: '📝',
  },
  create_review: {
    label: '创建+审核文章',
    description: '允许创建和审核文章',
    color: '#1890ff',
    icon: '📝🔍',
  },
};

// 有权限的用户类型
type UserWithPermissions = {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  permissions?: string[];  // 权限类型字符串数组
  user_id?: number;
  is_active?: boolean;
  _key?: string;  // 唯一标识符，用于表格 key
};

const ArticlePermissionsPage: React.FC = () => {
  // 分页状态
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  // 数据状态
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 模态框状态
  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [grantForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 获取用户列表
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsersWithPermissions({ status: 'active' });

      console.log('API Response:', response);

      if (response && Array.isArray(response.users)) {
        // 将响应数据转换为需要的格式，为每个用户添加唯一标识符
        const usersWithPermissions = response.users.map((user, index) => ({
          id: user.id,
          username: user.username,
          email: user.email || '',
          avatar: user.avatar || '',
          user_id: user.id,
          // permission_type 是单个字符串，需要转换为数组格式
          permissions: user.permission_type ? [user.permission_type] : [],
          is_active: true,
          // 添加唯一标识符用于表格 key
          _key: `user_${user.id}_${index}`,
        }));

        console.log('Users with permissions:', usersWithPermissions);
        setUsers(usersWithPermissions);
        setTotal(usersWithPermissions.length);
      } else {
        console.error('响应格式错误:', response);
        message.error('获取有权限的用户列表失败');
      }
    } catch (error) {
      console.error('获取有权限的用户列表失败:', error);
      message.error('获取有权限的用户列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  // 打开分配权限模态框
  const openGrantModal = () => {
    setGrantModalVisible(true);
    grantForm.resetFields();
  };

  // 提交分配权限
  const handleGrantSubmit = async () => {
    let values;
    try {
      values = await grantForm.validateFields();
    } catch (error) {
      console.error('表单验证失败:', error);
      return;
    }

    setSubmitting(true);

    try {
      // 将 user_id 转换为数字
      const userId = typeof values.user_id === 'string'
        ? parseInt(values.user_id, 10)
        : values.user_id;

      for (const permissionType of values.permissions) {
        await grantArticlePermission({
          user_id: userId,
          permission_type: permissionType,
        });
      }

      message.success('分配权限成功');
      setGrantModalVisible(false);
      grantForm.resetFields();
      fetchPermissions();
    } catch (error) {
      console.error('分配权限失败:', error);
      message.error('分配权限失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 打开编辑权限模态框
  const openEditModal = (user: UserWithPermissions) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      user_id: Number(user.id),
      permissions: user.permissions || [],
    });
    setEditModalVisible(true);
  };

  // 提交编辑权限
  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    const values = await editForm.validateFields();
    setSubmitting(true);

    try {
      // 先撤销所有权限
      for (const permission of (selectedUser.permissions || [])) {
        await revokeArticlePermission({
          user_id: selectedUser.id!,
          permission_type: permission as 'create' | 'create_review',
        });
      }

      // 再分配新权限
      for (const permissionType of (values.permissions || [])) {
        await grantArticlePermission({
          user_id: selectedUser.id!,
          permission_type: permissionType as 'create' | 'create_review',
        });
      }

      message.success('更新权限成功');
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedUser(null);
      fetchPermissions();
    } catch (error) {
      console.error('更新权限失败:', error);
      message.error('更新权限失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 撤销用户所有权限
  const handleRevokeAll = async (user: UserWithPermissions) => {
    try {
      for (const permission of (user.permissions || [])) {
        await revokeArticlePermission({
          user_id: user.id!,
          permission_type: permission as 'create' | 'create_review',
        });
      }

      message.success('撤销权限成功');
      fetchPermissions();
    } catch (error) {
      console.error('撤销权限失败:', error);
      message.error('撤销权限失败，请重试');
    }
  };

  // 刷新列表
  const handleRefresh = () => {
    setPagination({ ...pagination, current: 1 });
  };

  // 渲染权限标签
  const renderPermissionTags = (permissions: string[] = []) => {
    return (
      <Space size="small" wrap>
        {permissions.map((perm, index) => {
          const config = PERMISSION_CONFIG[perm as keyof typeof PERMISSION_CONFIG];
          return (
            <Tag
              key={`${perm}-${index}`}
              color={config?.color}
              style={{
                borderRadius: '12px',
                border: '2px solid #000',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              {config?.icon} {config?.label}
            </Tag>
          );
        })}
        {permissions.length === 0 && (
          <Tag style={{ color: '#999' }}>无权限</Tag>
        )}
      </Space>
    );
  };

  // 表格列定义
  const columns: ProColumns<UserWithPermissions>[] = [
    {
      title: '用户',
      dataIndex: 'username',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatar || undefined}
            icon={!record.avatar && <CheckOutlined />}
            size={40}
            style={{
              border: '2px solid #000',
              backgroundColor: '#FFD93D',
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.username}</div>
            {record.email && (
              <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '当前权限',
      dataIndex: 'permissions',
      width: 300,
      render: (_, record) => renderPermissionTags(record.permissions),
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      width: 120,
      render: (permissions: string[] | undefined) => (
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {(permissions || []).length} 个
        </span>
      ),
    },
    {
      title: '用户ID',
      dataIndex: 'id',
      width: 100,
      render: (id) => (
        <span style={{ fontWeight: 'bold', color: '#666' }}>{id}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#1890ff' }}
            onClick={() => openEditModal(record)}
          >
            编辑权限
          </Button>
          {(record.permissions || []).length > 0 && (
            <Popconfirm
              title="确认撤销该用户的所有文章权限？"
              onConfirm={() => handleRevokeAll(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              >
                撤销权限
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 初始化加载
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return (
    <PageContainer className="article-permissions-page">
      {/* 头部操作栏 */}
      <div className="header-bar">
        <Space size="middle">
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={openGrantModal}
            size="large"
            style={{
              backgroundColor: '#4ECDC4',
              borderColor: '#000',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0px #000',
            }}
          >
            分配权限
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            size="large"
            style={{
              borderColor: '#000',
              boxShadow: '3px 3px 0px #000',
            }}
          >
            刷新
          </Button>
        </Space>
        <div className="stats">
          <Space size="large">
            <div className="stat-item">
              <span className="stat-label">总用户数：</span>
              <span className="stat-value">{total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">有权限用户：</span>
              <span className="stat-value">
                {users.filter((u) => (u.permissions || []).length > 0).length}
              </span>
            </div>
          </Space>
        </div>
      </div>

      {/* 权限说明卡片 */}
      <div className="permission-guide">
        <h3>📋 权限说明</h3>
        <div className="guide-grid">
          {Object.entries(PERMISSION_CONFIG).map(([key, config]) => (
            <div key={key} className="guide-item">
              <div className="guide-icon">{config.icon}</div>
              <div className="guide-content">
                <div className="guide-label">{config.label}</div>
                <div className="guide-desc">{config.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 用户权限表格 */}
      <ProTable<UserWithPermissions>
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="_key"
        search={false}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize: pageSize || 20 }),
        }}
        scroll={{ x: 1200 }}
        rowClassName="permission-row"
      />

      {/* 分配权限模态框 */}
      <Modal
        title={
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            🔑 分配文章权限
          </span>
        }
        open={grantModalVisible}
        onOk={handleGrantSubmit}
        onCancel={() => {
          setGrantModalVisible(false);
          grantForm.resetFields();
        }}
        confirmLoading={submitting}
        okText="确认分配"
        cancelText="取消"
        width={600}
        style={{ top: 100 }}
      >
        <Form form={grantForm} layout="vertical">
          <Form.Item
            name="user_id"
            label="用户ID"
            rules={[
              { required: true, message: '请输入用户ID' },
              {
                validator: (_, value) => {
                  if (!value && value !== 0) {
                    return Promise.reject(new Error('请输入用户ID'));
                  }
                  // 确保值是字符串或数字
                  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                  if (isNaN(numValue) || numValue < 1 || numValue > 999999999) {
                    return Promise.reject(new Error('请输入有效的正整数（1-999999999）'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="请输入要分配权限的用户ID"
              size="large"
              type="text"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="选择权限"
            rules={[{ required: true, message: '请至少选择一个权限' }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(PERMISSION_CONFIG).map(([key, config]) => (
                  <Checkbox key={key} value={key} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{config.icon}</span>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{config.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {config.description}
                        </div>
                      </div>
                    </div>
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑权限模态框 */}
      <Modal
        title={
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            ✏️ 编辑文章权限
          </span>
        }
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setSelectedUser(null);
        }}
        confirmLoading={submitting}
        okText="确认更新"
        cancelText="取消"
        width={600}
        style={{ top: 100 }}
      >
        {selectedUser && (
          <div className="edit-modal-content">
            <div className="user-info">
              <Avatar src={selectedUser.avatar} size={48}>
                {!selectedUser.avatar && selectedUser.username?.[0]}
              </Avatar>
              <div>
                <div className="username">{selectedUser.username}</div>
                {selectedUser.email && (
                  <div className="email">{selectedUser.email}</div>
                )}
              </div>
            </div>
            <div className="current-permissions">
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                当前权限：
              </div>
              {renderPermissionTags(selectedUser.permissions)}
            </div>
            <Form form={editForm} layout="vertical" style={{ marginTop: '20px' }}>
              <Form.Item
                name="permissions"
                label="选择新权限（不选择则撤销所有权限）"
              >
                <Checkbox.Group style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {Object.entries(PERMISSION_CONFIG).map(([key, config]) => (
                      <Checkbox key={key} value={key} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{config.icon}</span>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{config.label}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {config.description}
                            </div>
                          </div>
                        </div>
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ArticlePermissionsPage;
