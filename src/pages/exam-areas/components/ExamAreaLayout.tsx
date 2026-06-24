import { ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';
import { Helmet, history, useModel } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import LoginModal from '@/components/LoginModal';
import UserAvatar from '@/components/UserAvatar';
import logoIcon from '@/img/icon_200.png';
import type { BreadcrumbItemProps, ExamLevelConfig, ExamType } from '../types';
import { EXAM_CONFIGS } from '../types';
import './ExamAreaLayout.less';

interface ExamAreaLayoutProps {
  examType: ExamType;
  children: React.ReactNode;
}

/**
 * 考试专区布局组件
 * 提供统一的顶部导航、Banner区域和SEO优化
 */
const ExamAreaLayout: React.FC<ExamAreaLayoutProps> = ({
  examType,
  children,
}) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;

  const [loginModalVisible, setLoginModalVisible] = React.useState(false);

  // 获取考试配置
  const config: ExamLevelConfig = EXAM_CONFIGS[examType];
  const seoConfig = config.seo;

  // 返回首页
  const handleBackToHome = () => {
    history.push('/home');
  };

  // 登录
  const handleLogin = () => {
    setLoginModalVisible(true);
  };

  // 登录成功回调
  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
  };

  // 开始练习
  const handleStartPractice = () => {
    if (!isLoggedIn) {
      setLoginModalVisible(true);
      return;
    }
    // 滚动到试卷列表区域
    const listElement = document.getElementById('paper-list-section');
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 面包屑导航数据
  const breadcrumbItems: BreadcrumbItemProps[] = [
    {
      title: `${examType}口语专区`,
      path: `/${examType.toLowerCase()}-speaking`,
      icon: <BookOutlined />,
    },
  ];

  // 结构化数据 - 课程
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: config.title,
    description: `${config.description}覆盖所有${examType}口语考试话题，适合${config.ageRange}学习。`,
    provider: {
      '@type': 'Organization',
      name: '口语魔方SpeakCube',
      url: 'https://www.speakcube.cn',
    },
    educationalLevel: config.level,
    teaches: `${examType}英语口语`,
    assesses: '口语表达能力',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
    },
  };

  // 结构化数据 - 面包屑
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: 'https://www.speakcube.cn/home',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${examType}口语专区`,
        item: `https://www.speakcube.cn/${examType.toLowerCase()}-speaking`,
      },
    ],
  };

  return (
    <div className="exam-area-container">
      {/* 面包屑导航 */}
      <BreadcrumbNav items={breadcrumbItems} />

      <Helmet>
        {/* 基础 Meta 标签 */}
        <title>{seoConfig.title}</title>
        <meta name="description" content={seoConfig.description} />
        <meta name="keywords" content={seoConfig.keywords.join(',')} />
        <meta name="author" content="口语魔方SpeakCube" />
        <link
          rel="canonical"
          href={`https://www.speakcube.cn/${examType.toLowerCase()}-speaking`}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="口语魔方SpeakCube" />
        <meta property="og:title" content={seoConfig.title} />
        <meta property="og:description" content={seoConfig.description} />
        <meta
          property="og:url"
          content={`https://www.speakcube.cn/${examType.toLowerCase()}-speaking`}
        />
        <meta
          property="og:image"
          content={`https://www.speakcube.cn/og-image-${examType.toLowerCase()}.jpg`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${examType}口语真题模拟考试`} />
        <meta property="og:locale" content="zh_CN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoConfig.title} />
        <meta name="twitter:description" content={seoConfig.description} />
        <meta
          name="twitter:image"
          content={`https://www.speakcube.cn/twitter-card-${examType.toLowerCase()}.jpg`}
        />
        <meta name="twitter:image:alt" content={`${examType}口语练习平台`} />

        {/* 移动端优化 */}
        <meta name="theme-color" content={config.color} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="apple-mobile-web-app-title"
          content={`SpeakCube ${examType}`}
        />

        {/* 结构化数据 - Course */}
        <script type="application/ld+json">
          {JSON.stringify(courseSchema)}
        </script>

        {/* 结构化数据 - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        {/* 结构化数据 - FAQPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: config.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          })}
        </script>
      </Helmet>

      {/* 顶部导航栏 */}
      <nav className="exam-area-navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToHome}
              size="large"
              className="back-button"
            >
              返回首页
            </Button>
          </div>

          <div className="nav-center">
            <img
              src={logoIcon}
              alt={`口语魔方SpeakCube ${examType}口语练习平台 - AI智能评分`}
              title={`${examType}口语真题模拟考试`}
              className="nav-logo"
              width="36"
              height="36"
              loading="lazy"
              decoding="async"
            />
            <span className="nav-title">口语魔方SpeakCube</span>
          </div>

          <div className="nav-right">
            <a
              href="/about"
              style={{
                marginRight: '16px',
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              品牌
            </a>
            {isLoggedIn ? (
              <UserAvatar />
            ) : (
              <Button type="primary" onClick={handleLogin}>
                登录
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Banner区域 */}
      <section className="exam-area-banner">
        <div className="banner-content">
          <div className="banner-badge">{config.level} 级别</div>
          <h1 className="banner-title">{seoConfig.h1Title}</h1>
          <p className="banner-description">{config.description}</p>

          <div className="banner-tags">
            <span className="tag">📚 真题模拟</span>
            <span className="tag">🤖 AI评分</span>
            <span className="tag">⚡ 即时反馈</span>
            <span className="tag">👶 适合{config.ageRange}</span>
          </div>

          <Button
            type="primary"
            size="large"
            className="start-button"
            onClick={handleStartPractice}
          >
            开始练习
          </Button>
        </div>
      </section>

      {/* 主要内容区域 */}
      <main className="exam-area-main">{children}</main>

      {/* 登录弹窗 */}
      <LoginModal
        visible={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default ExamAreaLayout;
