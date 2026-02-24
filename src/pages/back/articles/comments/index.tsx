import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Input,
  Select,
  Space,
  message,
  Modal,
  Popconfirm,
  Tag,
  Form,
  Input as AntInput,
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getPendingComments,
  approveComment,
  rejectComment,
  deleteComment,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { TextArea } = AntInput;

const CommentsReviewPage: React.FC = () => {
  // Data state
  const [comments, setComments] = useState<API.CommentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filter and pagination state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  // Modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewComment, setViewComment] = useState<API.CommentListItem | null>(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [reviewingComment, setReviewingComment] = useState<API.CommentListItem | null>(null);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  // Comment status config
  const STATUS_CONFIG = {
    pending: { color: 'warning', text: '待审核' },
    approved: { color: 'success', text: '已通过' },
    rejected: { color: 'error', text: '已驳回' },
    deleted: { color: 'default', text: '已删除' },
  };

  // Fetch comments list
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPendingComments({
        page: pagination.current,
        page_size: pagination.pageSize,
        article_id: selectedArticleId || undefined,
      });

      if (response?.success && response?.data) {
        let filteredComments = response.data.comments || [];

        // 如果选择了状态，在客户端进行筛选
        if (selectedStatus) {
          filteredComments = filteredComments.filter(comment => comment.status === selectedStatus);
        }

        setComments(filteredComments);
        setTotal(filteredComments.length);
      } else {
        setComments(response.data.comments || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('获取待审核评论列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedArticleId, selectedStatus, pagination]);

  // View comment detail
  const handleView = (comment: API.CommentListItem) => {
    setViewComment(comment);
    setDetailModalVisible(true);
  };

  // Approve comment modal
  const openApproveModal = (comment: API.CommentListItem) => {
    setReviewingComment(comment);
    setApproveModalVisible(true);
    approveForm.resetFields();
  };

  const handleApproveSubmit = async () => {
    if (!reviewingComment) return;

    const values = await approveForm.validateFields();

    try {
      await approveComment(reviewingComment.id, {
        comment: values.comment,
      });

      message.success('审核通过成功');
      setApproveModalVisible(false);
      approveForm.resetFields();
      setReviewingComment(null);

      // Refresh comments list
      fetchComments();
    } catch (error) {
      console.error('Failed to approve comment:', error);
      message.error('审核通过失败，请重试');
    }
  };

  // Reject comment modal
  const openRejectModal = (comment: API.CommentListItem) => {
    setReviewingComment(comment);
    setRejectModalVisible(true);
    rejectForm.setFieldsValue({
      article_id: comment.article_id,
    });
  };

  const handleRejectSubmit = async () => {
    if (!reviewingComment) return;

    const values = await rejectForm.validateFields();

    try {
      await rejectComment(reviewingComment.id, {
        comment: values.comment,
        article_id: comment.article_id,
      });

      message.success('驳回成功');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      setReviewingComment(null);

      // Refresh comments list
      fetchComments();
    } catch (error) {
      console.error('Failed to reject comment:', error);
      message.error('驳回失败，请重试');
    }
  };

  // Delete comment
  const handleDelete = async (comment: API.CommentListItem) => {
    try {
      await deleteComment(comment.id);
      message.success('删除成功');
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      message.error('删除失败，请重试');
    }
  };

  // Refresh list
  const handleRefresh = () => {
    setPagination({ ...pagination, current: 1 });
    fetchComments();
  };

  // Reset filters
  const handleReset = () => {
    setSearchKeyword('');
    setSelectedArticleId(undefined);
    setSelectedStatus(undefined);
    setPagination({ ...pagination, current: 1 });
  };

  // Table columns definition
  const columns: ProColumns<API.CommentListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '文章ID',
      dataIndex: 'article_id',
      width: 90,
    ellipsis: true,
    render: (text) => text,
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      width: 300,
      ellipsis: true,
      render: (text) => {
        const content = text;
        return content.length > 100
          ? content.substring(0, 100) + '...'
          : content;
      },
    },
    {
      title: '评论用户',
      dataIndex: ['user', 'username'],
      width: 120,
      render: (_, record) => (
        <Space>
          {record.user?.avatar && (
            <img
              src={record.user.avatar}
              alt={record.user.username}
              style={{ width: 24, height: 24, borderRadius: 12 }}
            />
          )}
          <span>{record.user?.username}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '点赞数/回复数',
      dataIndex: 'like_count',
      width: 120,
      render: (_, record) => (
        <Space split="|">
          <span>👁 {record.like_count}</span>
          <span>💬 {record.reply_count}</span>
        </Space>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      width: 160,
      render: (text) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            style={{ color: '#52c41a' }}
            onClick={() => openApproveModal(record)}
          >
            通过
          </Button>
          <Button
            type="text"
            icon={<CloseCircleOutlined />}
            style={{ color: '#ff4d4f' }}
            onClick={() => openRejectModal(record)}
          >
            驳回
          </Button>
          <Popconfirm
            title="确认删除该评论？"
            onConfirm={() => handleDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Initialize loading
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <PageContainer className="comments-review-page">
      {/* Filter bar */}
      <div className="filter-bar">
        <Space size="middle">
          <Input
            placeholder="搜索评论内容..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => setPagination({ ...pagination, current: 1 })}
            allowClear
            style={{ width: 250 }}
          />
          <Select
            placeholder="筛选文章（可选）"
            value={selectedArticleId}
            onChange={(value) => setSelectedArticleId(value)}
            allowClear
            style={{ width: 150 }}
          >
            <Option value={undefined}>全部文章</Option>
          </Select>
          <Select
            placeholder="选择状态"
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已驳回</Option>
            <Option value="deleted">已删除</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>

      {/* Comments table */}
      <ProTable<API.CommentListItem>
        columns={columns}
        dataSource={comments}
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
        scroll={{ x: 1200 }}
      />

      {/* Comment detail modal */}
      <Modal
        title="评论详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
        style={{ top: 20 }}
      >
        {viewComment && (
          <div className="comment-detail">
            <div className="detail-header">
              <Space>
                <span className="detail-user">
                  {viewComment.user?.avatar && (
                    <img
                      src={viewComment.user?.avatar}
                      alt={viewComment.user?.username}
                      style={{ width: 32, height: 32, borderRadius: 12 }}
                    />
                  )}
                  <span>{viewComment.user?.username}</span>
                </span>
                <Tag color="blue">{new Date(viewComment.created_at).toLocaleString('zh-CN')}</Tag>
              </Space>
            </div>
            <p className="detail-content">{viewComment.content}</p>
            <div className="detail-meta">
              <span>点赞数: {viewComment.like_count}</span>
              <span>回复数: {viewComment.reply_count}</span>
            </div>
            {viewComment.parent && (
              <div className="reply-section">
                <div className="reply-header">
                  <span>回复人: {viewComment.parent.user?.username}</span>
                  <Tag>回复时间: {new Date(viewComment.parent.created_at).toLocaleString('zh-CN')}</Tag>
                </div>
                <p className="reply-content">{viewComment.parent.content}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve comment modal */}
      <Modal
        title="审核通过评论"
        open={approveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={() => setApproveModalVisible(false)}
        width={500}
        okText="通过"
      >
        {reviewingComment && (
          <div className="review-modal-content">
            <p className="review-comment-title">评论内容</p>
            <p className="review-comment-text">{reviewingComment.content}</p>
            <p className="review-comment-meta">
              评论用户: {reviewingComment.user?.username}
              <br />
              提交时间: {new Date(reviewingComment.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
        )}
      </Modal>

      {/* Reject comment modal */}
      <Modal
        title="驳回评论"
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalVisible(false)}
        width={500}
        okText="确认"
        cancelText="取消"
      >
        {reviewingComment && (
          <div className="review-modal-content">
            <p className="review-comment-title">评论内容</p>
            <p className="review-comment-text">{reviewingComment.content}</p>
            <Form form={rejectForm} layout="vertical">
              <Form.Item name="comment" label="驳回原因" rules={[{ required: true, message: '请输入驳回原因' }]}>
                <TextArea
                  rows={4}
                  placeholder="请详细说明驳回原因..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default CommentsReviewPage;
