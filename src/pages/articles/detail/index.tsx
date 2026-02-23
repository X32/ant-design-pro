import React, { useState, useEffect, useCallback } from 'react';
import { Helmet, history, useModel, useParams } from '@umijs/max';
import { Spin, Empty, message, Button, Tag, Space } from 'antd';
import { HeartOutlined, HeartFilled, EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { getArticleDetail, likeArticle, unlikeArticle } from '@/services/ant-design-pro/api';
import './index.less';

const ArticleDetailPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};
  const isLoggedIn = !!user;

  const { id: articleId } = useParams<{ id: string }>();

  // 数据状态
  const [article, setArticle] = useState<API.ArticleDetail | null>(null);
  const [loading, setLoading] = useState(false);

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

  // 返回列表
  const handleBack = () => {
    history.push('/articles');
  };

  // 初始化加载
  useEffect(() => {
    fetchArticleDetail();
    // 滚动到顶部
    window.scrollTo(0, 0);
  }, [fetchArticleDetail]);

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
    </div>
  );
};

export default ArticleDetailPage;
