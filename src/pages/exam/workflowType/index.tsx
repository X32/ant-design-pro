import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Switch, 
  message, 
  Space, 
  Popconfirm,
  Tag,
  Card,
  App
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  getWorkflowTypes, 
  createWorkflowType, 
  updateWorkflowType, 
  deleteWorkflowType 
} from '@/services/ant-design-pro/api';
import './index.less';

const { TextArea } = Input;

// 使用全局类型定义
type WorkflowTypeOption = API.WorkflowTypeOption;

const WorkflowTypePage: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<WorkflowTypeOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [onlyActive, setOnlyActive] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRecord, setEditingRecord] = useState<WorkflowTypeOption | null>(null);
  
  const [form] = Form.useForm();

  // 加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getWorkflowTypes({
        only_active: onlyActive,
        page,
        page_size: pageSize,
      });

      if (response.success) {
        console.log('=== 后端返回的原始数据 ===');
        console.log('response.data:', response.data);
        console.log('第一条数据:', response.data?.[0]);
        console.log('price 类型:', typeof response.data?.[0]?.price);
        console.log('price 值:', response.data?.[0]?.price);
        
        setDataSource(response.data || []);
        setTotal(response.total || 0);
        messageApi.success(`成功加载 ${response.data?.length || 0} 条数据`);
      } else {
        messageApi.error(response.message || '获取数据失败');
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        const errorDetail = error?.response?.data?.detail;
        if (errorDetail === 'Not authenticated') {
          messageApi.error('后端 API 路由未配置认证中间件，请检查后端服务配置', 5);
        } else {
          messageApi.error('权限不足，请联系管理员');
        }
      } else if (error?.response?.status === 401) {
        messageApi.error('Token 已过期，请重新登录');
      } else {
        messageApi.error(error?.message || '获取数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, onlyActive]);

  // 打开创建对话框
  const handleCreate = () => {
    setModalMode('create');
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      sort: 0,
      is_active: true,
    });
    setModalVisible(true);
  };

  // 打开编辑对话框
  const handleEdit = (record: WorkflowTypeOption) => {
    setModalMode('edit');
    setEditingRecord(record);
    form.setFieldsValue({
      label: record.label,
      value: record.value,
      price: record.price,
      description: record.description,
      sort: record.sort,
      is_active: record.is_active === 1,
    });
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      setLoading(true);
      
      if (modalMode === 'create') {
        // 创建
        const response = await createWorkflowType({
          label: values.label,
          value: values.value,
          price: values.price,
          description: values.description || '',
          sort: values.sort || 0,
        });

        if (response.success) {
          messageApi.success('创建成功');
          setModalVisible(false);
          fetchData();
        } else {
          messageApi.error(response.message || '创建失败');
        }
      } else {
        // 更新
        const response = await updateWorkflowType(editingRecord!.id, {
          label: values.label,
          price: values.price,
          description: values.description,
          sort: values.sort,
          is_active: values.is_active ? 1 : 0,
        });

        if (response.success) {
          messageApi.success('更新成功');
          setModalVisible(false);
          fetchData();
        } else {
          messageApi.error(response.message || '更新失败');
        }
      }
    } catch (error: any) {
      messageApi.error(error?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const response = await deleteWorkflowType(id);
      
      if (response.success) {
        messageApi.success('删除成功');
        fetchData();
      } else {
        messageApi.error(response.message || '删除失败');
      }
    } catch (error: any) {
      messageApi.error(error?.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<WorkflowTypeOption> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '显示名称',
      dataIndex: 'label',
      key: 'label',
      width: 150,
    },
    {
      title: '类型标识',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: any) => {
        // 确保 price 是数字类型
        const numPrice = typeof price === 'number' ? price : parseFloat(price);
        return `¥${isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)}`;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active: number) => (
        <Tag color={is_active === 1 ? 'green' : 'red'}>
          {is_active === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个工作流类型吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="workflow-type-page">
      <Card>
        <div className="toolbar">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建工作流类型
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
            >
              刷新
            </Button>
            <span>显示：</span>
            <Switch
              checked={onlyActive}
              onChange={setOnlyActive}
              checkedChildren="仅启用"
              unCheckedChildren="全部"
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新建工作流类型' : '编辑工作流类型'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="label"
            label="显示名称"
            rules={[
              { required: true, message: '请输入显示名称' },
              { max: 100, message: '最多100个字符' },
            ]}
          >
            <Input placeholder="例如：PET Part2" />
          </Form.Item>

          <Form.Item
            name="value"
            label="类型标识"
            rules={[
              { required: true, message: '请输入类型标识' },
              { max: 50, message: '最多50个字符' },
              { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线' },
            ]}
            tooltip="唯一标识，只能包含小写字母、数字和下划线"
          >
            <Input 
              placeholder="例如：pet_part2" 
              disabled={modalMode === 'edit'}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格（元）"
            rules={[
              { required: true, message: '请输入价格' },
              { type: 'number', min: 0, message: '价格不能为负数' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              precision={2}
              min={0}
              placeholder="例如：12.00"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述信息"
            rules={[
              { max: 500, message: '最多500个字符' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请输入描述信息"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序权重"
            tooltip="数值越大越靠前"
            rules={[
              { type: 'number', message: '请输入数字' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="默认为 0"
            />
          </Form.Item>

          {modalMode === 'edit' && (
            <Form.Item
              name="is_active"
              label="是否启用"
              valuePropName="checked"
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowTypePage;
