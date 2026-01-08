import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import type {
  CreateUserParams,
  UpdateUserParams,
  UserInfo,
} from '@/services/ant-design-pro/api';
import {
  createUser,
  deleteUser,
  getAdminStats,
  getUserDetail,
  getUserList,
  updateUser,
} from '@/services/ant-design-pro/api';
import './index.less';

/**
 * 用户管理页面
 */
const UserManager: React.FC = () => {
  const [form] = Form.useForm();

  // 列表数据
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 分页
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);

  // 统计数据
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
  });

  /**
   * 获取统计信息
   */
  const fetchStats = async () => {
    try {
      const response = await getAdminStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计信息失败:', error);
    }
  };

  /**
   * 获取用户列表
   */
  const fetchUserList = async () => {
    setLoading(true);
    try {
      const response = await getUserList({
        page: pagination.current,
        page_size: pagination.pageSize,
      });

      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotal(response.data.total || 0);
      }
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      message.error(error?.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初始化加载
   */
  useEffect(() => {
    fetchUserList();
    fetchStats();
  }, [pagination.current, pagination.pageSize]);

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    fetchUserList();
    fetchStats();
  };

  /**
   * 打开创建用户弹窗
   */
  const handleCreate = () => {
    setModalType('create');
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      is_superuser: false,
    });
    setModalVisible(true);
  };

  /**
   * 打开编辑用户弹窗
   */
  const handleEdit = async (record: UserInfo) => {
    setModalType('edit');
    setEditingUser(record);

    // 获取用户详情
    try {
      const response = await getUserDetail(record.id);
      if (response.success && response.data?.user) {
        const user = response.data.user;
        form.setFieldsValue({
          email: user.email,
          is_active: user.is_active,
          is_superuser: user.is_superuser,
        });
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error('获取用户详情失败:', error);
      message.error(error?.message || '获取用户详情失败');
    }
  };

  /**
   * 删除用户
   */
  const handleDelete = async (userId: number) => {
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        message.success('删除成功');
        fetchUserList();
        fetchStats();
      }
    } catch (error: any) {
      console.error('删除用户失败:', error);
      message.error(error?.message || '删除用户失败');
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === 'create') {
        // 创建用户
        const params: CreateUserParams = {
          email: values.email,
          password: values.password,
          is_superuser: values.is_superuser || false,
        };

        const response = await createUser(params);
        if (response.success) {
          message.success('创建成功');
          setModalVisible(false);
          fetchUserList();
          fetchStats();
        }
      } else {
        // 更新用户
        if (!editingUser) return;

        const params: UpdateUserParams = {
          email: values.email,
          is_active: values.is_active,
          is_superuser: values.is_superuser,
        };

        // 如果填写了新密码，则更新密码
        if (values.password) {
          params.password = values.password;
        }

        const response = await updateUser(editingUser.id, params);
        if (response.success) {
          message.success('更新成功');
          setModalVisible(false);
          fetchUserList();
          fetchStats();
        }
      }
    } catch (error: any) {
      console.error('提交失败:', error);
      message.error(error?.message || '操作失败');
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<UserInfo> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'is_superuser',
      key: 'is_superuser',
      width: 120,
      align: 'center',
      render: (isSuperuser: boolean) => (
        <Tag color={isSuperuser ? 'blue' : 'default'}>
          {isSuperuser ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => (time ? new Date(time).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="删除后将无法恢复，确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-manager-page">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.total_users}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.active_users}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="禁用用户"
              value={stats.total_users - stats.active_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 用户列表 */}
      <Card
        title="用户列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建用户
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 个用户`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize: pageSize || 10 });
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 创建/编辑用户弹窗 */}
      <Modal
        title={modalType === 'create' ? '创建用户' : '编辑用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              {
                required: modalType === 'create',
                message: '请输入密码',
              },
              {
                min: 6,
                message: '密码至少6位',
              },
            ]}
            extra={modalType === 'edit' ? '留空则不修改密码' : undefined}
          >
            <Input.Password placeholder="请输入密码（至少6位）" />
          </Form.Item>

          {modalType === 'edit' && (
            <Form.Item label="状态" name="is_active" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          )}

          <Form.Item
            label="管理员权限"
            name="is_superuser"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
