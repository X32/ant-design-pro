/**
 * 考试分类管理页面
 * 用于管理试卷的分类
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  message,
  Space,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  Card,
  Tooltip,
  Badge,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  ExamCategory,
  getExamCategories,
  createExamCategory,
  updateExamCategory,
  deleteExamCategory,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 考试分类管理页面组件
 */
const ExamCategoryManager: React.FC = () => {
  // 数据状态
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [onlyActive, setOnlyActive] = useState<boolean>(true);

  // 新建/编辑弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExamCategory | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  /**
   * 获取分类列表
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getExamCategories({
        only_active: onlyActive,
        page: pagination.current,
        page_size: pagination.pageSize,
      });

      if (response && response.success) {
        // 如果有搜索关键词，进行前端过滤
        let filteredData = response.data || [];
        if (searchKeyword.trim()) {
          const keyword = searchKeyword.toLowerCase();
          filteredData = filteredData.filter(
            (category: ExamCategory) =>
              category.name.toLowerCase().includes(keyword) ||
              (category.description && category.description.toLowerCase().includes(keyword))
          );
        }
        // 按 sort 字段降序排列（数字大的在前）
        filteredData.sort((a: ExamCategory, b: ExamCategory) => b.sort - a.sort);
        setCategories(filteredData);
        setTotal(response.total || filteredData.length);
      } else {
        setCategories([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
      message.error(error?.message || '获取分类列表失败');
      setCategories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [onlyActive, pagination, searchKeyword]);

  // 加载分类列表
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * 处理分页变化
   */
  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination({
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    });
  };

  /**
   * 刷新列表
   */
  const handleRefresh = () => {
    fetchCategories();
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchCategories();
  };

  /**
   * 重置筛选
   */
  const handleReset = () => {
    setSearchKeyword('');
    setOnlyActive(true);
    setPagination({ current: 1, pageSize: 10 });
  };

  /**
   * 打开新建弹窗
   */
  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      sort: 100,
      is_active: 1,
    });
    setModalVisible(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (category: ExamCategory) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || '',
      sort: category.sort,
      is_active: category.is_active,
    });
    setModalVisible(true);
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let response;
      if (editingCategory) {
        // 编辑模式
        response = await updateExamCategory(editingCategory.id, {
          name: values.name,
          description: values.description || '',
          sort: values.sort,
          is_active: values.is_active,
        });
      } else {
        // 新建模式
        response = await createExamCategory({
          name: values.name,
          description: values.description || '',
          sort: values.sort,
          is_active: values.is_active,
        });
      }

      if (response.success) {
        message.success(editingCategory ? '更新成功' : '创建成功');
        setModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
        fetchCategories();
      } else {
        throw new Error(response.message || (editingCategory ? '更新失败' : '创建失败'));
      }
    } catch (error: any) {
      console.error('提交失败:', error);
      message.error(error?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  /**
   * 删除分类
   */
  const handleDelete = async (categoryId: number) => {
    try {
      const response = await deleteExamCategory(categoryId);
      if (response.success) {
        message.success('删除成功');
        fetchCategories();
      } else {
        throw new Error(response.message || '删除失败');
      }
    } catch (error: any) {
      console.error('删除分类失败:', error);
      message.error(error?.message || '删除失败');
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ExamCategory> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <span className="category-name">{text}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      align: 'center',
      render: (sort: number) => <Tag color="blue">{sort}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      align: 'center',
      render: (isActive: number) => (
        <Badge
          status={isActive === 1 ? 'success' : 'default'}
          text={isActive === 1 ? '启用' : '禁用'}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      key: 'update_time',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
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
            title="确定要删除这个分类吗？"
            description="删除后将无法恢复"
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
    <div className="exam-category-page">
      <Card className="page-card">
        {/* 顶部操作栏 */}
        <div className="toolbar">
          <div className="toolbar-left">
            <Input
              placeholder="搜索分类名称或描述"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="状态"
              value={onlyActive}
              onChange={(value) => setOnlyActive(value)}
              style={{ width: 100 }}
            >
              <Option value={true}>启用</Option>
              <Option value={false}>全部</Option>
            </Select>
            <Button icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </div>
          <div className="toolbar-right">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建分类
            </Button>
          </div>
        </div>

        {/* 表格 */}
        <Table
          className="category-table"
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 个分类`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={
          <div className="modal-title">
            <AppstoreOutlined />
            <span>{editingCategory ? '编辑分类' : '新建分类'}</span>
          </div>
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
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
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '分类名称最多50个字符' },
            ]}
          >
            <Input placeholder="请输入分类名称，如 PET口语" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[
              { max: 500, message: '描述最多500个字符' },
            ]}
          >
            <TextArea
              placeholder="请输入分类描述"
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
            extra="数字越大排序越靠前"
          >
            <InputNumber
              min={0}
              max={9999}
              style={{ width: '100%' }}
              placeholder="请输入排序值"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamCategoryManager;
