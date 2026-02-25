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
  Checkbox,
  Upload,
  Radio,
} from 'antd';
import type { UploadFile } from 'antd/es/upload';
import type { RcFile } from 'antd/es/upload/interface';
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UploadOutlined,
  LinkOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  getArticleDetail,
  createArticle,
  updateArticle,
  submitArticleForReview,
  approveArticle,
  getArticleCategories,
  getArticleTags,
  uploadFile,
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
  const [publishImmediately, setPublishImmediately] = useState(false);

  // 图片上传状态
  const [imageUploadLoading, setImageUploadLoading] = useState<{ [key: number]: boolean }>({});
  const [imageInputModes, setImageInputModes] = useState<{ [key: number]: 'upload' | 'link' }>({});
  const [imageFileLists, setImageFileLists] = useState<{ [key: number]: UploadFile[] }>({});

  // 封面图片上传状态
  const [coverImageInputMode, setCoverImageInputMode] = useState<'upload' | 'link'>('upload');
  const [coverImageFileList, setCoverImageFileList] = useState<UploadFile[]>([]);
  const [coverImageLoading, setCoverImageLoading] = useState(false);

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
        const blocksData = article.blocks || [];
        setBlocks(blocksData);

        // 初始化图片内容块的状态
        const initialImageModes: { [key: number]: 'upload' | 'link' } = {};
        const initialImageFileLists: { [key: number]: UploadFile[] } = {};
        const initialImageUploadLoading: { [key: number]: boolean } = {};

        blocksData.forEach((block, index) => {
          if (block.block_type === 'image' && block.media_url) {
            // 判断是本地上传还是链接，如果是http开头且不是本站地址，认为是链接模式
            const isExternalLink = block.media_url.startsWith('http') &&
              !block.media_url.includes(window.location.host);
            initialImageModes[index] = isExternalLink ? 'link' : 'upload';

            if (!isExternalLink) {
              initialImageFileLists[index] = [{
                uid: '-1',
                name: '已上传图片',
                status: 'done',
                url: block.media_url,
              }];
            }
            initialImageUploadLoading[index] = false;
          }
        });

        setImageInputModes(initialImageModes);
        setImageFileLists(initialImageFileLists);
        setImageUploadLoading(initialImageUploadLoading);

        // 初始化封面图片状态
        if (article.cover_image) {
          const isExternalLink = article.cover_image.startsWith('http') &&
            !article.cover_image.includes(window.location.host);
          setCoverImageInputMode(isExternalLink ? 'link' : 'upload');

          if (!isExternalLink) {
            setCoverImageFileList([{
              uid: '-1',
              name: '已上传封面',
              status: 'done',
              url: article.cover_image,
            }]);
          }
        }
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

  // 自定义图片上传处理
  const handleImageUpload = async (index: number, options: any) => {
    const { file, onSuccess, onError } = options;
    setImageUploadLoading(prev => ({ ...prev, [index]: true }));
    try {
      const response = await uploadFile(file as File);
      if (response.success && (response.url || response.file_path)) {
        const url = response.url || response.file_path || '';
        handleUpdateBlock(index, 'media_url', url);
        setImageFileLists(prev => ({
          ...prev,
          [index]: [{
            uid: '-1',
            name: (file as File).name,
            status: 'done',
            url: url,
          }]
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
      setImageUploadLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    handleUpdateBlock(index, 'media_url', '');
    setImageFileLists(prev => ({ ...prev, [index]: [] }));
  };

  // 切换图片输入模式
  const handleToggleImageMode = (index: number, mode: 'upload' | 'link') => {
    setImageInputModes(prev => ({ ...prev, [index]: mode }));
    // 切换模式时清空文件列表
    if (mode === 'upload') {
      const currentUrl = blocks[index]?.media_url;
      if (currentUrl) {
        setImageFileLists(prev => ({
          ...prev,
          [index]: [{
            uid: '-1',
            name: '已有图片',
            status: 'done',
            url: currentUrl,
          }]
        }));
      }
    } else {
      setImageFileLists(prev => ({ ...prev, [index]: [] }));
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
        form.setFieldValue('cover_image', url);
        setCoverImageFileList([{
          uid: '-1',
          name: (file as File).name,
          status: 'done',
          url: url,
        }]);
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
    form.setFieldValue('cover_image', '');
    setCoverImageFileList([]);
  };

  // 切换封面图片输入模式
  const handleToggleCoverImageMode = (mode: 'upload' | 'link') => {
    setCoverImageInputMode(mode);
    // 切换模式时处理文件列表
    if (mode === 'upload') {
      const currentUrl = form.getFieldValue('cover_image');
      if (currentUrl) {
        setCoverImageFileList([{
          uid: '-1',
          name: '已有图片',
          status: 'done',
          url: currentUrl,
        }]);
      }
    } else {
      setCoverImageFileList([]);
    }
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

      if (publishImmediately) {
        // 如果选择立即发布，直接使用 approveArticle API 并设置 publish_immediately
        await approveArticle(parseInt(articleId), {
          comment: '作者直接发布',
          publish_immediately: true,
        });
        message.success('文章已发布');
      } else {
        // 否则提交审核
        await submitArticleForReview(parseInt(articleId));
        message.success('提交审核成功');
      }

      // 返回列表
      setTimeout(() => {
        history.push('/articles');
      }, 1500);
    } catch (error) {
      console.error('提交审核失败:', error);
      message.error(publishImmediately ? '发布失败，请重试' : '提交审核失败，请重试');
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

            <Form.Item name="cover_image" label="封面图片">
              {/* 模式切换 */}
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

              {/* 本地上传模式 */}
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
                        {coverImageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>上传封面图片</div>
                      </div>
                    )}
                  </Upload>
                  <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    支持 jpg、png、gif 格式，文件大小不超过 5MB
                  </div>
                </>
              )}

              {/* 链接输入模式 */}
              {coverImageInputMode === 'link' && (
                <>
                  <Input
                    value={form.getFieldValue('cover_image') || ''}
                    onChange={(e) => form.setFieldValue('cover_image', e.target.value)}
                    placeholder="请输入封面图片URL链接"
                    prefix={<LinkOutlined />}
                    style={{ marginBottom: 8 }}
                  />
                  {form.getFieldValue('cover_image') && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: '#999', fontSize: 12, marginBottom: 8, display: 'block' }}>封面预览：</span>
                      <img
                        src={form.getFieldValue('cover_image')}
                        alt="封面预览"
                        style={{
                          maxWidth: 200,
                          maxHeight: 150,
                          borderRadius: 4,
                          border: '1px solid #d9d9d9'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                  <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    请输入有效的图片URL地址，如 https://example.com/image.jpg
                  </div>
                </>
              )}
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
                      {/* 模式切换 */}
                      <Radio.Group
                        value={imageInputModes[index] || 'upload'}
                        onChange={(e) => handleToggleImageMode(index, e.target.value)}
                        style={{ marginBottom: 12 }}
                      >
                        <Radio.Button value="upload">
                          <UploadOutlined /> 本地上传
                        </Radio.Button>
                        <Radio.Button value="link">
                          <LinkOutlined /> 链接地址
                        </Radio.Button>
                      </Radio.Group>

                      {/* 本地上传模式 */}
                      {(imageInputModes[index] || 'upload') === 'upload' && (
                        <>
                          <Upload
                            name="file"
                            listType="picture-card"
                            fileList={imageFileLists[index] || []}
                            beforeUpload={beforeUpload}
                            customRequest={(options) => handleImageUpload(index, options)}
                            onRemove={() => handleRemoveImage(index)}
                            maxCount={1}
                            accept="image/*"
                          >
                            {(!imageFileLists[index] || imageFileLists[index]?.length === 0) && (
                              <div>
                                {imageUploadLoading[index] ? <LoadingOutlined /> : <PlusOutlined />}
                                <div style={{ marginTop: 8 }}>上传图片</div>
                              </div>
                            )}
                          </Upload>
                          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                            支持 jpg、png、gif 格式，文件大小不超过 5MB
                          </div>
                        </>
                      )}

                      {/* 链接输入模式 */}
                      {(imageInputModes[index] || 'upload') === 'link' && (
                        <>
                          <Input
                            value={block.media_url || ''}
                            onChange={(e) => handleUpdateBlock(index, 'media_url', e.target.value)}
                            placeholder="请输入图片URL链接"
                            prefix={<LinkOutlined />}
                            style={{ marginBottom: 8 }}
                          />
                          {block.media_url && (
                            <div style={{ marginTop: 8 }}>
                              <span style={{ color: '#999', fontSize: 12, marginBottom: 8, display: 'block' }}>图片预览：</span>
                              <img
                                src={block.media_url}
                                alt="图片预览"
                                style={{
                                  maxWidth: 200,
                                  maxHeight: 150,
                                  borderRadius: 4,
                                  border: '1px solid #d9d9d9'
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                onLoad={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'block';
                                }}
                              />
                            </div>
                          )}
                          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                            请输入有效的图片URL地址，如 https://example.com/image.jpg
                          </div>
                        </>
                      )}

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
          <div className="publish-options">
            <Checkbox
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
              style={{ fontSize: '14px' }}
            >
              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                立即发布（跳过审核直接发布）
              </span>
            </Checkbox>
          </div>
          <div className="action-buttons">
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
              onClick={() => form.validateFields().then(handleSubmitForReview)}
              loading={submitting}
              size="large"
            >
              {publishImmediately ? '立即发布' : (isEditMode ? '保存并提交审核' : '创建并提交审核')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditPage;
