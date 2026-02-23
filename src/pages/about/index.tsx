import React from 'react';
import { Button } from 'antd';
import {
  RobotIcon,
  TargetIcon,
  GameIcon,
  MicIcon,
  PhoneIcon,
  CoinIcon,
  LightningIcon,
  StarIcon,
  GraduationIcon,
  LockIcon,
  GamepadButtonIcon,
  BookButtonIcon,
  RocketButtonIcon,
} from '@/components/HandDrawnIcons';
import { history, Helmet, useModel } from '@umijs/max';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import type { BreadcrumbItemProps } from '@/pages/exam-areas/types';
import LoginModal from '@/components/LoginModal';
import logoIcon from '@/img/icon_200.png';
import './index.less';

/**
 * 品牌介绍页面 - 风格与首页保持一致
 */
const BrandIntroduction: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;
  const [loginModalVisible, setLoginModalVisible] = React.useState(false);

  const handleLogin = () => {
    if (isLoggedIn) {
      history.push('/exam-catalog');
    } else {
      setLoginModalVisible(true);
    }
  };

  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
  };

  const handleStart = () => {
    history.push('/exam-catalog');
  };

  // 面包屑导航数据
  const breadcrumbItems: BreadcrumbItemProps[] = [
    {
      title: '关于我们',
    },
  ];

  return (
    <div className="home-page about-page">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>关于我们 - 口语魔方SpeakCube | AI剑桥英语口语练习平台</title>
        <meta
          name="description"
          content="了解口语魔方SpeakCube品牌故事，专业AI剑桥英语口语练习平台，提供KET、PET、FCE口语真题模拟考试、AI智能评分、实时反馈。"
        />
        <meta
          name="keywords"
          content="口语魔方,SpeakCube,关于我们,品牌故事,剑桥英语,口语练习,AI口语评分,KET口语,PET口语,FCE口语"
        />
        <meta name="author" content="SpeakCube" />
        <link rel="canonical" href="https://www.qtoplay.com/about" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SpeakCube" />
        <meta property="og:title" content="关于我们 - 口语魔方SpeakCube | AI剑桥英语口语练习平台" />
        <meta property="og:description" content="了解口语魔方SpeakCube品牌故事，专业AI剑桥英语口语练习平台，提供KET、PET、FCE口语真题模拟考试、AI智能评分、实时反馈。" />
        <meta property="og:url" content="https://www.qtoplay.com/about" />
        <meta property="og:image" content="https://www.qtoplay.com/og-image-1200x630.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SpeakCube AI剑桥英语口语练习平台" />
        <meta property="og:locale" content="zh_CN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="关于我们 - 口语魔方SpeakCube | AI剑桥英语口语练习平台" />
        <meta name="twitter:description" content="KET/PET/FCE口语真题模拟 - 口语魔方SpeakCube，AI陪练，每天10分钟提升口语能力" />
        <meta name="twitter:image" content="https://www.qtoplay.com/twitter-card-1200x628.jpg" />
        <meta name="twitter:image:alt" content="SpeakCube AI口语练习" />

        {/* 移动端优化 */}
        <meta name="theme-color" content="#1890ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SpeakCube" />

        {/* 结构化数据 - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "口语魔方SpeakCube",
            "alternateName": ["口语魔方", "SpeakCube"],
            "url": "https://www.qtoplay.com",
            "logo": "https://www.qtoplay.com/logo.png",
            "image": "https://www.qtoplay.com/og-image.jpg",
            "sameAs": [
              "https://www.zhihu.com/org/speakcube"
            ],
            "knowsAbout": [
              "KET口语考试",
              "PET口语考试",
              "FCE口语考试",
              "剑桥英语",
              "英语口语练习",
              "AI口语评分"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "1520",
              "bestRating": "5",
              "worstRating": "1"
            }
          })}
        </script>
      </Helmet>

      {/* 面包屑导航 */}
      <BreadcrumbNav items={breadcrumbItems} />

      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img
              src={logoIcon}
              alt="口语魔方SpeakCube - AI剑桥英语口语练习平台 | KET PET FCE口语模拟"
              title="KET/PET/FCE口语真题模拟考试平台"
              className="logo-icon"
              width="48"
              height="48"
              loading="eager"
              decoding="async"
            />
            <span className="logo-text">口语魔方SpeakCube AI 口语练习</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="/home">首页</a>
            </li>
            <li>
              <a href="/about" className="active">品牌</a>
            </li>
            <li>
              <a href="/downloads">资料</a>
            </li>
            <li>
              <a href="/articles">文章</a>
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
          {isLoggedIn ? (
            <Button className="cta-button" onClick={() => history.push('/user/profile')}>
              个人中心
            </Button>
          ) : (
            <Button className="cta-button" onClick={handleLogin}>
              返回首页
            </Button>
          )}
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="hero" aria-label="主要内容区域">
        {/* 漂浮装饰图形 */}
        <div className="floating-shapes">
          <div className="shape shape-1">⭐</div>
          <div className="shape shape-2">🎈</div>
          <div className="shape shape-3">🌟</div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">✨ 品牌故事</div>
          <h1 className="hero-main-title">
            <span className="line">口语魔方</span>
            <span className="line">AI剑桥英语口语练习平台</span>
            <span className="highlight">让每个孩子都能自信开口说英语！</span>
          </h1>
          <p className="hero-subtitle">专业 · 智能 · 高效 · 有趣</p>
          <p className="hero-description">
            基于先进的AI技术和丰富的剑桥英语考试经验<br/>
            打造专业的口语练习平台，助力孩子轻松通关！
          </p>
          <div className="hero-buttons">
            <Button
              className="primary-button"
              size="large"
              onClick={handleStart}
            >
              <GamepadButtonIcon size={28} />
              开始练习
            </Button>
            <Button
              className="secondary-button"
              size="large"
              onClick={() => history.push('/home')}
            >
              <BookButtonIcon size={28} />
              返回首页
            </Button>
          </div>
        </div>
      </section>

      {/* 特性区域 */}
      <section id="features" className="features" aria-labelledby="features-title">
        <h2 id="features-title" className="section-title">我们的核心优势</h2>
        <p className="section-subtitle">
          为什么选择口语魔方SpeakCube？
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <RobotIcon size={72} />
            </div>
            <h3>AI 陪你聊天</h3>
            <p>
              就像和朋友聊天一样，AI 会陪你说英语，不管说成什么样都鼓励你！
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <TargetIcon size={72} />
            </div>
            <h3>马上告诉你对不对</h3>
            <p>
              说完立刻知道哪里好、哪里要改进，还有小星星奖励哦~
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <GameIcon size={72} />
            </div>
            <h3>像游戏一样好玩</h3>
            <p>完成任务有金币，升级打怪，不知不觉就把英语学会了！</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MicIcon size={72} />
            </div>
            <h3>听懂你的每一句话</h3>
            <p>超厉害的语音识别，连小小的发音问题都能发现！</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <PhoneIcon size={72} />
            </div>
            <h3>随时都能练</h3>
            <p>手机、平板都能用，坐车、睡前都可以说几句~</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <CoinIcon size={72} />
            </div>
            <h3>超划算</h3>
            <p>比外教课便宜多了，想练多久练多久，再也不用约时间！</p>
          </div>
        </div>
      </section>

      {/* 优势区域 */}
      <section id="advantages" className="advantages" aria-labelledby="advantages-title">
        <div className="advantages-container">
          <div>
            <h2 id="advantages-title" className="section-title">爸爸妈妈也放心！</h2>
            <ul className="advantages-list">
              <li className="advantage-item">
                <div className="advantage-icon">
                  <LightningIcon size={48} />
                </div>
                <div className="advantage-content">
                  <h3>立刻就能看到进步</h3>
                  <p>
                    每次练完马上就知道结果，孩子看到自己进步超有成就感！
                  </p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">
                  <StarIcon size={48} />
                </div>
                <div className="advantage-content">
                  <h3>说错了也不怕</h3>
                  <p>AI 超级有耐心，永远不会批评孩子，越说越有自信！</p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">
                  <GraduationIcon size={48} />
                </div>
                <div className="advantage-content">
                  <h3>科学的方法</h3>
                  <p>专业的教学设计，从简单到难，一步步提升口语能力</p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">
                  <LockIcon size={48} />
                </div>
                <div className="advantage-content">
                  <h3>安全可靠</h3>
                  <p>所有数据都保护得很好，孩子可以放心使用~</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="advantages-image">🎯</div>
        </div>
      </section>

      {/* 统计数据 */}
      <section id="stats" className="stats" aria-labelledby="stats-title">
        <h2 id="stats-title" className="section-title">大家都在用！</h2>
        <p className="section-subtitle">
          已经有好多小朋友在这里学会说英语啦~
        </p>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">小朋友在用</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100K+</div>
            <div className="stat-label">练习次数</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">都说好</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">随时都能练</div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="cta-section" aria-label="行动号召区域">
        <h2>准备好了吗？开始你的英语冒险！</h2>
        <p>现在就加入，免费体验超好玩的口语练习</p>
        <div className="hero-buttons">
          <Button
            className="primary-button"
            size="large"
            onClick={isLoggedIn ? handleStart : () => setLoginModalVisible(true)}
          >
            <RocketButtonIcon size={28} />
            {isLoggedIn ? '开始练习' : '立即出发'}
          </Button>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="footer" role="contentinfo">
        <div className="footer-content">{/* 预留的页脚链接区域 */}</div>
        <div className="footer-bottom">
          <p>&copy; 2026 AI 口语练习平台. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem' }}>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
              }}
            >
              京ICP备14038012号-2
            </a>
          </p>
        </div>
      </footer>

      {/* 登录弹框 */}
      <LoginModal
        visible={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default BrandIntroduction;