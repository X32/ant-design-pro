import React from 'react';
import { Card, Typography, Timeline, Space, Divider, Tag, Row, Col, Button } from 'antd';
import {
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { history, Helmet } from '@umijs/max';
import './index.less';

const { Title, Paragraph, Text } = Typography;

/**
 * 口语考试介绍页面
 * 展示考试流程、评分标准等信息
 */
const ExamIntro: React.FC = () => {
  return (
    <div className="exam-intro-container">
      <Helmet>
        {/* SEO Meta标签 */}
        <title>KET/PET/FCE口语考试介绍 - 考试流程与评分标准 | SpeakCube</title>
        <meta 
          name="description" 
          content="详细介绍KET、PET、FCE口语考试流程、评分标准、题型结构。了解剑桥英语口语考试评分维度，掌握考试要点，助你顺利通关！" 
        />
        <meta 
          name="keywords" 
          content="KET口语考试流程,PET口语评分标准,FCE口语考试介绍,剑桥英语口语考试,口语考试评分,KET PET FCE考试" 
        />
        <link rel="canonical" href="https://www.qtoplay.com/home/intro" />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="KET/PET/FCE口语考试介绍 - SpeakCube" />
        <meta property="og:description" content="详细介绍KET、PET、FCE口语考试流程、评分标准、题型结构" />
        <meta property="og:url" content="https://www.qtoplay.com/home/intro" />
        <meta property="og:image" content="https://www.qtoplay.com/og-image-exam-intro.jpg" />

        {/* Schema.org 结构化数据 - Article */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "KET/PET/FCE 口语考试介绍 - 考试流程与评分标准",
            "description": "详细介绍 KET、PET、FCE 口语考试流程、评分标准、题型结构。了解剑桥英语口语考试评分维度，掌握考试要点，助你顺利通关！",
            "author": {
              "@type": "Organization",
              "name": "SpeakCube",
              "url": "https://www.qtoplay.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SpeakCube",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.qtoplay.com/logo.png"
              }
            },
            "datePublished": "2024-01-01",
            "dateModified": "2026-03-06",
            "url": "https://www.qtoplay.com/home/intro",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.qtoplay.com/home/intro"
            },
            "articleSection": "考试介绍",
            "keywords": ["KET 口语考试", "PET 口语考试", "FCE 口语考试", "剑桥英语", "口语评分标准"],
            "wordCount": 2500,
            "inLanguage": "zh-CN"
          })}
        </script>

        {/* Schema.org 结构化数据 - FAQPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "KET 口语考试难吗？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "KET 口语考试是剑桥英语 A2 级别考试，难度适中。考试分为两个部分：自我介绍和问答环节。只要平时多练习，掌握基本口语表达，通过考试并不困难。"
                }
              },
              {
                "@type": "Question",
                "name": "PET 口语考试评分标准是什么？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PET 口语考试从语法与词汇、话语组织、发音、互动交流四个维度进行评分，每个维度满分 5 分，总分 20 分。"
                }
              },
              {
                "@type": "Question",
                "name": "FCE 口语考试有哪些题型？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FCE 口语考试包含 4 个部分：面试问答、个人陈述、双向协作任务、深入讨论。考试时长约 14 分钟。"
                }
              }
            ]
          })}
        </script>
      </Helmet>

      {/* 顶部导航栏 */}
      <div className="exam-intro-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => history.back()}
          size="large"
        >
          返回
        </Button>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
          KET/PET/FCE口语考试介绍
        </h1>
        <div style={{ width: 80 }} /> {/* 占位，保持标题居中 */}
      </div>

      <div className="exam-intro-content">
        {/* 考试基本信息卡片 */}
        <Card className="info-card" bordered={false}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="card-header">
              <TrophyOutlined className="header-icon" />
              <Title level={3}>KET/PET/FCE考试基本信息</Title>
            </div>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <div className="info-icon">
                    <ClockCircleOutlined />
                  </div>
                  <div className="info-content">
                    <Text type="secondary">考试时长</Text>
                    <Title level={4}>约 14 分钟</Title>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <div className="info-icon">
                    <TeamOutlined />
                  </div>
                  <div className="info-content">
                    <Text type="secondary">考试形式</Text>
                    <Title level={4}>双人对话</Title>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <div className="info-icon">
                    <CheckCircleOutlined />
                  </div>
                  <div className="info-content">
                    <Text type="secondary">考试结构</Text>
                    <Title level={4}>4 个部分</Title>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <div className="info-icon">
                    <TrophyOutlined />
                  </div>
                  <div className="info-content">
                    <Text type="secondary">满分</Text>
                    <Title level={4}>60 分</Title>
                  </div>
                </div>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* 考试流程卡片 */}
        <Card className="flow-card" bordered={false}>
          <div className="card-header">
            <ClockCircleOutlined className="header-icon" />
            <Title level={3}>口语考试流程与步骤</Title>
          </div>
          
          <Paragraph className="flow-description">
            你将与另一位考生（可能是两位考生）共同参加口语测试。考场有两位考官：一位会与你和搭档交流，另一位负责旁听，两位考官都会打分。
          </Paragraph>

          <Timeline className="exam-timeline">
            <Timeline.Item 
              dot={<div className="timeline-dot">1</div>}
              color="blue"
            >
              <div className="timeline-content">
                <div className="timeline-header">
                  <Title level={4}>第一部分</Title>
                  <Tag color="blue">2 分钟</Tag>
                  <Tag color="cyan">三人组 3 分钟</Tag>
                </div>
                <Paragraph>
                  考官会向你和搭档询问关于你们自身的问题，例如：
                </Paragraph>
                <ul className="topic-list">
                  <li>你的家乡</li>
                  <li>你的兴趣爱好</li>
                  <li>你的职业规划</li>
                </ul>
              </div>
            </Timeline.Item>

            <Timeline.Item 
              dot={<div className="timeline-dot">2</div>}
              color="green"
            >
              <div className="timeline-content">
                <div className="timeline-header">
                  <Title level={4}>第二部分</Title>
                  <Tag color="green">4 分钟</Tag>
                  <Tag color="lime">三人组 6 分钟</Tag>
                </div>
                <Paragraph>
                  <strong>你的回合：</strong>考官会给你两张照片，要求你围绕照片发言 1 分钟；随后考官会向你的搭档提问关于这两张照片的问题，搭档需简要作答。
                </Paragraph>
                <Paragraph>
                  <strong>搭档的回合：</strong>考官会给你的搭档两张不同的照片，搭档围绕这些照片发言 1 分钟；这次考官会向你提问关于搭档照片的问题，你需简要作答。
                </Paragraph>
              </div>
            </Timeline.Item>

            <Timeline.Item 
              dot={<div className="timeline-dot">3</div>}
              color="orange"
            >
              <div className="timeline-content">
                <div className="timeline-header">
                  <Title level={4}>第三部分</Title>
                  <Tag color="orange">4 分钟</Tag>
                  <Tag color="gold">三人组 5 分钟</Tag>
                </div>
                <Paragraph>
                  考官会让你和搭档进行讨论：他们会给出一个任务，你需要思考并围绕某个观点展开讨论，同时说明自己观点的理由。
                </Paragraph>
                <Paragraph>
                  <strong>讨论话题示例：</strong>
                </Paragraph>
                <ul className="topic-list">
                  <li>世界上的一些变化</li>
                  <li>与家人共度闲暇时光</li>
                </ul>
                <Paragraph>
                  你和搭档围绕任务讨论约 2 分钟后，考官会提出一个后续问题，你们需再讨论 1 分钟。
                </Paragraph>
              </div>
            </Timeline.Item>

            <Timeline.Item 
              dot={<div className="timeline-dot">4</div>}
              color="purple"
            >
              <div className="timeline-content">
                <div className="timeline-header">
                  <Title level={4}>第四部分</Title>
                  <Tag color="purple">4 分钟</Tag>
                  <Tag color="magenta">三人组 6 分钟</Tag>
                </div>
                <Paragraph>
                  考官会提出更多问题，围绕第三部分的讨论内容展开更深入的交流。你可以根据意愿对搭档的回答发表看法。
                </Paragraph>
              </div>
            </Timeline.Item>
          </Timeline>
        </Card>

        {/* 评分维度卡片 */}
        <Card className="scoring-card" bordered={false}>
          <div className="card-header">
            <TrophyOutlined className="header-icon" />
            <Title level={3}>剑桥英语口语评分标准</Title>
          </div>

          <Paragraph className="scoring-description">
            考试共有 5 项评分维度，满分 60 分
          </Paragraph>

          <div className="scoring-items">
            <div className="scoring-item">
              <div className="scoring-header">
                <div className="scoring-number">1</div>
                <div className="scoring-title">
                  <Title level={4}>语法与词汇</Title>
                  <Text type="secondary">Grammar and Vocabulary</Text>
                </div>
                <Tag color="blue">满分 5 分 × 2</Tag>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <ul className="scoring-points">
                <li><strong>语法准确度：</strong>用正确语法结构表意</li>
                <li><strong>词汇运用：</strong>词汇广泛准确、灵活表达观点</li>
              </ul>
            </div>

            <div className="scoring-item">
              <div className="scoring-header">
                <div className="scoring-number">2</div>
                <div className="scoring-title">
                  <Title level={4}>话语组织</Title>
                  <Text type="secondary">Discourse Management</Text>
                </div>
                <Tag color="green">满分 5 分 × 2</Tag>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <ul className="scoring-points">
                <li><strong>主题关联性：</strong>内容紧扣主题</li>
                <li><strong>连贯流畅：</strong>用连接词 / 过渡句保持语言流畅</li>
              </ul>
            </div>

            <div className="scoring-item">
              <div className="scoring-header">
                <div className="scoring-number">3</div>
                <div className="scoring-title">
                  <Title level={4}>发音</Title>
                  <Text type="secondary">Pronunciation</Text>
                </div>
                <Tag color="orange">满分 5 分 × 2</Tag>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <ul className="scoring-points">
                <li><strong>清晰度和准确度：</strong>发音清晰、无明显错误</li>
                <li><strong>语调和韵律：</strong>语调自然、语速适中、有韵律感</li>
              </ul>
            </div>

            <div className="scoring-item">
              <div className="scoring-header">
                <div className="scoring-number">4</div>
                <div className="scoring-title">
                  <Title level={4}>互动交流</Title>
                  <Text type="secondary">Interactive Communication</Text>
                </div>
                <Tag color="purple">满分 5 分 × 2</Tag>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <ul className="scoring-points">
                <li><strong>主动交流：</strong>积极参与对话、提问 / 回应</li>
                <li><strong>维持展开交流：</strong>通过有效交流达成共识</li>
              </ul>
            </div>

            <div className="scoring-item highlight">
              <div className="scoring-header">
                <div className="scoring-number">5</div>
                <div className="scoring-title">
                  <Title level={4}>整体表现</Title>
                  <Text type="secondary">Overall Performance</Text>
                </div>
                <Tag color="red">满分 5 分 × 4</Tag>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <ul className="scoring-points">
                <li><strong>综合表现：</strong>涵盖流利度、语言组织能力、互动效果</li>
              </ul>
            </div>
          </div>

          <Divider />

          <div className="scoring-formula">
            <Title level={4}>评分方式</Title>
            <div className="formula-items">
              <div className="formula-item">
                <Text strong>前 4 项：</Text>
                <Text>每项满分 5 分，<Text mark>× 2</Text> 计入总分</Text>
              </div>
              <div className="formula-item">
                <Text strong>整体表现：</Text>
                <Text>满分 5 分，<Text mark>× 4</Text> 计入总分</Text>
              </div>
              <div className="formula-item total">
                <Text strong>总分：</Text>
                <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>60 分</Title>
              </div>
            </div>
          </div>
        </Card>

        {/* 底部操作按钮 */}
        <div className="exam-intro-footer">
          <Button size="large" onClick={() => history.back()}>
            返回首页
          </Button>
          <Button type="primary" size="large" onClick={() => history.push('/exam-catalog')}>
            开始练习
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamIntro;
