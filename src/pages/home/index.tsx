import { history, useModel } from '@umijs/max';
import { Avatar, Button, Card, Col, Dropdown, Row, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import React from 'react';
import { TOKEN_KEY } from '@/config/apiConfig';
import './index.less';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;

  const handleLogin = () => {
    history.push('/user/login');
  };

  const handleStart = () => {
    history.push('/exam-catalog');
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/home';
  };

  // 个人中心
  const handleProfile = () => {
    history.push('/user/profile');
  };

  // 用户菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: handleProfile,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <div className="home-container">
      {/* 顶部导航 */}
      <div className="home-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">英语学习平台</span>
          </div>
          <div className="header-actions">
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar 
                  size="large" 
                  icon={<UserOutlined />} 
                  style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                />
              </Dropdown>
            ) : (
              <Button type="primary" onClick={handleLogin}>
                登录
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="home-content">
        {/* Hero 区域 */}
        <div className="hero-section">
          <div className="hero-content">
            <Title level={1} className="hero-title">
              欢迎来到英语学习平台
            </Title>
            <Paragraph className="hero-description">
              提供专业的口语练习、智能评测和个性化学习方案
            </Paragraph>
            <div className="hero-actions">
              <Button type="primary" size="large" onClick={handleStart}>
                开始练习
              </Button>
              <Button size="large" onClick={handleLogin} style={{ marginLeft: 16 }}>
                了解更多
              </Button>
            </div>
          </div>
        </div>

        {/* 功能特性区域 */}
        <div className="features-section">
          <Title level={2} className="section-title">
            核心功能
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">🎤</div>
                <Title level={4}>口语练习</Title>
                <Paragraph>
                  真实场景模拟，多样化的口语练习题型，帮助你快速提升口语表达能力
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">🤖</div>
                <Title level={4}>AI 智能评测</Title>
                <Paragraph>
                  先进的语音识别和自然语言处理技术，实时评估你的发音、语法和流利度
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">📊</div>
                <Title level={4}>学习分析</Title>
                <Paragraph>
                  详细的学习报告和数据分析，帮助你了解学习进度，发现薄弱环节
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">📚</div>
                <Title level={4}>丰富题库</Title>
                <Paragraph>
                  涵盖日常对话、商务英语、旅游英语等多个场景的海量练习题库
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">🎯</div>
                <Title level={4}>个性化学习</Title>
                <Paragraph>
                  根据你的水平和学习目标，智能推荐适合的学习内容和练习计划
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">⏰</div>
                <Title level={4}>随时随地</Title>
                <Paragraph>
                  支持多设备访问，无论在家还是在外，都能轻松进行英语学习
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA 区域 */}
        <div className="cta-section">
          <Title level={2}>开始你的英语学习之旅</Title>
          <Paragraph className="cta-description">
            立即注册，获得专业的学习指导和个性化学习方案
          </Paragraph>
          <Button type="primary" size="large" onClick={handleStart}>
            立即开始
          </Button>
        </div>
      </div>

      {/* 页脚 */}
      <div className="home-footer">
        <div className="footer-content">
          <Paragraph>© 2024 英语学习平台. All rights reserved.</Paragraph>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
