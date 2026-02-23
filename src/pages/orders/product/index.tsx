/**
 * 商品管理列表页面
 * 管理金币套餐商品，支持增删改查和上下架操作
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Tag,
  message,
  Space,
  Modal,
  Card,
  Tooltip,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  Switch,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { Helmet } from '@umijs/max';
import dayjs from 'dayjs';
import {
  getAdminItems,
  createAdminItem,
  updateAdminItem,
  updateAdminItemStatus,
  deleteAdminItem,
  type ProductItem,
  type ProductFormData,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 商品管理列表页面组件
 */
const ProductList: React.FC = () => {
  // 数据状态
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新建商品');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  /**
   * 获取商品列表
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: { item_type?: string; status?: number } = {
        item_type: 'coin_package',
      };
      if (statusFilter !== undefined) {
        params.status = statusFilter;
      }

      const response = await getAdminItems(params);

      if (response && response.success) {
        setProducts(response.data || []);
        setTotal(response.total || 0);
      } else {
        setProducts([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取商品列表失败:', error);
      message.error(error?.message || '获取商品列表失败');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // 初始化加载
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * 刷新列表
   */
  const handleRefresh = () => {
    fetchProducts();
  };

  /**
   * 打开新建弹窗
   */
  const handleCreate = () => {
    setEditingProduct(null);
    setModalTitle('新建商品');
    form.resetFields();
    form.setFieldsValue({
      currency: 'CNY',
      status: 1,
    });
    setModalVisible(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setModalTitle('编辑商品');
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      coin_amount: product.coin_amount,
      price: product.price / 100, // 分转元
      currency: product.currency,
      status: product.status,
    });
    setModalVisible(true);
  };

  /**
   * 关闭弹窗
   */
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formData: ProductFormData = {
        name: values.name,
        description: values.description,
        coin_amount: values.coin_amount,
        price: Math.round(values.price * 100), // 元转分
        currency: values.currency || 'CNY',
        status: values.status,
      };

      let response;
      if (editingProduct) {
        response = await updateAdminItem(editingProduct.id, formData);
      } else {
        response = await createAdminItem(formData);
      }

      if (response.success) {
        message.success(editingProduct ? '更新成功' : '创建成功');
        handleModalCancel();
        fetchProducts();
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (error: any) {
      message.error(error?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 切换商品状态
   */
  const handleStatusChange = async (product: ProductItem, checked: boolean) => {
    try {
      const response = await updateAdminItemStatus(product.id, checked ? 1 : 0);
      if (response.success) {
        message.success(checked ? '商品已上架' : '商品已下架');
        fetchProducts();
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (error: any) {
      message.error(error?.message || '操作失败');
    }
  };

  /**
   * 删除商品
   */
  const handleDelete = async (productId: number) => {
    try {
      const response = await deleteAdminItem(productId);
      if (response.success) {
        message.success('删除成功');
        fetchProducts();
      } else {
        throw new Error(response.message || '删除失败');
      }
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ProductItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => (
        <Space>
          <GiftOutlined style={{ color: '#faad14' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '金币数量',
      dataIndex: 'coin_amount',
      key: 'coin_amount',
      width: 100,
      align: 'right',
      render: (amount: number) => (
        <span className="coin-amount">{amount}</span>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      render: (price: number) => (
        <span className="price">¥{(price / 100).toFixed(2)}</span>
      ),
    },
    {
      title: '单价(元/金币)',
      key: 'unit_price',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const unitPrice = record.price / 100 / record.coin_amount;
        return <span className="unit-price">¥{unitPrice.toFixed(4)}</span>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number, record) => (
        <Switch
          checked={status === 1}
          checkedChildren="上架"
          unCheckedChildren="下架"
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个商品吗？"
            description="删除后商品将被下架"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button
                type="text"
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
    <div className="product-list-container">
      <Helmet>
        <title>学习金币充值套餐 - SpeakCube口语练习</title>
        <meta 
          name="description" 
          content="SpeakCube学习金币充值，用于解锁口语练习题目。多种充值套餐可选，充值越多越优惠，助力孩子英语口语学习！" 
        />
        <meta 
          name="keywords" 
          content="学习金币,口语练习充值,英语学习充值,金币套餐,口语练习费用" 
        />
        <link rel="canonical" href="https://www.qtoplay.com/back/orders/product" />
      </Helmet>

      <div className="product-list-page">
      <Card className="page-card">
        {/* 操作栏 */}
        <div className="toolbar">
          <div className="toolbar-left">
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value={1}>上架中</Option>
              <Option value={0}>已下架</Option>
            </Select>
          </div>
          <div className="toolbar-right">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建商品
            </Button>
          </div>
        </div>

        {/* 表格 */}
        <Table
          className="product-table"
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 个商品`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        destroyOnClose
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[
              { required: true, message: '请输入商品名称' },
              { max: 100, message: '名称最长100个字符' },
            ]}
          >
            <Input placeholder="例如：100金币" />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
            rules={[{ max: 500, message: '描述最长500个字符' }]}
          >
            <TextArea
              placeholder="例如：新手优惠套餐"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="coin_amount"
            label="金币数量"
            rules={[
              { required: true, message: '请输入金币数量' },
              { type: 'number', min: 1, message: '金币数量必须大于0' },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="充值可获得的金币数量"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格（元）"
            rules={[
              { required: true, message: '请输入价格' },
              { type: 'number', min: 0.01, message: '价格必须大于0' },
            ]}
          >
            <InputNumber
              min={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="商品售价（单位：元）"
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="货币类型"
            initialValue="CNY"
          >
            <Select>
              <Option value="CNY">人民币 (CNY)</Option>
              <Option value="USD">美元 (USD)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
          >
            <Select>
              <Option value={1}>上架</Option>
              <Option value={0}>下架</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </div>
  );
};

export default ProductList;
