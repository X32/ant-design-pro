import React, { useState, useEffect, useCallback } from 'react';
import { Helmet, history, useModel } from '@umijs/max';
import { Input, Select, Spin, Empty, message, Tag } from 'antd';
import { EyeOutlined, HeartOutlined, LikeOutlined } from '@ant-design/icons';
import { getArticles, getArticleCategories } from '@/services/ant-design-pro/api';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import type { BreadcrumbItemProps } from '@/pages/exam-areas/types';
import logoIcon from '@/img/icon_200.png';
import './index.less';

const { Option } = Select;

const ArticlesPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};
  const isLoggedIn = !!user;

  // Data state
  const [articles, setArticles] = useState<API.ArticleListItem[]>([]);
  const [categories, setCategories] = useState<API.ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filter and pagination state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12 });

  // Article type config (用于显示文章类型标签)
  const ARTICLE_TYPES = [
    { value: 'study_guide', label: '学习指南', color: '#FFD93D' },
    { value: 'exam_tips', label: '考试技巧', color: '#4ECDC4' },
    { value: 'resource', label: '学习资源', color: '#FF6B6B' },
  ];

  // Article status config
  const STATUS_CONFIG = {
    draft: { color: 'default', text: '草稿' },
    pending_review: { color: 'warning', text: '待审核' },
    approved: { color: 'processing', text: '已通过' },
    rejected: { color: 'error', text: '已驳回' },
    published: { color: 'success', text: '已发布' },
    archived: { color: 'default', text: '已归档' },
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getArticleCategories();
      if (response?.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getArticles({
        page: pagination.current,
        page_size: pagination.pageSize,
        keyword: searchKeyword || undefined,
        category_id: selectedCategoryId,
        status: 'published', // Only show published articles
      });

      if (response?.success && response?.data) {
        setArticles(response.data.articles || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      message.error('Failed to fetch articles, please try again');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedCategoryId, pagination]);

  // View article detail
  const handleViewArticle = (articleId: number) => {
    history.push(`/articles/${articleId}`);
  };

  // Handle search
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchArticles();
  };

  // Handle reset
  const handleReset = () => {
    setSearchKeyword('');
    setSelectedCategoryId(undefined);
    setSelectedTagId(undefined);
    setSelectedArticleType(undefined);
    setPagination({ ...pagination, current: 1 });
  };

  // Initialize loading
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Monitor filter changes, reload data
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Breadcrumb navigation data
  const breadcrumbItems: BreadcrumbItemProps[] = [
    { title: '首页', href: '/home' },
    { title: '备考文章' }
  ];

  return (
    <div className="articles-page">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>备考文章 - 口语魔方SpeakCube | 剑桥英语口语备考指南</title>
        <meta
          name="description"
          content="免费阅读KET、PET、FCE剑桥英语口语备考文章，包含学习指南、考试技巧、真题解析等，助力学生高效备考。"
        />
        <meta
          name="keywords"
          content="口语魔方,备考文章,KET考试,PET考试,FCE考试,剑桥英语,口语指南"
        />
      </Helmet>

      {/* Navigation bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img
              src={logoIcon}
              alt="口语魔方SpeakCube"
              className="logo-icon"
              width="48"
              height="48"
              loading="eager"
              decoding="async"
            />
            <span className="logo-text">口语魔方SpeakCube</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="/home">首页</a>
            </li>
            <li>
              <a href="/about">品牌</a>
            </li>
            <li>
              <a href="/downloads">资料</a>
            </li>
            <li>
              <a href="/articles" className="active">文章</a>
            </li>
            <li>
              <a href="/ket-speaking">KET专区</a>
            </li>
            <li>
              <a href="/pet-speaking">PET专区</a>
            </li>
            <li>
              <a href="/fce-speaking">FCE专区</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Breadcrumb navigation */}
      <BreadcrumbNav items={breadcrumbItems} />

      {/* Page header section */}
      <section className="articles-header">
        <div className="header-content">
          <div className="header-badge">📚 文章中心</div>
          <h1 className="header-title">
            <span className="title-line">剑桥英语口语</span>
            <span className="title-line">备考指南与技巧</span>
          </h1>
          <p className="header-description">
            精心整理的KET、PET、FCE备考文章<br />
            包含学习指南、考试技巧、真题解析，助你高效备考！
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="articles-filter">
        <div className="filter-container">
          <Input
            placeholder="搜索文章关键词..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="search-input"
            suffix={<span>按回车搜索</span>}
          />
          <Select
            placeholder="选择分类"
            value={selectedCategoryId}
            onChange={(value) => setSelectedCategoryId(value)}
            allowClear
            className="filter-select"
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </div>
      </section>

      {/* Article list */}
      <section className="articles-content">
        <Spin spinning={loading}>
          {articles.length === 0 ? (
            <Empty
              description="暂无文章"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="article-card"
                  onClick={() => handleViewArticle(article.id)}
                >
                  {article.cover_image && (
                    <div className="article-cover">
                      <img src={article.cover_image} alt={article.title} />
                    </div>
                  )}
                  <div className="article-content">
                    <div className="article-type">
                      <Tag color={ARTICLE_TYPES.find(t => t.value === article.article_type)?.color}>
                        {ARTICLE_TYPES.find(t => t.value === article.article_type)?.label}
                      </Tag>
                    </div>
                    <div className="article-meta">
                      <span className="article-author">
                        <EyeOutlined /> {article.author?.username}
                      </span>
                      <span className="article-views">
                        👁 {article.view_count}
                      </span>
                      <span className="article-likes">
                        <HeartOutlined /> {article.like_count}
                      </span>
                    </div>
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-summary">{article.summary}</p>
                    <div className="article-tags">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag.id} color={tag.color} className="article-tag">
                          {tag.name}
                        </Tag>
                      ))}
                      {article.tags.length > 3 && (
                        <Tag>+{article.tags.length - 3}</Tag>
                      )}
                    </div>
                    <div className="article-date">
                      {new Date(article.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Spin>

        {/* Pagination */}
        {!loading && articles.length > 0 && (
          <div className="articles-pagination">
            {pagination.current > 1 && (
              <button className="pagination-button" onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}>
                上一页
              </button>
            )}
            <span className="pagination-info">
              第 {pagination.current} 页，共 {Math.ceil(total / pagination.pageSize)} 页
            </span>
            {pagination.current < Math.ceil(total / pagination.pageSize) && (
              <button className="pagination-button" onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}>
                下一页
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ArticlesPage;
