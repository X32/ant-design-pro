/**
 * 考试卷列表页面
 * 显示所有已创建的考试卷，支持编辑和删除操作
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
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import {
  ExamPaper,
  Category,
} from '../types';
import {
  getExamPapers,
  updateExamPaper,
  deleteExamPaper,
  getOralCategoriesTree,
  getPaperQuestions,
  getExamCategories,
  ExamCategory,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;

/**
 * 获取一级分类列表
 */
const getLevel1Categories = (categories: Category[]): Category[] => {
  return categories.filter(c => c.level === 1);
};

/**
 * 考试卷列表页面组件
 */
const ExamPaperList: React.FC = () => {
  // 数据状态
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [onlyActive, setOnlyActive] = useState<boolean>(true);

  // 分类数据
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 考试分类数据
  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);

  // 编辑弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPaper, setEditingPaper] = useState<ExamPaper | null>(null);
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailPaper, setDetailPaper] = useState<ExamPaper | null>(null);
  const [paperQuestions, setPaperQuestions] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  /**
   * 获取分类列表
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getOralCategoriesTree();
      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
    }
  }, []);

  /**
   * 获取考试分类列表
   */
  const fetchExamCategories = useCallback(async () => {
    try {
      const response = await getExamCategories({ only_active: true });
      if (response && response.success && Array.isArray(response.data)) {
        // 按 sort 字段降序排列
        const sortedCategories = response.data.sort((a, b) => b.sort - a.sort);
        setExamCategories(sortedCategories);
      }
    } catch (error: any) {
      console.error('获取考试分类列表失败:', error);
    }
  }, []);

  /**
   * 获取试卷列表
   */
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getExamPapers({
        apply_category_id: selectedCategoryId,
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
            (paper: ExamPaper) =>
              paper.paper_name.toLowerCase().includes(keyword) ||
              paper.paper_code.toLowerCase().includes(keyword)
          );
        }
        setPapers(filteredData);
        setTotal(response.total || filteredData.length);
      } else {
        setPapers([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取试卷列表失败:', error);
      message.error(error?.message || '获取试卷列表失败');
      setPapers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, onlyActive, pagination, searchKeyword]);

  // 初始化加载
  useEffect(() => {
    fetchCategories();
    fetchExamCategories();
  }, [fetchCategories, fetchExamCategories]);

  // 加载试卷列表
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

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
    fetchPapers();
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchPapers();
  };

  /**
   * 重置筛选
   */
  const handleReset = () => {
    setSearchKeyword('');
    setSelectedCategoryId(undefined);
    setOnlyActive(true);
    setPagination({ current: 1, pageSize: 10 });
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (paper: ExamPaper) => {
    setEditingPaper(paper);
    editForm.setFieldsValue({
      paper_name: paper.paper_name,
      total_score: paper.total_score,
      apply_category_id: paper.apply_category_id || undefined,
      exam_category_id: (paper as any).exam_category_id || undefined,
      is_active: paper.is_active,
    });
    setEditModalVisible(true);
  };

  /**
   * 提交编辑
   */
  const handleEditSubmit = async () => {
    if (!editingPaper) return;

    try {
      const values = await editForm.validateFields();
      setSubmitting(true);

      const response = await updateExamPaper(editingPaper.id, {
        paper_name: values.paper_name,
        total_score: values.total_score,
        apply_category_id: values.apply_category_id || 0,
        exam_category_id: values.exam_category_id || 0,
        is_active: values.is_active,
      });

      if (response.success) {
        message.success('更新成功');
        setEditModalVisible(false);
        setEditingPaper(null);
        editForm.resetFields();
        fetchPapers();
      } else {
        throw new Error(response.message || '更新失败');
      }
    } catch (error: any) {
      console.error('更新试卷失败:', error);
      message.error(error?.message || '更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 取消编辑
   */
  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingPaper(null);
    editForm.resetFields();
  };

  /**
   * 删除试卷
   */
  const handleDelete = async (paperId: number) => {
    try {
      const response = await deleteExamPaper(paperId);
      if (response.success) {
        message.success('删除成功');
        fetchPapers();
      } else {
        throw new Error(response.message || '删除失败');
      }
    } catch (error: any) {
      console.error('删除试卷失败:', error);
      message.error(error?.message || '删除失败');
    }
  };

  /**
   * 查看详情
   */
  const handleViewDetail = async (paper: ExamPaper) => {
    setDetailPaper(paper);
    setDetailModalVisible(true);
    setDetailLoading(true);

    try {
      const response = await getPaperQuestions(paper.id);
      if (response.success) {
        // 按 sort 字段升序排列
        const sortedQuestions = (response.data || []).sort((a: any, b: any) => a.sort - b.sort);
        setPaperQuestions(sortedQuestions);
      } else {
        setPaperQuestions([]);
      }
    } catch (error: any) {
      console.error('获取试卷题目失败:', error);
      setPaperQuestions([]);
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 关闭详情弹窗
   */
  const handleDetailClose = () => {
    setDetailModalVisible(false);
    setDetailPaper(null);
    setPaperQuestions([]);
  };

  /**
   * 跳转到组卷页面
   */
  const handleGoToBuilder = () => {
    history.push('/exam/builder');
  };

  /**
   * 获取分类名称
   */
  const getCategoryName = (categoryId: number): string => {
    const category = getLevel1Categories(categories).find(c => c.id === categoryId);
    return category ? category.name : '-';
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ExamPaper> = [
    {
      title: '试卷编号',
      dataIndex: 'paper_code',
      key: 'paper_code',
      width: 150,
      render: (text: string) => <span className="paper-code">{text}</span>,
    },
    {
      title: '试卷名称',
      dataIndex: 'paper_name',
      key: 'paper_name',
      ellipsis: true,
    },
    {
      title: '总分',
      dataIndex: 'total_score',
      key: 'total_score',
      width: 80,
      align: 'center',
      render: (score: number) => <span className="score">{score}分</span>,
    },
    {
      title: '适用分类',
      dataIndex: 'apply_category_id',
      key: 'apply_category_id',
      width: 120,
      render: (categoryId: number) => (
        categoryId ? <Tag color="blue">{getCategoryName(categoryId)}</Tag> : '-'
      ),
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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这份试卷吗？"
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
    <div className="exam-list-page">
      <Card className="page-card">
        {/* 顶部操作栏 */}
        <div className="toolbar">
          <div className="toolbar-left">
            <Input
              placeholder="搜索试卷名称或编号"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="适用分类"
              value={selectedCategoryId}
              onChange={(value) => setSelectedCategoryId(value)}
              style={{ width: 150 }}
              allowClear
            >
              {getLevel1Categories(categories).map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleGoToBuilder}>
              新建试卷
            </Button>
          </div>
        </div>

        {/* 表格 */}
        <Table
          className="paper-table"
          columns={columns}
          dataSource={papers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 份试卷`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑试卷"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        confirmLoading={submitting}
        destroyOnClose
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="paper_name"
            label="试卷名称"
            rules={[{ required: true, message: '请输入试卷名称' }]}
          >
            <Input placeholder="请输入试卷名称" />
          </Form.Item>

          <Form.Item
            name="total_score"
            label="总分"
            rules={[{ required: true, message: '请输入总分' }]}
          >
            <InputNumber
              min={0}
              max={1000}
              style={{ width: '100%' }}
              placeholder="请输入总分"
            />
          </Form.Item>

          <Form.Item
            name="apply_category_id"
            label="适用分类"
          >
            <Select placeholder="选择适用分类" allowClear>
              {getLevel1Categories(categories).map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="exam_category_id"
            label="考试分类"
          >
            <Select placeholder="选择考试分类" allowClear>
              {examCategories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
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

      {/* 详情弹窗 */}
      <Modal
        title={
          <div className="detail-modal-title">
            <FileTextOutlined />
            <span>试卷详情</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleDetailClose}
        footer={[
          <Button key="close" onClick={handleDetailClose}>
            关闭
          </Button>,
        ]}
        width={700}
        className="paper-detail-modal"
      >
        {detailPaper && (
          <div className="paper-detail">
            <div className="detail-section">
              <div className="section-title">基本信息</div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">试卷编号：</span>
                  <span className="value">{detailPaper.paper_code}</span>
                </div>
                <div className="detail-item">
                  <span className="label">试卷名称：</span>
                  <span className="value">{detailPaper.paper_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">总分：</span>
                  <span className="value">{detailPaper.total_score}分</span>
                </div>
                <div className="detail-item">
                  <span className="label">适用分类：</span>
                  <span className="value">
                    {detailPaper.apply_category_id ? getCategoryName(detailPaper.apply_category_id) : '-'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">状态：</span>
                  <Badge
                    status={detailPaper.is_active === 1 ? 'success' : 'default'}
                    text={detailPaper.is_active === 1 ? '启用' : '禁用'}
                  />
                </div>
                <div className="detail-item">
                  <span className="label">创建时间：</span>
                  <span className="value">
                    {detailPaper.create_time ? new Date(detailPaper.create_time).toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <div className="section-title">
                题目列表
                <Tag color="blue" style={{ marginLeft: 8 }}>{paperQuestions.length} 题</Tag>
              </div>
              {detailLoading ? (
                <div className="loading-container">加载中...</div>
              ) : paperQuestions.length > 0 ? (
                <div className="question-list">
                  {paperQuestions.map((q, index) => (
                    <div key={q.id} className="question-item">
                      <div className="question-index">{index + 1}</div>
                      <div className="question-content">
                        <div className="question-title">{q.exercise?.title || '未知题目'}</div>
                        <div className="question-meta">
                          <span>分值：{q.question_score}分</span>
                          {q.exercise?.difficulty && (
                            <Tag color={
                              q.exercise.difficulty <= 2 ? 'green' :
                              q.exercise.difficulty <= 3 ? 'blue' : 'orange'
                            } style={{ fontSize: 10 }}>
                              难度 {q.exercise.difficulty}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-questions">暂无题目</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamPaperList;
