import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch,
  message,
  Popconfirm,
  App,
  Divider,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Helmet } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import {
  adminGetVipPlans,
  adminGetVipPlanDetail,
  adminCreateVipPlan,
  adminUpdateVipPlan,
  adminUpdateVipPlanStatus,
  adminDeleteVipPlan,
  AdminVipPlan,
  AdminCreateVipPlanRequest,
  AdminUpdateVipPlanRequest,
  ExamLevel,
} from '@/services/ant-design-pro/api/vipSubscription';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

const VipPlanManagement: React.FC = () => {
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<AdminVipPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [filterExamLevel, setFilterExamLevel] = useState<ExamLevel | undefined>();
  const [filterStatus, setFilterStatus] = useState<number | undefined>();
  
  // 弹窗相关
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentPlan, setCurrentPlan] = useState<AdminVipPlan | null>(null);
  const [form] = Form.useForm();

  // 获取套餐列表
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await adminGetVipPlans({
        exam_level: filterExamLevel,
        status: filterStatus,
      });

      if (response.success) {
        setDataSource(response.data);
        setTotal(response.total);
      } else {
        message.error(response.message || '获取套餐列表失败');
      }
    } catch (error: any) {
      message.error(error.message || '获取套餐列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [filterExamLevel, filterStatus]);

  // 打开创建弹窗
  const handleCreate = () => {
    setModalMode('create');
    setCurrentPlan(null);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      status: 1,
      sort: 100,
      is_recommended: 0,
    });
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = async (record: AdminVipPlan) => {
    setModalMode('edit');
    setCurrentPlan(record);
    
    try {
      const response = await adminGetVipPlanDetail(record.id);
      if (response.success && response.data) {
        form.setFieldsValue(response.data);
        setModalVisible(true);
      } else {
        message.error('获取套餐详情失败');
      }
    } catch (error: any) {
      message.error(error.message || '获取套餐详情失败');
    }
  };

  // 打开查看弹窗
  const handleView = async (record: AdminVipPlan) => {
    setModalMode('view');
    setCurrentPlan(record);
    
    try {
      const response = await adminGetVipPlanDetail(record.id);
      if (response.success && response.data) {
        form.setFieldsValue(response.data);
        setModalVisible(true);
      } else {
        message.error('获取套餐详情失败');
      }
    } catch (error: any) {
      message.error(error.message || '获取套餐详情失败');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (modalMode === 'create') {
        response = await adminCreateVipPlan(values as AdminCreateVipPlanRequest);
      } else if (modalMode === 'edit' && currentPlan) {
        response = await adminUpdateVipPlan(currentPlan.id, values as AdminUpdateVipPlanRequest);
      }

      if (response?.success) {
        message.success(modalMode === 'create' ? '创建成功' : '更新成功');
        setModalVisible(false);
        fetchPlans();
      } else {
        message.error(response?.message || '操作失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      } else {
        message.error(error.message || '操作失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 上架/下架
  const handleToggleStatus = async (record: AdminVipPlan) => {
    const newStatus = record.status === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? '上架' : '下架';
    
    try {
      setLoading(true);
      const response = await adminUpdateVipPlanStatus(record.id, { status: newStatus });
      
      if (response.success) {
        message.success(`${statusText}成功`);
        fetchPlans();
      } else {
        message.error(response.message || `${statusText}失败`);
      }
    } catch (error: any) {
      message.error(error.message || `${statusText}失败`);
    } finally {
      setLoading(false);
    }
  };

  // 删除套餐
  const handleDelete = async (record: AdminVipPlan) => {
    try {
      setLoading(true);
      const response = await adminDeleteVipPlan(record.id);
      
      if (response.success) {
        message.success('删除成功');
        fetchPlans();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error: any) {
      message.error(error.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<AdminVipPlan> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '考试级别',
      dataIndex: 'exam_level',
      key: 'exam_level',
      width: 100,
      render: (level: ExamLevel) => (
        <Tag color="gold" icon={<CrownOutlined />}>
          {level}
        </Tag>
      ),
    },
    {
      title: '套餐名称',
      dataIndex: 'plan_name',
      key: 'plan_name',
      width: 180,
      render: (text: string, record: AdminVipPlan) => (
        <Space>
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          {record.is_recommended === 1 && (
            <Tag color="red">推荐</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '套餐类型',
      dataIndex: 'plan_type',
      key: 'plan_type',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          monthly: '月卡',
          quarterly: '季卡',
          yearly: '年卡',
          weekly: '周卡',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '时长(天)',
      dataIndex: 'duration_days',
      key: 'duration_days',
      width: 100,
    },
    {
      title: '原价',
      dataIndex: 'original_price',
      key: 'original_price',
      width: 100,
      render: (price: number) => `¥${(price / 100).toFixed(2)}`,
    },
    {
      title: '售价',
      dataIndex: 'sale_price',
      key: 'sale_price',
      width: 100,
      render: (price: number) => (
        <span style={{ color: '#faad14', fontWeight: 'bold' }}>
          ¥{(price / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: '首购价',
      dataIndex: 'first_buy_price',
      key: 'first_buy_price',
      width: 100,
      render: (price: number) => (
        <span style={{ color: '#52c41a' }}>
          ¥{(price / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        status === 1 ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>上架</Tag>
        ) : (
          <Tag color="default" icon={<CloseCircleOutlined />}>下架</Tag>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，确定要删除这个套餐吗？"
            onConfirm={() => handleDelete(record)}
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
    <>
      <Helmet>
        <title>VIP会员套餐 - 剑桥英语口语练习会员 | SpeakCube</title>
        <meta 
          name="description" 
          content="SpeakCube VIP会员套餐，无限次KET/PET/FCE口语模拟考试，享受专属AI评分服务。月卡、季卡、年卡多种选择，助力孩子口语提升！" 
        />
        <meta 
          name="keywords" 
          content="KET口语VIP,PET口语会员,FCE口语套餐,剑桥英语会员,口语练习套餐,AI口语VIP" 
        />
        <link rel="canonical" href="https://www.qtoplay.com/back/orders/vip-plans" />
      </Helmet>

      <PageContainer
        header={{
          title: 'VIP套餐管理',
          breadcrumb: {},
        }}
      >
      <Card>
        {/* 筛选和操作栏 */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="筛选考试级别"
            style={{ width: 150 }}
            allowClear
            value={filterExamLevel}
            onChange={setFilterExamLevel}
          >
            <Option value="KET">KET</Option>
            <Option value="PET">PET</Option>
            <Option value="FCE">FCE</Option>
          </Select>
          
          <Select
            placeholder="筛选状态"
            style={{ width: 150 }}
            allowClear
            value={filterStatus}
            onChange={setFilterStatus}
          >
            <Option value={1}>上架</Option>
            <Option value={0}>下架</Option>
          </Select>

          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建套餐
          </Button>
        </Space>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={false}
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <span>共 {total} 个套餐</span>
          </Space>
        </div>
      </Card>

      {/* 创建/编辑/查看弹窗 */}
      <Modal
        title={
          modalMode === 'create' ? '新建套餐' : 
          modalMode === 'edit' ? '编辑套餐' : 
          '套餐详情'
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={modalMode === 'view' ? () => setModalVisible(false) : handleSubmit}
        width={800}
        okText={modalMode === 'view' ? '关闭' : '确定'}
        cancelText={modalMode === 'view' ? undefined : '取消'}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          disabled={modalMode === 'view'}
        >
          <Form.Item
            label="考试分类ID"
            name="exam_category_id"
            rules={[{ required: true, message: '请输入考试分类ID' }]}
            tooltip="必须是exam_category表中存在的ID"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如: 1" />
          </Form.Item>

          <Form.Item
            label="考试级别"
            name="exam_level"
            rules={[{ required: true, message: '请选择考试级别' }]}
          >
            <Select placeholder="选择考试级别">
              <Option value="KET">KET</Option>
              <Option value="PET">PET</Option>
              <Option value="FCE">FCE</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="套餐类型"
            name="plan_type"
            rules={[{ required: true, message: '请输入套餐类型' }]}
            tooltip="例如: monthly, quarterly, yearly, weekly"
          >
            <Input placeholder="例如: monthly" />
          </Form.Item>

          <Form.Item
            label="套餐名称"
            name="plan_name"
            rules={[{ required: true, message: '请输入套餐名称' }]}
          >
            <Input placeholder="例如: PET月卡" />
          </Form.Item>

          <Form.Item
            label="时长(天)"
            name="duration_days"
            rules={[{ required: true, message: '请输入时长' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如: 30" />
          </Form.Item>

          <Divider>价格设置（单位：分）</Divider>

          <Form.Item
            label="原价(分)"
            name="original_price"
            rules={[{ required: true, message: '请输入原价' }]}
            tooltip="1元 = 100分，例如: 4900 表示 49.00元"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如: 4900" />
          </Form.Item>

          <Form.Item
            label="售价(分)"
            name="sale_price"
            rules={[{ required: true, message: '请输入售价' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如: 4900" />
          </Form.Item>

          <Form.Item
            label="首减金额(分)"
            name="first_buy_discount"
            rules={[{ required: true, message: '请输入首减金额' }]}
            tooltip="首购优惠的减免金额"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如: 2410" />
          </Form.Item>

          <Form.Item
            label="首购价(分)"
            name="first_buy_price"
            rules={[{ required: true, message: '请输入首购价' }]}
            tooltip="首购价 = 原价 - 首减金额"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如: 2490" />
          </Form.Item>

          <Divider>其他设置</Divider>

          <Form.Item
            label="套餐说明"
            name="description"
            rules={[{ required: true, message: '请输入套餐说明' }]}
          >
            <TextArea rows={3} placeholder="例如: PET考试1个月无限练习" />
          </Form.Item>

          <Form.Item
            label="套餐特权(JSON)"
            name="features"
            tooltip="可选，JSON格式字符串"
          >
            <TextArea rows={2} placeholder='例如: {"unlimited_practice": true}' />
          </Form.Item>

          <Form.Item
            label="排序权重"
            name="sort"
            tooltip="数字越大越靠前"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如: 100" />
          </Form.Item>

          <Form.Item
            label="是否推荐"
            name="is_recommended"
            valuePropName="checked"
            getValueFromEvent={(checked) => (checked ? 1 : 0)}
            getValueProps={(value) => ({ checked: value === 1 })}
          >
            <Switch checkedChildren="推荐" unCheckedChildren="不推荐" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            valuePropName="checked"
            getValueFromEvent={(checked) => (checked ? 1 : 0)}
            getValueProps={(value) => ({ checked: value === 1 })}
          >
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
    </>
  );
};

export default VipPlanManagement;
