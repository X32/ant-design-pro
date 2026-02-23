import React from 'react';
import { Card, Typography, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import ExamAreaLayout from '../components/ExamAreaLayout';
import PageSEO from '../components/PageSEO';
import { EXAM_CONFIGS } from '../types';
import './pages.less';

const { Title, Paragraph, Text } = Typography;

/**
 * KET考试介绍页面
 */
const KETIntro: React.FC = () => {
  const config = EXAM_CONFIGS.KET;

  return (
    <ExamAreaLayout examType="KET">
      <PageSEO seo={config.pages.intro} examType="KET" />
      <div className="exam-info-page">
        <Card className="info-card">
          <Title level={2}>
            <TrophyOutlined /> KET考试介绍
          </Title>
          
          <Divider />

          <Title level={3}>什么是KET考试？</Title>
          <Paragraph>
            KET（Key English Test）是剑桥英语五级证书考试中的第一级，对应欧洲语言共同参考框架（CEFR）的A2级别。
            它是一项基础英语水平认证，展示了你可以在简单的情景中使用英语进行沟通的能力。
          </Paragraph>

          <Title level={3}>
            <CheckCircleOutlined /> 考试内容
          </Title>
          <Paragraph>
            KET考试包含四个部分：
          </Paragraph>
          <ul className="info-list">
            <li><Text strong>阅读与写作</Text>（1小时10分钟）：包括9个部分，56道题</li>
            <li><Text strong>听力</Text>（30分钟）：包括5个部分，25道题</li>
            <li><Text strong>口语</Text>（8-10分钟）：包括2个部分，与另一位考生配对进行</li>
          </ul>

          <Title level={3}>
            <ClockCircleOutlined /> 口语考试流程
          </Title>
          <Paragraph>
            KET口语考试采用面对面交流形式，时长约8-10分钟：
          </Paragraph>
          <ul className="info-list">
            <li><Text strong>Part 1</Text>（3-4分钟）：考官提问，考生回答个人信息相关问题</li>
            <li><Text strong>Part 2</Text>（5-6分钟）：看图说话，考生需要根据提示卡进行讨论</li>
          </ul>

          <Title level={3}>适合人群</Title>
          <Paragraph>
            KET考试特别适合：
          </Paragraph>
          <ul className="info-list">
            <li>6-10岁的小学生</li>
            <li>英语学习1-2年的初学者</li>
            <li>希望为PET考试打好基础的学生</li>
            <li>需要基础英语能力证明的学习者</li>
          </ul>

          <Title level={3}>考试成绩</Title>
          <Paragraph>
            KET考试总分为150分，成绩分为五个等级：
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
            SpeakCube AI口语练习平台为KET考生提供：
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

export default KETIntro;
