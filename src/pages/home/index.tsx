import { history, useModel, Helmet } from '@umijs/max';
import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';
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
import './index.less';
import logoIcon from '@/img/icon_200.png';

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;
  const [loginModalVisible, setLoginModalVisible] = useState(false);



 const handleLogin = () => {
    setLoginModalVisible(true);
  };

  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
    // 登录成功后可以跳转或刷新
  };

  const handleStart = () => {
    history.push('/exam-catalog');
  };

  const handleLearnMore = () => {
    history.push('/home/intro');
  };

  const handleProfile = () => {
    history.push('/user/profile');
  };

  // 结构化数据 - 教育机构
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "SpeakCube",
    "alternateName": "SpeakCube AI口语练习",
    "description": "专为5-12岁少儿设计的AI英语口语练习平台,通过游戏化学习让孩子爱上说英语",
    "url": "https://www.qtoplay.com",
    "logo": "https://www.qtoplay.com/logo.png",
    "image": "https://www.qtoplay.com/og-image.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1520",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "category": "教育服务",
      "priceCurrency": "CNY",
      "availability": "https://schema.org/InStock"
    }
  };

  // 面包屑导航数据
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首页",
        "item": "https://www.qtoplay.com"
      }
    ]
  };

  return (
    <div className="home-page">
      {/* SEO Meta 标签 */}
      <Helmet>
        {/* 基础 Meta 标签 */}
        <title>SpeakCube - AI少儿英语口语练习平台 | 让孩子像玩游戏一样学英语</title>
        <meta 
          name="description" 
          content="SpeakCube是专为5-12岁少儿设计的AI英语口语练习平台。通过游戏化学习方式，让孩子每天10分钟轻松练口语。AI智能陪练，实时反馈发音和语法，95%家长好评，已有10000+小朋友在用。免费体验，随时随地练习英语口语。" 
        />
        <meta 
          name="keywords" 
          content="少儿英语口语,AI英语口语练习,儿童英语学习,英语口语APP,在线英语学习,英语口语训练,少儿英语启蒙,英语口语陪练,游戏化学习英语,小学生英语口语" 
        />
        <meta name="author" content="SpeakCube" />
        <link rel="canonical" href="https://www.qtoplay.com/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.qtoplay.com/" />
        <meta property="og:title" content="SpeakCube - AI少儿英语口语练习平台" />
        <meta property="og:description" content="让孩子像玩游戏一样学英语,AI陪练,每天10分钟提升口语能力。95%家长好评,10000+小朋友都在用!" />
        <meta property="og:image" content="https://www.qtoplay.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="SpeakCube" />
        <meta property="og:locale" content="zh_CN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.qtoplay.com/" />
        <meta name="twitter:title" content="SpeakCube - AI少儿英语口语练习平台" />
        <meta name="twitter:description" content="让孩子像玩游戏一样学英语,AI陪练,每天10分钟提升口语能力" />
        <meta name="twitter:image" content="https://www.qtoplay.com/twitter-image.jpg" />

        {/* 移动端优化 */}
        <meta name="theme-color" content="#1890ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SpeakCube" />

        {/* 搜索引擎验证 (需要替换为实际的验证码) */}
        {/* <meta name="baidu-site-verification" content="YOUR_BAIDU_CODE" /> */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}

        {/* 结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img 
              src={logoIcon} 
              alt="SpeakCube Logo - AI少儿英语口语练习平台" 
              className="logo-icon"
              width="48"
              height="48"
              loading="eager"
            />
            <span className="logo-text">SpeakCube AI 口语练习</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#features">特性</a>
            </li>
            <li>
              <a href="#advantages">优势</a>
            </li>
            <li>
              <a href="#stats">数据</a>
            </li>
          </ul>
          {isLoggedIn ? (
            <Button className="cta-button" onClick={handleProfile}>
              个人中心
            </Button>
          ) : (
            <Button className="cta-button" onClick={handleLogin}>
              立即开始
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
          <div className="hero-badge">✨ 少儿口语练习好伙伴</div>
          <h1 className="hero-main-title">
            <span className="line">开口说英语</span>
            <span className="line">像玩游戏一样</span>
            <span className="highlight">有趣！</span>
          </h1>
          <p className="hero-subtitle">Speak English, Play & Learn!</p>
          <p className="hero-description">
            每天10分钟，AI陪你练口语<br/>
            说错也没关系，大胆开口！
          </p>
          <div className="hero-buttons">
            <Button
              className="primary-button"
              size="large"
              onClick={handleStart}
            >
              <GamepadButtonIcon size={28} />
              开始游戏
            </Button>
            <Button
              className="secondary-button"
              size="large"
              onClick={handleLearnMore}
            >
              <BookButtonIcon size={28} />
              看看怎么玩
            </Button>
          </div>
        </div>
      </section>

      {/* 特性区域 */}
      <section id="features" className="features" aria-labelledby="features-title">
        <h2 id="features-title" className="section-title">为什么小朋友都喜欢？</h2>
        <p className="section-subtitle">
          超级好玩的 AI 老师，让学英语像玩游戏一样上瘾！
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
          <Button className="primary-button" size="large" onClick={handleLogin}>
            <RocketButtonIcon size={28} />
            立即出发
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

export default HomePage;
