import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Radio,
  Select,
  Space,
  Tag,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload';
import type { RcFile } from 'antd/es/upload/interface';
import React, { useCallback, useEffect, useState } from 'react';
import {
  adminUpdateArticle,
  approveArticle,
  archiveArticle,
  getArticleCategories,
  getArticleDetail,
  getArticles,
  getArticleTags,
  publishArticle,
  rejectArticle,
  requestArticleRevision,
  uploadFile,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

const ArticleReviewPage: React.FC = () => {
  // 数据状态
  const [articles, setArticles] = useState<API.ArticleListItem[]>([]);
  const [categories, setCategories] = useState<API.ArticleCategory[]>([]);
  const [tags, setTags] = useState<API.ArticleTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 筛选和分页状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined,
  );
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  // 模态框状态
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewArticle, setViewArticle] = useState<API.ArticleDetail | null>(
    null,
  );
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewType, setReviewType] = useState<
    'approve' | 'reject' | 'revision'
  >('approve');
  const [reviewingArticle, setReviewingArticle] =
    useState<API.ArticleListItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm] = Form.useForm();

  // 编辑模态框状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] =
    useState<API.ArticleListItem | null>(null);
  const [editForm] = Form.useForm();
  const [editBlocks, setEditBlocks] = useState<API.ContentBlock[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // 图片上传状态
  const [imageUploadLoading, setImageUploadLoading] = useState<{
    [key: number]: boolean;
  }>({});
  const [imageInputModes, setImageInputModes] = useState<{
    [key: number]: 'upload' | 'link';
  }>({});
  const [imageFileLists, setImageFileLists] = useState<{
    [key: number]: UploadFile[];
  }>({});

  // 封面图片上传状态
  const [coverImageInputMode, setCoverImageInputMode] = useState<
    'upload' | 'link'
  >('upload');
  const [coverImageFileList, setCoverImageFileList] = useState<UploadFile[]>(
    [],
  );
  const [coverImageLoading, setCoverImageLoading] = useState(false);

  // 文章类型配置
  const ARTICLE_TYPES = {
    study_guide: { label: '学习指南', color: '#FFD93D' },
    exam_tips: { label: '考试技巧', color: '#4ECDC4' },
    resource: { label: '学习资源', color: '#FF6B6B' },
  };

  // 内容块类型配置
  const BLOCK_TYPES = [
    { value: 'text', label: '文本段落', icon: '📝' },
    { value: 'image', label: '图片', icon: '🖼️' },
    { value: 'video', label: '视频', icon: '🎬' },
    { value: 'code', label: '代码块', icon: '💻' },
    { value: 'quote', label: '引用', icon: '💬' },
    { value: 'list', label: '列表', icon: '📋' },
    { value: 'divider', label: '分隔线', icon: '➖' },
  ];

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

  // 获取标签列表
  const fetchTags = useCallback(async () => {
    try {
      const response = await getArticleTags();
      if (response?.success && Array.isArray(response.data)) {
        setTags(response.data);
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
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
  const openReviewModal = (
    record: API.ArticleListItem,
    type: 'approve' | 'reject' | 'revision',
  ) => {
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

  // 打开编辑模态框
  const handleOpenEdit = async (record: API.ArticleListItem) => {
    try {
      setLoading(true);
      const response = await getArticleDetail(record.id);
      if (response?.success && response?.data) {
        const article = response.data.article;
        setEditingArticle(record);
        editForm.setFieldsValue({
          title: article.title,
          summary: article.summary,
          cover_image: article.cover_image,
          article_type: article.article_type,
          category_ids: article.categories.map((c) => c.id),
          tag_ids: article.tags.map((t) => t.id),
          keywords: article.keywords,
          meta_description: article.meta_description,
        });
        setEditBlocks(article.blocks || []);

        // 初始化图片内容块的状态
        const initialImageModes: { [key: number]: 'upload' | 'link' } = {};
        const initialImageFileLists: { [key: number]: UploadFile[] } = {};
        const initialImageUploadLoading: { [key: number]: boolean } = {};

        article.blocks?.forEach((block, index) => {
          if (block.block_type === 'image' && block.media_url) {
            const isExternalLink =
              block.media_url.startsWith('http') &&
              !block.media_url.includes(window.location.host);
            initialImageModes[index] = isExternalLink ? 'link' : 'upload';

            if (!isExternalLink) {
              initialImageFileLists[index] = [
                {
                  uid: '-1',
                  name: '已上传图片',
                  status: 'done',
                  url: block.media_url,
                },
              ];
            }
            initialImageUploadLoading[index] = false;
          }
        });

        setImageInputModes(initialImageModes);
        setImageFileLists(initialImageFileLists);
        setImageUploadLoading(initialImageUploadLoading);

        // 初始化封面图片状态
        if (article.cover_image) {
          const isExternalLink =
            article.cover_image.startsWith('http') &&
            !article.cover_image.includes(window.location.host);
          setCoverImageInputMode(isExternalLink ? 'link' : 'upload');

          if (!isExternalLink) {
            setCoverImageFileList([
              {
                uid: '-1',
                name: '已上传封面',
                status: 'done',
                url: article.cover_image,
              },
            ]);
          }
        } else {
          setCoverImageInputMode('upload');
          setCoverImageFileList([]);
        }

        setEditModalVisible(true);
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

  // 关闭编辑模态框
  const handleCloseEdit = () => {
    setEditModalVisible(false);
    setEditingArticle(null);
    editForm.resetFields();
    setEditBlocks([]);
    setImageInputModes({});
    setImageFileLists({});
    setImageUploadLoading({});
    setCoverImageInputMode('upload');
    setCoverImageFileList([]);
  };

  // 添加内容块
  const handleAddBlock = (blockType: API.BlockType) => {
    const newBlock: API.ContentBlock = {
      block_type: blockType,
      sort_order: editBlocks.length + 1,
      content: blockType === 'text' ? '' : null,
      media_url: blockType === 'image' || blockType === 'video' ? '' : null,
      media_alt: null,
      caption: null,
      code_language: 'javascript',
      list_type: 'unordered',
    };
    setEditBlocks([...editBlocks, newBlock]);
  };

  // 更新内容块
  const handleUpdateBlock = (
    index: number,
    field: keyof API.ContentBlock,
    value: any,
  ) => {
    const updatedBlocks = [...editBlocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      [field]: value,
    };
    setEditBlocks(updatedBlocks);
  };

  // 删除内容块
  const handleDeleteBlock = (index: number) => {
    const updatedBlocks = editBlocks.filter((_, i) => i !== index);
    updatedBlocks.forEach((block, i) => {
      block.sort_order = i + 1;
    });
    setEditBlocks(updatedBlocks);
  };

  // 移动内容块
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const updatedBlocks = [...editBlocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= updatedBlocks.length) return;

    [updatedBlocks[index], updatedBlocks[newIndex]] = [
      updatedBlocks[newIndex],
      updatedBlocks[index],
    ];

    updatedBlocks.forEach((block, i) => {
      block.sort_order = i + 1;
    });

    setEditBlocks(updatedBlocks);
  };

  // 图片上传前校验
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    return true;
  };

  // 图片上传处理
  const handleImageUpload = async (index: number, options: any) => {
    const { file, onSuccess, onError } = options;
    setImageUploadLoading((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await uploadFile(file as File);
      if (response.success && (response.url || response.file_path)) {
        const url = response.url || response.file_path || '';
        handleUpdateBlock(index, 'media_url', url);
        setImageFileLists((prev) => ({
          ...prev,
          [index]: [
            {
              uid: '-1',
              name: (file as File).name,
              status: 'done',
              url: url,
            },
          ],
        }));
        onSuccess?.(response, file);
        message.success('图片上传成功');
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error: any) {
      console.error('图片上传失败:', error);
      message.error(error?.message || '图片上传失败');
      onError?.(error);
    } finally {
      setImageUploadLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    handleUpdateBlock(index, 'media_url', '');
    setImageFileLists((prev) => ({ ...prev, [index]: [] }));
  };

  // 切换图片输入模式
  const handleToggleImageMode = (index: number, mode: 'upload' | 'link') => {
    setImageInputModes((prev) => ({ ...prev, [index]: mode }));
    if (mode === 'upload') {
      const currentUrl = editBlocks[index]?.media_url;
      if (currentUrl) {
        setImageFileLists((prev) => ({
          ...prev,
          [index]: [
            {
              uid: '-1',
              name: '已有图片',
              status: 'done',
              url: currentUrl,
            },
          ],
        }));
      }
    } else {
      setImageFileLists((prev) => ({ ...prev, [index]: [] }));
    }
  };

  // 封面图片上传处理
  const handleCoverImageUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setCoverImageLoading(true);
    try {
      const response = await uploadFile(file as File);
      if (response.success && (response.url || response.file_path)) {
        const url = response.url || response.file_path || '';
        editForm.setFieldValue('cover_image', url);
        setCoverImageFileList([
          {
            uid: '-1',
            name: (file as File).name,
            status: 'done',
            url: url,
          },
        ]);
        onSuccess?.(response, file);
        message.success('封面图片上传成功');
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error: any) {
      console.error('封面图片上传失败:', error);
      message.error(error?.message || '封面图片上传失败');
      onError?.(error);
    } finally {
      setCoverImageLoading(false);
    }
  };

  // 删除封面图片
  const handleRemoveCoverImage = () => {
    editForm.setFieldValue('cover_image', '');
    setCoverImageFileList([]);
  };

  // 切换封面图片输入模式
  const handleToggleCoverImageMode = (mode: 'upload' | 'link') => {
    setCoverImageInputMode(mode);
    if (mode === 'upload') {
      const currentUrl = editForm.getFieldValue('cover_image');
      if (currentUrl) {
        setCoverImageFileList([
          {
            uid: '-1',
            name: '已有图片',
            status: 'done',
            url: currentUrl,
          },
        ]);
      }
    } else {
      setCoverImageFileList([]);
    }
  };

  // 提交编辑
  const handleEditSubmit = async () => {
    if (!editingArticle) return;

    const values = await editForm.validateFields();
    setEditSubmitting(true);

    try {
      const data = {
        ...values,
        blocks: editBlocks,
      };

      await adminUpdateArticle(editingArticle.id, data);
      message.success('文章更新成功');
      handleCloseEdit();
      fetchArticles();
    } catch (error) {
      console.error('更新文章失败:', error);
      message.error('更新文章失败，请重试');
    } finally {
      setEditSubmitting(false);
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
      width: 320,
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
            icon={<EditOutlined />}
            style={{ color: '#1890ff' }}
            onClick={() => handleOpenEdit(record)}
          >
            编辑
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
    fetchTags();
    fetchArticles();
  }, [fetchCategories, fetchTags, fetchArticles]);

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
          <Button onClick={handleReset}>重置</Button>
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
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize: pageSize || 20 }),
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
                <Tag
                  color={
                    ARTICLE_TYPES[
                      viewArticle.article_type as keyof typeof ARTICLE_TYPES
                    ]?.color
                  }
                >
                  {
                    ARTICLE_TYPES[
                      viewArticle.article_type as keyof typeof ARTICLE_TYPES
                    ]?.label
                  }
                </Tag>
              </Space>
            </div>
            <div className="preview-meta">
              <p>
                <strong>摘要：</strong>
                {viewArticle.summary}
              </p>
              {viewArticle.keywords && (
                <p>
                  <strong>关键词：</strong>
                  {viewArticle.keywords}
                </p>
              )}
              <p>
                <strong>提交时间：</strong>
                {new Date(viewArticle.created_at).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="preview-content">
              {viewArticle.blocks.map((block, index) => (
                <div
                  key={`preview-block-${block.sort_order || index}`}
                  className="preview-block"
                >
                  {block.block_type === 'text' && <p>{block.content}</p>}
                  {block.block_type === 'image' && (
                    <img
                      src={block.media_url}
                      alt={block.media_alt || ''}
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                    />
                  )}
                  {block.block_type === 'code' && (
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: 12,
                        borderRadius: 8,
                        overflow: 'auto',
                      }}
                    >
                      <code>{block.content}</code>
                    </pre>
                  )}
                  {block.block_type === 'quote' && (
                    <blockquote
                      style={{
                        borderLeft: '4px solid #4ECDC4',
                        paddingLeft: 16,
                        fontStyle: 'italic',
                      }}
                    >
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
        okText={
          reviewType === 'approve'
            ? '通过'
            : reviewType === 'reject'
              ? '驳回'
              : '请求修改'
        }
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
                rules={
                  reviewType !== 'approve'
                    ? [{ required: true, message: '请输入原因' }]
                    : []
                }
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
                <Form.Item
                  name="publish_immediately"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <span style={{ color: '#52c41a' }}>立即发布该文章</span>
                </Form.Item>
              )}
            </Form>
          </div>
        )}
      </Modal>

      {/* 编辑文章模态框 */}
      <Modal
        title="编辑文章"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleCloseEdit}
        confirmLoading={editSubmitting}
        okText="保存"
        cancelText="取消"
        width={900}
        style={{ top: 20 }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="文章标题"
            rules={[
              { required: true, message: '请输入文章标题' },
              { max: 200, message: '标题最多200个字符' },
            ]}
          >
            <Input placeholder="请输入文章标题" maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            name="summary"
            label="文章摘要"
            rules={[{ max: 500, message: '摘要最多500个字符' }]}
          >
            <TextArea
              placeholder="请输入文章摘要"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item name="cover_image" label="封面图片">
            <Radio.Group
              value={coverImageInputMode}
              onChange={(e) => handleToggleCoverImageMode(e.target.value)}
              style={{ marginBottom: 12 }}
            >
              <Radio.Button value="upload">
                <UploadOutlined /> 本地上传
              </Radio.Button>
              <Radio.Button value="link">
                <LinkOutlined /> 链接地址
              </Radio.Button>
            </Radio.Group>

            {coverImageInputMode === 'upload' && (
              <>
                <Upload
                  name="file"
                  listType="picture-card"
                  fileList={coverImageFileList}
                  beforeUpload={beforeUpload}
                  customRequest={handleCoverImageUpload}
                  onRemove={handleRemoveCoverImage}
                  maxCount={1}
                  accept="image/*"
                >
                  {coverImageFileList.length === 0 && (
                    <div>
                      {coverImageLoading ? (
                        <LoadingOutlined />
                      ) : (
                        <PlusOutlined />
                      )}
                      <div style={{ marginTop: 8 }}>上传封面</div>
                    </div>
                  )}
                </Upload>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  支持 jpg、png、gif 格式，最大 5MB
                </div>
              </>
            )}

            {coverImageInputMode === 'link' && (
              <Input
                value={editForm.getFieldValue('cover_image') || ''}
                onChange={(e) =>
                  editForm.setFieldValue('cover_image', e.target.value)
                }
                placeholder="请输入封面图片URL链接"
                prefix={<LinkOutlined />}
              />
            )}
          </Form.Item>

          <Form.Item
            name="article_type"
            label="文章类型"
            initialValue="study_guide"
          >
            <Select placeholder="请选择文章类型">
              <Option value="study_guide">学习指南</Option>
              <Option value="exam_tips">考试技巧</Option>
              <Option value="resource">学习资源</Option>
            </Select>
          </Form.Item>

          <Form.Item name="category_ids" label="文章分类">
            <Select mode="multiple" placeholder="请选择分类（可多选）">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tag_ids" label="文章标签">
            <Select mode="multiple" placeholder="请选择标签（可多选）">
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="keywords" label="SEO关键词">
            <Input placeholder="请输入SEO关键词，多个关键词用逗号分隔" />
          </Form.Item>

          <Form.Item name="meta_description" label="SEO描述">
            <TextArea
              placeholder="请输入SEO描述"
              rows={2}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>

        <Divider>内容块</Divider>

        <div className="blocks-toolbar" style={{ marginBottom: 16 }}>
          <Space wrap>
            {BLOCK_TYPES.map((type) => (
              <Button
                key={type.value}
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleAddBlock(type.value as API.BlockType)}
              >
                {type.icon} {type.label}
              </Button>
            ))}
          </Space>
        </div>

        <div
          className="blocks-list"
          style={{ maxHeight: 400, overflow: 'auto' }}
        >
          {editBlocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
              暂无内容块，请添加
            </div>
          ) : (
            editBlocks.map((block, index) => (
              <div
                key={`edit-block-${block.sort_order || index}`}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Tag color="blue">
                    {
                      BLOCK_TYPES.find((t) => t.value === block.block_type)
                        ?.label
                    }
                  </Tag>
                  <Space size="small">
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => handleMoveBlock(index, 'up')}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={index === editBlocks.length - 1}
                      onClick={() => handleMoveBlock(index, 'down')}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteBlock(index)}
                    />
                  </Space>
                </div>

                {block.block_type === 'text' && (
                  <TextArea
                    value={block.content || ''}
                    onChange={(e) =>
                      handleUpdateBlock(index, 'content', e.target.value)
                    }
                    placeholder="请输入文本内容"
                    rows={3}
                  />
                )}

                {block.block_type === 'image' && (
                  <>
                    <Radio.Group
                      value={imageInputModes[index] || 'upload'}
                      onChange={(e) =>
                        handleToggleImageMode(index, e.target.value)
                      }
                      style={{ marginBottom: 8 }}
                    >
                      <Radio.Button value="upload">上传</Radio.Button>
                      <Radio.Button value="link">链接</Radio.Button>
                    </Radio.Group>

                    {(imageInputModes[index] || 'upload') === 'upload' && (
                      <Upload
                        name="file"
                        listType="picture-card"
                        fileList={imageFileLists[index] || []}
                        beforeUpload={beforeUpload}
                        customRequest={(options) =>
                          handleImageUpload(index, options)
                        }
                        onRemove={() => handleRemoveImage(index)}
                        maxCount={1}
                        accept="image/*"
                      >
                        {(!imageFileLists[index] ||
                          imageFileLists[index]?.length === 0) && (
                          <div>
                            {imageUploadLoading[index] ? (
                              <LoadingOutlined />
                            ) : (
                              <PlusOutlined />
                            )}
                          </div>
                        )}
                      </Upload>
                    )}

                    {(imageInputModes[index] || 'upload') === 'link' && (
                      <Input
                        value={block.media_url || ''}
                        onChange={(e) =>
                          handleUpdateBlock(index, 'media_url', e.target.value)
                        }
                        placeholder="请输入图片URL"
                      />
                    )}

                    <Input
                      value={block.media_alt || ''}
                      onChange={(e) =>
                        handleUpdateBlock(index, 'media_alt', e.target.value)
                      }
                      placeholder="图片alt文本（可选）"
                      style={{ marginTop: 8 }}
                    />
                  </>
                )}

                {block.block_type === 'video' && (
                  <Input
                    value={block.media_url || ''}
                    onChange={(e) =>
                      handleUpdateBlock(index, 'media_url', e.target.value)
                    }
                    placeholder="请输入视频URL"
                  />
                )}

                {block.block_type === 'code' && (
                  <>
                    <Select
                      value={block.code_language}
                      onChange={(value) =>
                        handleUpdateBlock(index, 'code_language', value)
                      }
                      style={{ width: '100%', marginBottom: 8 }}
                    >
                      <Option value="javascript">JavaScript</Option>
                      <Option value="python">Python</Option>
                      <Option value="java">Java</Option>
                      <Option value="cpp">C++</Option>
                      <Option value="html">HTML</Option>
                      <Option value="css">CSS</Option>
                    </Select>
                    <TextArea
                      value={block.content || ''}
                      onChange={(e) =>
                        handleUpdateBlock(index, 'content', e.target.value)
                      }
                      placeholder="请输入代码"
                      rows={4}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </>
                )}

                {block.block_type === 'quote' && (
                  <TextArea
                    value={block.content || ''}
                    onChange={(e) =>
                      handleUpdateBlock(index, 'content', e.target.value)
                    }
                    placeholder="请输入引用内容"
                    rows={2}
                  />
                )}

                {block.block_type === 'list' && (
                  <>
                    <Select
                      value={block.list_type}
                      onChange={(value) =>
                        handleUpdateBlock(index, 'list_type', value)
                      }
                      style={{ width: '100%', marginBottom: 8 }}
                    >
                      <Option value="unordered">无序列表</Option>
                      <Option value="ordered">有序列表</Option>
                    </Select>
                    <TextArea
                      value={block.content || ''}
                      onChange={(e) =>
                        handleUpdateBlock(index, 'content', e.target.value)
                      }
                      placeholder="请输入列表内容（每行一项）"
                      rows={3}
                    />
                  </>
                )}

                {block.block_type === 'divider' && (
                  <Divider style={{ margin: '8px 0' }} />
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ArticleReviewPage;
