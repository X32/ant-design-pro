import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Input,
  Select,
  Space,
  message,
  Modal,
  Form,
  Tag,
  Popconfirm,
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  getArticles,
  getArticleDetail,
  approveArticle,
  rejectArticle,
  requestArticleRevision,
  archiveArticle,
  publishArticle,
  getArticleCategories,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

const ArticleReviewPage: React.FC = () => {
  // 数据状态
  const [articles, setArticles] = useState<API.ArticleListItem[]>([]);
  const [categories, setCategories] = useState<API.ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 筛选和分页状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  // 模态框状态
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewArticle, setViewArticle] = useState<API.ArticleDetail | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewType, setReviewType] = useState<'approve' | 'reject' | 'revision'>('approve');
  const [reviewingArticle, setReviewingArticle] = useState<API.ArticleListItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm] = Form.useForm();

  // 文章类型配置
  const ARTICLE_TYPES = {
    study_guide: { label: '学习指南', color: '#FFD93D' },
    exam_tips: { label: '考试技巧', color: '#4ECDC4' },
    resource: { label: '学习资源', color: '#FF6B6B' },
  };

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getArticleCategories();
      if (response?.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  }, []);

  // 获取文章列表
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getArticles({
        page: pagination.current,
        page_size: pagination.pageSize,
        keyword: searchKeyword || undefined,
        category_id: selectedCategoryId,
        status: selectedStatus,
      });

      if (response?.success && response?.data) {
        setArticles(response.data.articles || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      message.error('获取文章列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedCategoryId, selectedStatus, pagination]);

  // 查看文章详情
  const handleView = async (record: API.ArticleListItem) => {
    try {
      setLoading(true);
      const response = await getArticleDetail(record.id);
      if (response?.success && response?.data) {
        setViewArticle(response.data.article);
        setViewModalVisible(true);
      } else {
        message.error('获取文章详情失败');
      }
    } catch (error) {
      console.error('获取文章详情失败:', error);
      message.error('获取文章详情失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 打开审核模态框
  const openReviewModal = (record: API.ArticleListItem, type: 'approve' | 'reject' | 'revision') => {
    setReviewingArticle(record);
    setReviewType(type);
    setReviewModalVisible(true);
    reviewForm.resetFields();
  };

  // 提交审核
  const handleReviewSubmit = async () => {
    if (!reviewingArticle) return;

    const values = await reviewForm.validateFields();
    setSubmitting(true);

    try {
      if (reviewType === 'approve') {
        await approveArticle(reviewingArticle.id, {
          comment: values.comment,
          publish_immediately: values.publish_immediately || false,
        });
        message.success('审核通过成功');
      } else if (reviewType === 'reject') {
        await rejectArticle(reviewingArticle.id, {
          comment: values.comment,
        });
        message.success('驳回成功');
      } else if (reviewType === 'revision') {
        await requestArticleRevision(reviewingArticle.id, {
          comment: values.comment,
        });
        message.success('请求修改成功');
      }

      setReviewModalVisible(false);
      reviewForm.resetFields();
      setReviewingArticle(null);

      // 刷新列表
      fetchArticles();
    } catch (error) {
      console.error('审核操作失败:', error);
      message.error('审核操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 归档文章
  const handleArchive = async (record: API.ArticleListItem) => {
    try {
      await archiveArticle(record.id);
      message.success('归档成功');
      fetchArticles();
    } catch (error) {
      console.error('归档失败:', error);
      message.error('归档失败，请重试');
    }
  };

  // 发布文章
  const handlePublish = async (record: API.ArticleListItem) => {
    try {
      await publishArticle(record.id);
      message.success('文章发布成功');
      fetchArticles();
    } catch (error) {
      console.error('发布失败:', error);
      message.error('发布失败，请重试');
    }
  };

  // 刷新列表
  const handleRefresh = () => {
    setPagination({ ...pagination, current: 1 });
  };

  // 重置筛选
  const handleReset = () => {
    setSearchKeyword('');
    setSelectedCategoryId(undefined);
    setSelectedStatus(undefined);
    setPagination({ ...pagination, current: 1 });
  };

  // 表格列定义
  const columns: ProColumns<API.ArticleListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '文章标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: ['author', 'username'],
      width: 120,
    },
    {
      title: '分类',
      dataIndex: ['categories', 0, 'name'],
      width: 120,
    },
    {
      title: '文章类型',
      dataIndex: 'article_type',
      width: 120,
      render: (text) => (
        <Tag color={ARTICLE_TYPES[text as keyof typeof ARTICLE_TYPES]?.color}>
          {ARTICLE_TYPES[text as keyof typeof ARTICLE_TYPES]?.label}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          pending_review: { color: 'warning', text: '待审核' },
          approved: { color: 'success', text: '已通过' },
          rejected: { color: 'error', text: '已驳回' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {/* 已通过状态的文章显示发布按钮 */}
          {record.status === 'approved' && (
            <Popconfirm
              title="确认发布该文章？"
              onConfirm={() => handlePublish(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="text"
                icon={<SendOutlined />}
                style={{ color: '#52c41a' }}
              >
                发布
              </Button>
            </Popconfirm>
          )}
          {/* 待审核状态的文章显示审核操作按钮 */}
          {record.status === 'pending_review' && (
            <>
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => openReviewModal(record, 'approve')}
              >
                通过
              </Button>
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                style={{ color: '#ff4d4f' }}
                onClick={() => openReviewModal(record, 'reject')}
              >
                驳回
              </Button>
              <Button
                type="text"
                style={{ color: '#faad14' }}
                onClick={() => openReviewModal(record, 'revision')}
              >
                请求修改
              </Button>
            </>
          )}
          <Popconfirm
            title="确认归档该文章？"
            onConfirm={() => handleArchive(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="text" danger>
              归档
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 初始化加载
  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [fetchCategories, fetchArticles]);

  return (
    <PageContainer className="article-review-page">
      {/* 筛选栏 */}
      <div className="filter-bar">
        <Space size="middle">
          <Input
            placeholder="搜索文章标题..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => setPagination({ ...pagination, current: 1 })}
            allowClear
            style={{ width: 250 }}
          />
          <Select
            placeholder="选择分类"
            value={selectedCategoryId}
            onChange={(value) => setSelectedCategoryId(value)}
            allowClear
            style={{ width: 150 }}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="pending_review">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已驳回</Option>
            <Option value="published">已发布</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>

      {/* 文章表格 */}
      <ProTable<API.ArticleListItem>
        columns={columns}
        dataSource={articles}
        loading={loading}
        rowKey="id"
        search={false}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize: pageSize || 20 }),
        }}
        scroll={{ x: 1500 }}
      />

      {/* 查看详情模态框 */}
      <Modal
        title="文章详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {viewArticle && (
          <div className="article-preview">
            <div className="preview-header">
              <h3>{viewArticle.title}</h3>
              <Space>
                <Tag color="blue">{viewArticle.author?.username}</Tag>
                <Tag color={ARTICLE_TYPES[viewArticle.article_type as keyof typeof ARTICLE_TYPES]?.color}>
                  {ARTICLE_TYPES[viewArticle.article_type as keyof typeof ARTICLE_TYPES]?.label}
                </Tag>
              </Space>
            </div>
            <div className="preview-meta">
              <p><strong>摘要：</strong>{viewArticle.summary}</p>
              {viewArticle.keywords && <p><strong>关键词：</strong>{viewArticle.keywords}</p>}
              <p><strong>提交时间：</strong>{new Date(viewArticle.created_at).toLocaleString('zh-CN')}</p>
            </div>
            <div className="preview-content">
              {viewArticle.blocks.map((block, index) => (
                <div key={index} className="preview-block">
                  {block.block_type === 'text' && (
                    <p>{block.content}</p>
                  )}
                  {block.block_type === 'image' && (
                    <img src={block.media_url} alt={block.media_alt || ''} style={{ maxWidth: '100%', borderRadius: 8 }} />
                  )}
                  {block.block_type === 'code' && (
                    <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, overflow: 'auto' }}>
                      <code>{block.content}</code>
                    </pre>
                  )}
                  {block.block_type === 'quote' && (
                    <blockquote style={{ borderLeft: '4px solid #4ECDC4', paddingLeft: 16, fontStyle: 'italic' }}>
                      {block.content}
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 审核模态框 */}
      <Modal
        title={
          reviewType === 'approve'
            ? '审核通过'
            : reviewType === 'reject'
            ? '驳回文章'
            : '请求修改'
        }
        open={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        confirmLoading={submitting}
        okText={reviewType === 'approve' ? '通过' : reviewType === 'reject' ? '驳回' : '请求修改'}
        width={600}
      >
        {reviewingArticle && (
          <div className="review-modal-content">
            <p className="review-article-title">《{reviewingArticle.title}》</p>
            <Form form={reviewForm} layout="vertical">
              <Form.Item
                name="comment"
                label={
                  reviewType === 'approve'
                    ? '审核意见（选填）'
                    : reviewType === 'reject'
                    ? '驳回原因（必填）'
                    : '修改意见（必填）'
                }
                rules={reviewType !== 'approve' ? [{ required: true, message: '请输入原因' }] : []}
              >
                <TextArea
                  rows={6}
                  placeholder={
                    reviewType === 'approve'
                      ? '请输入审核意见...'
                      : reviewType === 'reject'
                      ? '请详细说明驳回原因...'
                      : '请详细说明需要修改的地方...'
                  }
                />
              </Form.Item>
              {reviewType === 'approve' && (
                <Form.Item name="publish_immediately" valuePropName="checked" initialValue={false}>
                  <span style={{ color: '#52c41a' }}>立即发布该文章</span>
                </Form.Item>
              )}
            </Form>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ArticleReviewPage;
