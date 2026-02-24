import React, { useState, useEffect, useCallback } from 'react';
import { Helmet, history, useModel, useParams } from '@umijs/max';
import { Spin, Empty, message, Button, Tag, Space, Avatar, Form, Input as AntInput, Popconfirm } from 'antd';
import { HeartOutlined, HeartFilled, EyeOutlined, CalendarOutlined, UserOutlined, SendOutlined, DeleteOutlined, EditOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { getArticleDetail, likeArticle, unlikeArticle, getArticleComments, createComment, updateComment, deleteOwnComment, likeComment, unlikeComment } from '@/services/ant-design-pro/api';
import './index.less';

const { TextArea } = AntInput;

const ArticleDetailPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};
  const isLoggedIn = !!user;

  const { id: articleId } = useParams<{ id: string }>();

  // 数据状态
  const [article, setArticle] = useState<API.ArticleDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // 评论相关状态
  const [comments, setComments] = useState<API.CommentListItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentPageSize] = useState(20);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [commentForm] = Form.useForm();

  // 文章类型配置
  const ARTICLE_TYPES = {
    study_guide: { label: '学习指南', color: '#FFD93D' },
    exam_tips: { label: '考试技巧', color: '#4ECDC4' },
    resource: { label: '学习资源', color: '#FF6B6B' },
  };

  // 获取文章详情
  const fetchArticleDetail = useCallback(async () => {
    if (!articleId) return;

    setLoading(true);
    try {
      const response = await getArticleDetail(parseInt(articleId));
      if (response?.success && response?.data) {
        setArticle(response.data.article);
        // 更新页面标题
        document.title = `${response.data.article.title} - 口语魔方SpeakCube`;
      } else {
        message.error(response?.message || '获取文章详情失败');
      }
    } catch (error) {
      console.error('获取文章详情失败:', error);
      message.error('获取文章详情失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  // 点赞文章
  const handleLike = async () => {
    if (!isLoggedIn || !article) return;

    try {
      if (article.is_liked) {
        await unlikeArticle(article.id);
        message.success('取消点赞成功');
      } else {
        await likeArticle(article.id);
        message.success('点赞成功');
      }
      // 重新获取文章详情以更新点赞状态
      fetchArticleDetail();
    } catch (error) {
      console.error('点赞操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  // 获取文章评论
  const fetchComments = useCallback(async (page: number = 1) => {
    if (!articleId) return;

    setCommentsLoading(true);
    try {
      const response = await getArticleComments(parseInt(articleId), {
        page,
        page_size: commentPageSize,
        sort: 'latest',
      });

      if (response?.success && response?.data) {
        setComments(response.data.comments || []);
        setCommentTotal(response.data.total || 0);
        setCommentPage(page);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      message.error('获取评论失败，请重试');
    } finally {
      setCommentsLoading(false);
    }
  }, [articleId, commentPageSize]);

  // 提交评论
  const handleSubmitComment = async (values: { content: string }) => {
    if (!isLoggedIn || !article) return;

    if (!values.content?.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    try {
      const data: { content: string; parent_id?: number } = {
        content: values.content,
      };

      if (replyTo) {
        data.parent_id = replyTo;
      }

      if (editingComment) {
        // 更新评论
        await updateComment(article.id, editingComment, { content: values.content });
        message.success('评论更新成功');
        setEditingComment(null);
      } else {
        // 创建新评论
        await createComment(article.id, data);
        message.success('评论提交成功，等待审核');
        setReplyTo(null);
      }

      commentForm.resetFields();
      fetchComments(1);
    } catch (error) {
      console.error('提交评论失败:', error);
      message.error('提交评论失败，请重试');
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!article) return;

    try {
      await deleteOwnComment(article.id, commentId);
      message.success('删除成功');
      fetchComments(commentPage);
    } catch (error) {
      console.error('删除评论失败:', error);
      message.error('删除失败，请重试');
    }
  };

  // 点赞评论
  const handleLikeComment = async (commentId: number, isLiked: boolean) => {
    if (!isLoggedIn || !article) return;

    try {
      if (isLiked) {
        await unlikeComment(article.id, commentId);
        message.success('取消点赞成功');
      } else {
        await likeComment(article.id, commentId);
        message.success('点赞成功');
      }
      fetchComments(commentPage);
    } catch (error) {
      console.error('点赞操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  // 回复评论
  const handleReply = (commentId: number) => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      return;
    }
    setReplyTo(commentId);
    setEditingComment(null);
    commentForm.focus();
  };

  // 编辑评论
  const handleEditComment = (comment: API.CommentListItem) => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      return;
    }
    if (!comment.is_own) {
      message.warning('只能编辑自己的评论');
      return;
    }
    setEditingComment(comment.id);
    setReplyTo(null);
    commentForm.setFieldsValue({ content: comment.content });
    commentForm.focus();
  };

  // 返回列表
  const handleBack = () => {
    history.push('/articles');
  };

  // 初始化加载
  useEffect(() => {
    fetchArticleDetail();
    fetchComments(1);
    // 滚动到顶部
    window.scrollTo(0, 0);
  }, [fetchArticleDetail, fetchComments]);

  // 渲染内容块
  const renderContentBlock = (block: API.ContentBlock) => {
    switch (block.block_type) {
      case 'text':
        return (
          <div key={block.id} className="content-block content-text">
            <p>{block.content}</p>
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="content-block content-image">
            {block.media_url && (
              <img src={block.media_url} alt={block.media_alt || ''} />
            )}
            {block.caption && (
              <p className="image-caption">{block.caption}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div key={block.id} className="content-block content-video">
            {block.media_url && (
              <video controls>
                <source src={block.media_url} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            )}
            {block.caption && (
              <p className="video-caption">{block.caption}</p>
            )}
          </div>
        );

      case 'code':
        return (
          <div key={block.id} className="content-block content-code">
            <pre className="code-block">
              <code>{block.content}</code>
            </pre>
            {block.code_language && (
              <span className="code-language">{block.code_language}</span>
            )}
          </div>
        );

      case 'quote':
        return (
          <div key={block.id} className="content-block content-quote">
            <blockquote>
              <p>{block.content}</p>
            </blockquote>
          </div>
        );

      case 'divider':
        return (
          <div key={block.id} className="content-block content-divider">
            <hr />
          </div>
        );

      case 'list':
        const listItems = block.content?.split('\n').filter(item => item.trim()) || [];
        const ListComponent = block.list_type === 'ordered' ? 'ol' : 'ul';

        return (
          <div key={block.id} className="content-block content-list">
            <ListComponent className={block.list_type}>
              {listItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ListComponent>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-page">
        <Empty description="文章不存在或已被删除" />
        <div className="back-button-container">
          <Button onClick={handleBack} type="primary" size="large">
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{article.title} - 口语魔方SpeakCube | 剑桥英语口语备考指南</title>
        <meta
          name="description"
          content={article.meta_description || article.summary}
        />
        <meta
          name="keywords"
          content={article.keywords || ''}
        />
      </Helmet>

      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <button className="back-button" onClick={handleBack}>
            ← 返回文章列表
          </button>
          <h1 className="page-title">文章详情</h1>
          <div style={{ width: 100 }}></div>
        </div>
      </nav>

      {/* 文章头部信息 */}
      <section className="article-header">
        <div className="header-container">
          <div className="article-categories">
            {article.categories.map((cat) => (
              <Tag key={cat.id} color="blue" className="category-tag">
                {cat.name}
              </Tag>
            ))}
          </div>
          <h1 className="article-title">{article.title}</h1>

          <div className="article-meta">
            <Space size="large">
              <span className="meta-item">
                <UserOutlined />
                {article.author?.username}
              </span>
              <span className="meta-item">
                <EyeOutlined />
                {article.view_count}
              </span>
              <span className="meta-item">
                <CalendarOutlined />
                {new Date(article.created_at).toLocaleDateString('zh-CN')}
              </span>
              {isLoggedIn && (
                <span
                  className="meta-item like-button"
                  onClick={handleLike}
                  style={{ cursor: 'pointer' }}
                >
                  {article.is_liked ? <HeartFilled /> : <HeartOutlined />}
                  {article.like_count}
                </span>
              )}
            </Space>
          </div>

          {article.tags.length > 0 && (
            <div className="article-tags">
              {article.tags.map((tag) => (
                <Tag key={tag.id} color={tag.color} className="tag-item">
                  {tag.name}
                </Tag>
              ))}
            </div>
          )}

          {article.summary && (
            <div className="article-summary">
              <h3>文章摘要</h3>
              <p>{article.summary}</p>
            </div>
          )}
        </div>
      </section>

      {/* 文章内容 */}
      <section className="article-content">
        <div className="content-container">
          {article.blocks.map((block) => renderContentBlock(block))}
        </div>
      </section>

      {/* 文章底部信息 */}
      <section className="article-footer">
        <div className="footer-container">
          <div className="article-type-badge">
            <Tag color={ARTICLE_TYPES[article.article_type as keyof typeof ARTICLE_TYPES]?.color}>
              {ARTICLE_TYPES[article.article_type as keyof typeof ARTICLE_TYPES]?.label}
            </Tag>
          </div>
          <div className="publish-info">
            <p>发布于: {new Date(article.published_at || article.created_at).toLocaleString('zh-CN')}</p>
            <p>浏览量: {article.view_count}</p>
            <p>点赞数: {article.like_count}</p>
          </div>
        </div>
      </section>

      {/* 返回按钮 */}
      <section className="article-actions">
        <Button className="action-button" onClick={handleBack} size="large">
          返回文章列表
        </Button>
      </section>

      {/* 评论区域 */}
      <section className="comments-section">
        <div className="comments-container">
          <div className="comments-header">
            <MessageOutlined />
            <h2>评论 ({commentTotal})</h2>
          </div>

          {/* 评论输入框 */}
          <div className="comment-input-area">
            <Form form={commentForm} onFinish={handleSubmitComment}>
              <Form.Item
                name="content"
                rules={[{ required: true, message: '请输入评论内容' }]}
              >
                <TextArea
                  rows={4}
                  placeholder={replyTo ? '回复评论...' : isLoggedIn ? '写下你的评论...' : '请登录后发表评论'}
                  disabled={!isLoggedIn}
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
              <div className="comment-input-actions">
                {replyTo && (
                  <Button onClick={() => setReplyTo(null)}>
                    取消回复
                  </Button>
                )}
                {editingComment && (
                  <Button onClick={() => {
                    setEditingComment(null);
                    commentForm.resetFields();
                  }}>
                    取消编辑
                  </Button>
                )}
                <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                  {editingComment ? '更新评论' : '发表评论'}
                </Button>
              </div>
            </Form>
          </div>

          {/* 评论列表 */}
          <div className="comments-list">
            <Spin spinning={commentsLoading}>
              {comments.length === 0 ? (
                <Empty description="暂无评论，快来抢沙发吧！" />
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <Avatar
                        src={comment.user?.avatar}
                        icon={!comment.user?.avatar && <UserOutlined />}
                        size={40}
                      />
                      <div className="comment-user-info">
                        <span className="comment-username">
                          {comment.user?.username}
                        </span>
                        <span className="comment-time">
                          {new Date(comment.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>

                    <div className="comment-content">
                      {comment.parent && (
                        <div className="reply-to">
                          回复 @{comment.parent.user?.username}
                        </div>
                      )}
                      <p>{comment.content}</p>
                    </div>

                    <div className="comment-actions">
                      <Space size="middle">
                        <span
                          className={`comment-like ${comment.is_liked ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(comment.id, comment.is_liked || false)}
                        >
                          <LikeOutlined />
                          {comment.like_count}
                        </span>
                        <span
                          className="comment-reply"
                          onClick={() => handleReply(comment.id)}
                        >
                          <MessageOutlined />
                          回复
                        </span>
                        {comment.is_own && (
                          <>
                            <span
                              className="comment-edit"
                              onClick={() => handleEditComment(comment)}
                            >
                              <EditOutlined />
                              编辑
                            </span>
                            <Popconfirm
                              title="确认删除该评论？"
                              onConfirm={() => handleDeleteComment(comment.id)}
                              okText="确认"
                              cancelText="取消"
                            >
                              <span className="comment-delete">
                                <DeleteOutlined />
                                删除
                              </span>
                            </Popconfirm>
                          </>
                        )}
                      </Space>
                    </div>
                  </div>
                ))
              )}
            </Spin>
          </div>

          {/* 分页 */}
          {commentTotal > commentPageSize && (
            <div className="comments-pagination">
              <Button
                disabled={commentPage <= 1}
                onClick={() => fetchComments(commentPage - 1)}
              >
                上一页
              </Button>
              <span>
                第 {commentPage} 页，共 {Math.ceil(commentTotal / commentPageSize)} 页
              </span>
              <Button
                disabled={commentPage >= Math.ceil(commentTotal / commentPageSize)}
                onClick={() => fetchComments(commentPage + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArticleDetailPage;
