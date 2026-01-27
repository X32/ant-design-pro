import { history, useModel } from '@umijs/max';
import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';
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

  return (
    <div className="home-page">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src={logoIcon} alt="SpeakCube Logo" className="logo-icon" />
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
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-main-title">解锁每一环 · 流利不一般</h1>
          <p className="hero-subtitle">Unlock every part · speak with art.</p>
          <p className="hero-description">
            让 AI 成为你的口语教练 · 24小时随时随地练习 · 智能评分反馈 ·
            快速提升口语水平
          </p>
          <div className="hero-buttons">
            <Button
              className="primary-button"
              size="large"
              onClick={handleStart}
            >
              免费体验
            </Button>
            <Button
              className="secondary-button"
              size="large"
              onClick={handleLearnMore}
            >
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* 特性区域 */}
      <section id="features" className="features">
        <h2 className="section-title">核心特性</h2>
        <p className="section-subtitle">
          强大的 AI 技术，为你提供专业的口语训练
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>智能 AI 对话</h3>
            <p>
              先进的 AI 技术，提供真实自然的对话体验，就像与真人交流一样流畅
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>精准评分反馈</h3>
            <p>
              实时语音识别与分析，从发音、流利度、语法等多维度给出专业评分和建议
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>个性化学习</h3>
            <p>根据你的水平和需求，智能推荐练习内容，制定专属学习计划</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>语音识别</h3>
            <p>高精度语音识别技术，准确捕捉你的发音细节，提供针对性改进建议</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>随时随地练习</h3>
            <p>支持手机、平板、电脑多端使用，利用碎片时间，随时随地提升口语</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>经济实惠</h3>
            <p>比传统外教课程更实惠，无需预约排课，想练就练，性价比超高</p>
          </div>
        </div>
      </section>

      {/* 优势区域 */}
      <section id="advantages" className="advantages">
        <div className="advantages-container">
          <div>
            <h2 className="section-title">为什么选择我们？</h2>
            <ul className="advantages-list">
              <li className="advantage-item">
                <div className="advantage-icon">⚡</div>
                <div className="advantage-content">
                  <h3>即时反馈</h3>
                  <p>
                    每次练习后立即获得详细的评分和改进建议，不用等待，高效学习
                  </p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">🌟</div>
                <div className="advantage-content">
                  <h3>零压力环境</h3>
                  <p>与 AI 对话，无需担心说错，可以大胆练习，建立口语自信</p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">🎓</div>
                <div className="advantage-content">
                  <h3>专业系统</h3>
                  <p>科学的学习方法和丰富的练习场景，系统化提升口语能力</p>
                </div>
              </li>
              <li className="advantage-item">
                <div className="advantage-icon">🔒</div>
                <div className="advantage-content">
                  <h3>隐私保护</h3>
                  <p>你的练习数据完全保密，安全可靠，可以放心使用</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="advantages-image">🎯</div>
        </div>
      </section>

      {/* 统计数据 */}
      <section id="stats" className="stats">
        <h2 className="section-title">用数据说话</h2>
        <p className="section-subtitle">
          已有数千名用户通过我们的平台提升了口语水平
        </p>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">活跃用户</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100K+</div>
            <div className="stat-label">练习对话</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">用户满意度</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">全天候服务</div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="cta-section">
        <h2>准备好开始你的口语提升之旅了吗？</h2>
        <p>现在注册，免费体验 AI 口语练习</p>
        <div className="hero-buttons">
          <Button className="primary-button" size="large" onClick={handleLogin}>
            立即注册
          </Button>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="footer">
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
