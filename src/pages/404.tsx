import { history, Helmet } from '@umijs/max';
import { Button, Card, Result, Space } from 'antd';
import { HomeOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import React from 'react';
import './404.less';

const NoFoundPage: React.FC = () => {
  const popularPages = [
    {
      title: '首页',
      description: '开始你的口语练习之旅',
      icon: <HomeOutlined />,
      path: '/home',
    },
    {
      title: 'KET口语专区',
      description: 'KET口语真题模拟考试',
      icon: <BookOutlined />,
      path: '/ket-speaking',
    },
    {
      title: 'PET口语专区',
      description: 'PET口语真题模拟考试',
      icon: <BookOutlined />,
      path: '/pet-speaking',
    },
    {
      title: 'FCE口语专区',
      description: 'FCE口语真题模拟考试',
      icon: <TrophyOutlined />,
      path: '/fce-speaking',
    },
  ];

  return (
    <div className="not-found-container">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>404 - 页面未找到 | 口语魔方SpeakCube</title>
        <meta
          name="description"
          content="抱歉，您访问的页面不存在。口语魔方SpeakCube - 专业AI剑桥英语口语练习平台，提供KET、PET、FCE口语真题模拟考试、AI智能评分、实时反馈。"
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.qtoplay.com/404" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="口语魔方SpeakCube" />
        <meta property="og:title" content="404 - 页面未找到 | 口语魔方SpeakCube" />
        <meta property="og:description" content="抱歉，您访问的页面不存在。返回首页继续您的口语练习之旅。" />
        <meta property="og:url" content="https://www.qtoplay.com/404" />
        <meta property="og:locale" content="zh_CN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="404 - 页面未找到 | 口语魔方SpeakCube" />
        <meta name="twitter:description" content="抱歉，您访问的页面不存在。" />

        {/* 结构化数据 - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "首页",
                "item": "https://www.qtoplay.com/home"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "404页面"
              }
            ]
          })}
        </script>
      </Helmet>

      <Card variant="borderless" className="not-found-card">
        <div className="not-found-content">
          <Result
            status="404"
            title="404"
            subTitle="抱歉，您访问的页面不存在或已被移除"
            className="not-found-result"
          />

          {/* 热门页面推荐 */}
          <div className="popular-pages-section">
            <h3 className="popular-pages-title">热门页面推荐</h3>
            <div className="popular-pages-grid">
              {popularPages.map((page) => (
                <div
                  key={page.path}
                  className="popular-page-item"
                  onClick={() => history.push(page.path)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') history.push(page.path);
                  }}
                >
                  <div className="page-icon">{page.icon}</div>
                  <div className="page-content">
                    <div className="page-title">{page.title}</div>
                    <div className="page-description">{page.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="not-found-actions">
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                onClick={() => history.push('/home')}
                icon={<HomeOutlined />}
              >
                返回首页
              </Button>
              <Button
                size="large"
                onClick={() => history.push('/about')}
              >
                了解品牌
              </Button>
              <Button
                size="large"
                onClick={() => history.push('/exam-catalog')}
              >
                考试目录
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NoFoundPage;
