import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Input,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import {
  getMyArticles,
  deleteArticle,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Search } = Input;
const { Option } = Select;

/**
 * 文章状态配置
 */
const STATUS_CONFIG = {
  draft: { text: '草稿', color: 'default' },
  pending_review: { text: '待审核', color: 'orange' },
  approved: { text: '审核通过', color: 'blue' },
  rejected: { text: '已驳回', color: 'red' },
  published: { text: '已发布', color: 'success' },
};

/**
 * 文章类型配置
 */
const ARTICLE_TYPE_CONFIG = {
  study_guide: { text: '学习指南', color: '#FFD93D' },
  exam_tips: { text: '考试技巧', color: '#4ECDC4' },
  resource: { text: '学习资源', color: '#FF6B6B' },
};

/**
 * 用户文章管理页面
 */
const UserArticles: React.FC = () => {
  // 列表数据
  const [articles, setArticles] = useState<API.ArticleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 分页
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 筛选条件
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string | undefined>();

  /**
   * 获取我的文章列表
   */
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await getMyArticles({
        page: pagination.current,
        page_size: pagination.pageSize,
        keyword,
        status: status as any,
      });

      if (response.success && response.data) {
        setArticles(response.data.articles || []);
        setTotal(response.data.total || 0);
      }
    } catch (error: any) {
      console.error('获取文章列表失败:', error);
      message.error(error?.message || '获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初始化加载
   */
  useEffect(() => {
    fetchArticles();
  }, [pagination.current, pagination.pageSize, keyword, status]);

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    fetchArticles();
  };

  /**
   * 创建新文章
   */
  const handleCreate = () => {
    history.push('/articles/edit');
  };

  /**
   * 编辑文章
   */
  const handleEdit = (articleId: number) => {
    history.push(`/articles/edit/${articleId}`);
  };

  /**
   * 查看文章
   */
  const handleView = (articleId: number) => {
    history.push(`/articles/detail/${articleId}`);
  };

  /**
   * 删除文章
   */
  const handleDelete = async (articleId: number) => {
    try {
      const response = await deleteArticle(articleId);
      if (response.success) {
        message.success('删除成功');
        fetchArticles();
      }
    } catch (error: any) {
      console.error('删除文章失败:', error);
      message.error(error?.message || '删除文章失败');
    }
  };

  /**
   * 搜索关键词
   */
  const handleSearch = (value: string) => {
    setKeyword(value);
    setPagination({ current: 1, pageSize: pagination.pageSize });
  };

  /**
   * 状态筛选
   */
  const handleStatusChange = (value: string | undefined) => {
    setStatus(value);
    setPagination({ current: 1, pageSize: pagination.pageSize });
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<API.ArticleListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record) => (
        <Space direction="vertical" size={0}>
          <a onClick={() => handleView(record.id)}>{title}</a>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        return <Tag color={config?.color}>{config?.text || status}</Tag>;
      },
    },
    {
      title: '类型',
      dataIndex: 'article_type',
      key: 'article_type',
      width: 120,
      render: (type: string) => {
        const config = ARTICLE_TYPE_CONFIG[type as keyof typeof ARTICLE_TYPE_CONFIG];
        return <Tag color={config?.color}>{config?.text || type}</Tag>;
      },
    },
    {
      title: '浏览量',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 100,
      align: 'center',
    },
    {
      title: '点赞数',
      dataIndex: 'like_count',
      key: 'like_count',
      width: 100,
      align: 'center',
    },
    {
      title: '评论数',
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 100,
      align: 'center',
    },
    {
      title: '发布时间',
      dataIndex: 'published_at',
      key: 'published_at',
      width: 180,
      render: (time: string) => (time ? new Date(time).toLocaleString() : '-'),
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
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
    <div className="user-articles-page">
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>我的文章</span>
          </Space>
        }
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
              创建文章
            </Button>
          </Space>
        }
      >
        {/* 筛选栏 */}
        <div className="filter-bar">
          <Space size="middle" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <Search
              placeholder="搜索文章标题"
              allowClear
              enterButton="搜索"
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
            <Select
              placeholder="筛选状态"
              allowClear
              style={{ width: 150 }}
              onChange={handleStatusChange}
              value={status}
            >
              <Option value="draft">草稿</Option>
              <Option value="pending_review">待审核</Option>
              <Option value="approved">审核通过</Option>
              <Option value="rejected">已驳回</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Space>
        </div>

        {/* 文章列表 */}
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 篇文章`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize: pageSize || 10 });
            },
          }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
};

export default UserArticles;
