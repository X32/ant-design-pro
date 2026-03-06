import { history, useModel, Helmet } from '@umijs/max';
import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import TLDRSummary from '@/components/TLDRSummary';
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
    // ✅ 如果已登录，跳转到考试目录；否则打开登录弹窗
    if (isLoggedIn) {
      history.push('/exam-catalog');
    } else {
      setLoginModalVisible(true);
    }
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

  const handleWriteArticle = () => {
    history.push('/articles/edit');
  };

  // 结构化数据 - 教育机构（SEO优化）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "口语魔方SpeakCube",
    "alternateName": "口语魔方SpeakCube AI剑桥英语口语练习平台",
    "description": "专业AI剑桥英语口语练习平台 - 口语魔方SpeakCube，提供KET、PET、FCE口语真题模拟考试、AI智能评分、实时反馈",
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
    },
    "offers": {
      "@type": "Offer",
      "category": "KET/PET/FCE口语模拟考试",
      "priceCurrency": "CNY",
      "availability": "https://schema.org/InStock"
    }
  };

  // 结构化数据 - 课程（SEO优化）
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "KET/PET/FCE口语真题模拟考试",
    "description": "AI驱动的剑桥英语口语模拟考试平台，提供KET、PET、FCE口语真题练习，即时AI评分反馈",
    "provider": {
      "@type": "Organization",
      "name": "口语魔方SpeakCube",
      "url": "https://www.qtoplay.com"
    },
    "educationalLevel": "KET/PET/FCE",
    "teaches": "英语口语",
    "assesses": "口语表达能力",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY",
      "availability": "https://schema.org/InStock"
    }
  };

  // 结构化数据 - FAQ（SEO优化）
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "KET口语考试难吗？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "KET口语考试难度适中，主要考察基础交流能力。通过SpeakCube AI模拟练习，每天10分钟，大多数学生2-4周即可明显提升。"
        }
      },
      {
        "@type": "Question",
        "name": "AI口语练习和外教课有什么区别？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI口语练习可以24小时随时练习，无需预约，即时评分反馈。价格比外教课便宜90%以上，而且AI永远不会批评孩子，让孩子更敢开口说英语。"
        }
      },
      {
        "@type": "Question",
        "name": "SpeakCube支持哪些剑桥英语考试？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SpeakCube支持KET（A2 Key）、PET（B1 Preliminary）、FCE（B2 First）三个级别的口语真题模拟考试，覆盖所有官方考试话题。"
        }
      }
    ]
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
        {/* 基础 Meta 标签 - SEO优化 */}
        <title>口语魔方SpeakCube - AI剑桥英语口语练习平台 | KET/PET/FCE口语真题模拟考试</title>
        <meta 
          name="description" 
          content="专业AI剑桥英语口语练习平台 - 口语魔方SpeakCube，提供KET、PET、FCE口语真题模拟考试、AI智能评分、实时反馈。每天10分钟，轻松提分！已有10000+学员在用，95%家长好评。免费试用→" 
        />
        <meta 
          name="keywords" 
          content="口语魔方,SpeakCube,口语魔方SpeakCube,KET口语,PET口语,FCE口语,剑桥英语口语,AI口语练习,口语模拟考试,少儿英语口语,AI英语口语练习,儿童英语学习,英语口语APP,KET口语真题,PET口语练习,FCE口语模拟" 
        />
        <meta name="author" content="SpeakCube" />
        <link rel="canonical" href="https://www.qtoplay.com/" />

        {/* Open Graph / Facebook - SEO优化 */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SpeakCube" />
        <meta property="og:title" content="口语魔方SpeakCube - AI剑桥英语口语练习平台 | KET/PET/FCE真题模拟" />
        <meta property="og:description" content="专业KET/PET/FCE口语真题模拟考试 - 口语魔方SpeakCube，AI智能评分，实时反馈。每天10分钟轻松提分！" />
        <meta property="og:url" content="https://www.qtoplay.com" />
        <meta property="og:image" content="https://www.qtoplay.com/og-image-1200x630.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SpeakCube AI剑桥英语口语练习平台" />
        <meta property="og:locale" content="zh_CN" />

        {/* Twitter Card - SEO优化 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="口语魔方SpeakCube - AI剑桥英语口语练习平台" />
        <meta name="twitter:description" content="KET/PET/FCE口语真题模拟 - 口语魔方SpeakCube，AI陪练，每天10分钟提升口语能力" />
        <meta name="twitter:image" content="https://www.qtoplay.com/twitter-card-1200x628.jpg" />
        <meta name="twitter:image:alt" content="SpeakCube AI口语练习" />

        {/* 移动端优化 */}
        <meta name="theme-color" content="#1890ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SpeakCube" />

        {/* 搜索引擎验证 (需要替换为实际的验证码) */}
        {/* <meta name="baidu-site-verification" content="YOUR_BAIDU_CODE" /> */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}

        {/* 百度统计代码 (需要替换为实际的统计代码) */}
        {/* <script>
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?YOUR_BAIDU_ANALYTICS_ID";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
          })();
        </script> */}

        {/* 结构化数据 - SEO优化 */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(courseSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      {/* 面包屑导航 */}
      <BreadcrumbNav items={[]} />

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
              <a href="/about">品牌</a>
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
            <li>
              <a href="#features">特性</a>
            </li>
            <li>
              <a href="#advantages">优势</a>
            </li>
            <li>
              <a href="#stats">数据</a>
            </li>
            <li>
              <a href="/articles">文章</a>
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
          <div className="hero-badge">✨ KET/PET/FCE口语真题模拟</div>
          <h1 className="hero-main-title">
            <span className="line">口语魔方</span>
            <span className="line">AI剑桥英语口语练习平台</span>
            <span className="highlight">真题模拟！</span>
          </h1>
          <p className="hero-subtitle">KET · PET · FCE 口语真题模拟考试</p>
          
          {/* TL;DR 摘要块 - GEO 优化：结论前置（44.2% 引用来自前 1/3） */}
          <TLDRSummary
            content="<strong>口语魔方 SpeakCube</strong>是 AI 驱动的剑桥英语口语练习平台，提供<strong>KET/PET/FCE 口语真题模拟考试</strong>。AI 智能评分系统从发音、流利度、语法、词汇四个维度即时反馈（对标剑桥英语评分标准）。每天 10 分钟练习，已有 10,000+ 学员使用，95% 家长好评（2026 年 3 月数据）。"
            title="快速了解"
            badgeIcon="📌"
          />
          <p className="hero-description">
            AI智能评分，即时反馈<br/>
            每天10分钟，轻松提升口语成绩！
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
          对标KET/PET/FCE考试标准，AI考官陪你练口语！
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <RobotIcon size={72} />
            </div>
            <h3>AI 如何陪你练口语？</h3>
            <p>
              AI 考官像朋友一样陪你练习英语口语。无论你的发音是否标准，AI 都会耐心倾听并给予鼓励，让你敢于开口说英语。
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <TargetIcon size={72} />
            </div>
            <h3>如何即时获得发音反馈？</h3>
            <p>
              说完立刻知道哪里好、哪里要改进，还有小星星奖励哦~
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <GameIcon size={72} />
            </div>
            <h3>学习像玩游戏一样有趣吗？</h3>
            <p>完成任务有金币，升级打怪，不知不觉就把英语学会了！</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MicIcon size={72} />
            </div>
            <h3>AI 能准确识别发音吗？</h3>
            <p>超厉害的语音识别，连小小的发音问题都能发现！</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <PhoneIcon size={72} />
            </div>
            <h3>随时随地都能练习吗？</h3>
            <p>手机、平板都能用，坐车、睡前都可以说几句~</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <CoinIcon size={72} />
            </div>
            <h3>价格实惠吗？</h3>
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
                  <h3>如何追踪学习进度？</h3>
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
                  <h3>说错了怎么办？</h3>
                  <p>AI 超级有耐心，永远不会批评孩子，越说越有自信！</p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">
                  <GraduationIcon size={48} />
                </div>
                <div className="advantage-content">
                  <h3>采用什么科学方法？</h3>
                  <p>专业的教学设计，从简单到难，一步步提升口语能力</p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">
                  <LockIcon size={48} />
                </div>
                <div className="advantage-content">
                  <h3>平台安全可靠吗？</h3>
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
          已经有好多小朋友在这里学会说英语啦~<br/><span className="stat-source">（数据来源：SpeakCube 后台统计，2026 年 3 月）</span>
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
            onClick={isLoggedIn ? handleStart : handleLogin}
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

export default HomePage;
