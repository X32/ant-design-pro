import React from 'react';
import { Card, Typography, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import ExamAreaLayout from '../components/ExamAreaLayout';
import PageSEO from '../components/PageSEO';
import { EXAM_CONFIGS } from '../types';
import './pages.less';

const { Title, Paragraph, Text } = Typography;

/**
 * FCE考试介绍页面
 */
const FCEIntro: React.FC = () => {
  const config = EXAM_CONFIGS.FCE;

  return (
    <ExamAreaLayout examType="FCE">
      <PageSEO seo={config.pages.intro} examType="FCE" />
      <div className="exam-info-page">
        <Card className="info-card">
          <Title level={2}>
            <TrophyOutlined /> FCE考试介绍
          </Title>
          
          <Divider />

          <Title level={3}>什么是FCE考试？</Title>
          <Paragraph>
            FCE（First Certificate in English）是剑桥英语五级证书考试中的第三级，对应欧洲语言共同参考框架（CEFR）的B2级别。
            它证明你可以在工作或学习环境中独立使用书面和口头英语，是全球认可度最高的英语证书之一。
          </Paragraph>

          <Title level={3}>
            <CheckCircleOutlined /> 考试内容
          </Title>
          <Paragraph>
            FCE考试包含四个部分：
          </Paragraph>
          <ul className="info-list">
            <li><Text strong>阅读与语言应用</Text>（1小时15分钟）：包括7个部分，52道题</li>
            <li><Text strong>写作</Text>（1小时20分钟）：包括2个部分</li>
            <li><Text strong>听力</Text>（40分钟）：包括4个部分，30道题</li>
            <li><Text strong>口语</Text>（14分钟）：包括4个部分，与另一位考生配对进行</li>
          </ul>

          <Title level={3}>
            <ClockCircleOutlined /> 口语考试流程
          </Title>
          <Paragraph>
            FCE口语考试采用面对面交流形式，时长约14分钟：
          </Paragraph>
          <ul className="info-list">
            <li><Text strong>Part 1</Text>（2分钟）：考官提问，考生回答个人信息相关问题</li>
            <li><Text strong>Part 2</Text>（4分钟）：个人陈述，每位考生独立描述图片并发表观点（1分钟）</li>
            <li><Text strong>Part 3</Text>（4分钟）：协作任务，两位考生讨论图片并达成共识</li>
            <li><Text strong>Part 4</Text>（4分钟）：深入讨论Part 3的话题，表达个人观点</li>
          </ul>

          <Title level={3}>适合人群</Title>
          <Paragraph>
            FCE考试特别适合：
          </Paragraph>
          <ul className="info-list">
            <li>14岁以上的高中生和大学生</li>
            <li>英语学习3-5年的高级学习者</li>
            <li>已通过PET，希望达到中高级水平的学生</li>
            <li>需要B2级别证书用于升学或就业的学习者</li>
          </ul>

          <Title level={3}>考试成绩</Title>
          <Paragraph>
            FCE考试总分为150分，成绩分为五个等级：
          </Paragraph>
          <ul className="info-list">
            <li><Text strong>Grade A</Text>（140-150分）：优秀，可获得A2 Key证书</li>
            <li><Text strong>Grade B</Text>（133-139分）：良好，可获得A2 Key证书</li>
            <li><Text strong>Grade C</Text>（120-132分）：通过，可获得A2 Key证书</li>
            <li><Text strong>Level A1</Text>（100-119分）：未通过，但达到A1级别</li>
            <li><Text strong>未达标</Text>（0-99分）：未通过</li>
          </ul>

          <Title level={3}>为什么选择SpeakCube？</Title>
          <Paragraph>
            SpeakCube AI口语练习平台为FCE考生提供：
          </Paragraph>
          <ul className="info-list">
            <li>✅ 真题模拟练习，完全还原考试场景</li>
            <li>✅ AI智能评分，即时反馈发音和语法</li>
            <li>✅ 24小时随时练习，不受时间地点限制</li>
            <li>✅ 个性化学习建议，针对性提升薄弱环节</li>
          </ul>
        </Card>
      </div>
    </ExamAreaLayout>
  );
};

export default FCEIntro;
