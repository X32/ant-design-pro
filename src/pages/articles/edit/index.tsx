import React, { useState, useEffect, useCallback } from 'react';
import { Helmet, history, useModel, useParams } from '@umijs/max';
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Space,
  Modal,
  Divider,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  getArticleDetail,
  createArticle,
  updateArticle,
  submitArticleForReview,
  getArticleCategories,
  getArticleTags,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

const ArticleEditPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};
  const isLoggedIn = !!user;

  const { id: articleId } = useParams<{ id?: string }>();
  const isEditMode = !!articleId;

  const [form] = Form.useForm();

  // 数据状态
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<API.ArticleCategory[]>([]);
  const [tags, setTags] = useState<API.ArticleTag[]>([]);
  const [blocks, setBlocks] = useState<API.ContentBlock[]>([]);

  // 模态框状态
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // 文章类型配置
  const ARTICLE_TYPES = [
    { value: 'study_guide', label: '学习指南', color: '#FFD93D' },
    { value: 'exam_tips', label: '考试技巧', color: '#4ECDC4' },
    { value: 'resource', label: '学习资源', color: '#FF6B6B' },
  ];

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

  // 获取文章详情（编辑模式）
  const fetchArticleDetail = useCallback(async () => {
    if (!articleId) return;

    setLoading(true);
    try {
      const response = await getArticleDetail(parseInt(articleId));
      if (response?.success && response?.data) {
        const article = response.data.article;

        // 填充表单
        form.setFieldsValue({
          title: article.title,
          summary: article.summary,
          cover_image: article.cover_image,
          article_type: article.article_type,
          category_ids: article.categories.map(c => c.id),
          tag_ids: article.tags.map(t => t.id),
          keywords: article.keywords,
          meta_description: article.meta_description,
        });

        // 设置内容块
        setBlocks(article.blocks || []);
      } else {
        message.error(response?.message || '获取文章详情失败');
      }
    } catch (error) {
      console.error('获取文章详情失败:', error);
      message.error('获取文章详情失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [articleId, form]);

  // 添加内容块
  const handleAddBlock = (blockType: API.BlockType) => {
    const newBlock: API.ContentBlock = {
      block_type: blockType,
      sort_order: blocks.length + 1,
      content: blockType === 'text' ? '' : null,
      media_url: blockType === 'image' || blockType === 'video' ? '' : null,
      media_alt: null,
      caption: null,
      code_language: 'javascript',
      list_type: 'unordered',
    };

    setBlocks([...blocks, newBlock]);
  };

  // 更新内容块
  const handleUpdateBlock = (index: number, field: keyof API.ContentBlock, value: any) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      [field]: value,
    };
    setBlocks(updatedBlocks);
  };

  // 删除内容块
  const handleDeleteBlock = (index: number) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    // 更新排序
    updatedBlocks.forEach((block, i) => {
      block.sort_order = i + 1;
    });
    setBlocks(updatedBlocks);
  };

  // 移动内容块
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const updatedBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= updatedBlocks.length) return;

    // 交换位置
    [updatedBlocks[index], updatedBlocks[newIndex]] = [updatedBlocks[newIndex], updatedBlocks[index]];

    // 更新排序
    updatedBlocks.forEach((block, i) => {
      block.sort_order = i + 1;
    });

    setBlocks(updatedBlocks);
  };

  // 保存为草稿
  const handleSaveDraft = async (values: any) => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        ...values,
        blocks,
      };

      if (isEditMode && articleId) {
        await updateArticle(parseInt(articleId), data);
        message.success('更新草稿成功');
      } else {
        const response = await createArticle(data);
        message.success('保存草稿成功');
        // 跳转到编辑模式
        if (response?.data?.article?.id) {
          history.push(`/articles/edit/${response.data.article.id}`);
          return;
        }
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      message.error('保存草稿失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 提交审核
  const handleSubmitForReview = async (values: any) => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      return;
    }

    if (!articleId) {
      message.warning('请先保存草稿');
      return;
    }

    setSubmitting(true);
    try {
      // 先更新内容
      const data = {
        ...values,
        blocks,
      };

      await updateArticle(parseInt(articleId), data);

      // 再提交审核
      await submitArticleForReview(parseInt(articleId));
      message.success('提交审核成功');

      // 返回列表
      setTimeout(() => {
        history.push('/articles');
      }, 1500);
    } catch (error) {
      console.error('提交审核失败:', error);
      message.error('提交审核失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    history.push('/articles');
  };

  // 初始化加载
  useEffect(() => {
    fetchCategories();
    fetchTags();

    if (isEditMode) {
      fetchArticleDetail();
    }
  }, [fetchCategories, fetchTags, fetchArticleDetail, isEditMode]);

  return (
    <div className="article-edit-page">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{isEditMode ? '编辑文章' : '创建文章'} - 口语魔方SpeakCube</title>
      </Helmet>

      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeftOutlined /> 返回
          </button>
          <h1 className="page-title">
            {isEditMode ? '编辑文章' : '创建文章'}
          </h1>
          <div style={{ width: 100 }}></div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="edit-content">
        <Card className="form-card" title="文章信息">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitForReview}
          >
            <Form.Item
              name="title"
              label="文章标题"
              rules={[
                { required: true, message: '请输入文章标题' },
                { max: 200, message: '标题最多200个字符' },
              ]}
            >
              <Input placeholder="请输入文章标题（1-200字符）" maxLength={200} showCount />
            </Form.Item>

            <Form.Item
              name="summary"
              label="文章摘要"
              rules={[
                { max: 500, message: '摘要最多500个字符' },
              ]}
            >
              <TextArea
                placeholder="请输入文章摘要（最多500字符）"
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item name="cover_image" label="封面图片URL">
              <Input placeholder="请输入封面图片URL" />
            </Form.Item>

            <Form.Item
              name="article_type"
              label="文章类型"
              initialValue="study_guide"
            >
              <Select placeholder="请选择文章类型">
                {ARTICLE_TYPES.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
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
        </Card>

        <Card className="blocks-card" title="内容块">
          <div className="blocks-toolbar">
            <Space wrap>
              {BLOCK_TYPES.map((type) => (
                <Button
                  key={type.value}
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddBlock(type.value as API.BlockType)}
                >
                  {type.icon} {type.label}
                </Button>
              ))}
            </Space>
          </div>

          <Divider />

          {blocks.length === 0 ? (
            <div className="empty-blocks">
              <p>暂无内容块，请添加</p>
            </div>
          ) : (
            <div className="blocks-list">
              {blocks.map((block, index) => (
                <div key={index} className="block-item">
                  <div className="block-header">
                    <Tag color="blue">
                      {BLOCK_TYPES.find(t => t.value === block.block_type)?.label}
                    </Tag>
                    <Space size="small">
                      <Button
                        type="text"
                        icon={<ArrowUpOutlined />}
                        size="small"
                        disabled={index === 0}
                        onClick={() => handleMoveBlock(index, 'up')}
                      >
                        上移
                      </Button>
                      <Button
                        type="text"
                        icon={<ArrowDownOutlined />}
                        size="small"
                        disabled={index === blocks.length - 1}
                        onClick={() => handleMoveBlock(index, 'down')}
                      >
                        下移
                      </Button>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDeleteBlock(index)}
                      >
                        删除
                      </Button>
                    </Space>
                  </div>

                  {block.block_type === 'text' && (
                    <Form.Item style={{ marginBottom: 0 }}>
                      <TextArea
                        value={block.content}
                        onChange={(e) => handleUpdateBlock(index, 'content', e.target.value)}
                        placeholder="请输入文本内容"
                        rows={4}
                      />
                    </Form.Item>
                  )}

                  {block.block_type === 'image' && (
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Input
                        value={block.media_url || ''}
                        onChange={(e) => handleUpdateBlock(index, 'media_url', e.target.value)}
                        placeholder="请输入图片URL"
                      />
                      <Input
                        value={block.media_alt || ''}
                        onChange={(e) => handleUpdateBlock(index, 'media_alt', e.target.value)}
                        placeholder="请输入图片alt文本（可选）"
                        style={{ marginTop: '0.5rem' }}
                      />
                      <Input
                        value={block.caption || ''}
                        onChange={(e) => handleUpdateBlock(index, 'caption', e.target.value)}
                        placeholder="请输入图片说明（可选）"
                        style={{ marginTop: '0.5rem' }}
                      />
                    </Form.Item>
                  )}

                  {block.block_type === 'video' && (
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Input
                        value={block.media_url || ''}
                        onChange={(e) => handleUpdateBlock(index, 'media_url', e.target.value)}
                        placeholder="请输入视频URL"
                      />
                      <Input
                        value={block.caption || ''}
                        onChange={(e) => handleUpdateBlock(index, 'caption', e.target.value)}
                        placeholder="请输入视频说明（可选）"
                        style={{ marginTop: '0.5rem' }}
                      />
                    </Form.Item>
                  )}

                  {block.block_type === 'code' && (
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Select
                        value={block.code_language}
                        onChange={(value) => handleUpdateBlock(index, 'code_language', value)}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
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
                        onChange={(e) => handleUpdateBlock(index, 'content', e.target.value)}
                        placeholder="请输入代码"
                        rows={6}
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Form.Item>
                  )}

                  {block.block_type === 'quote' && (
                    <Form.Item style={{ marginBottom: 0 }}>
                      <TextArea
                        value={block.content || ''}
                        onChange={(e) => handleUpdateBlock(index, 'content', e.target.value)}
                        placeholder="请输入引用内容"
                        rows={3}
                      />
                    </Form.Item>
                  )}

                  {block.block_type === 'list' && (
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Select
                        value={block.list_type}
                        onChange={(value) => handleUpdateBlock(index, 'list_type', value)}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                      >
                        <Option value="unordered">无序列表</Option>
                        <Option value="ordered">有序列表</Option>
                      </Select>
                      <TextArea
                        value={block.content || ''}
                        onChange={(e) => handleUpdateBlock(index, 'content', e.target.value)}
                        placeholder="请输入列表内容（每行一项）"
                        rows={4}
                      />
                    </Form.Item>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="form-actions">
          <Button
            type="default"
            icon={<SaveOutlined />}
            onClick={() => form.validateFields().then(handleSaveDraft)}
            loading={submitting}
            size="large"
          >
            保存草稿
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            htmlType="submit"
            loading={submitting}
            size="large"
          >
            {isEditMode ? '保存并提交审核' : '创建并提交审核'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditPage;
