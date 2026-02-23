import React from 'react';
import { Card, Typography, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import ExamAreaLayout from '../components/ExamAreaLayout';
import PageSEO from '../components/PageSEO';
import { EXAM_CONFIGS } from '../types';
import './pages.less';

const { Title, Paragraph, Text } = Typography;

/**
 * PET考试介绍页面
 */
const PETIntro: React.FC = () => {
  const config = EXAM_CONFIGS.PET;

  return (
    <ExamAreaLayout examType="PET">
      <PageSEO seo={config.pages.intro} examType="PET" />
      <div className="exam-info-page">
        <Card className="info-card">
          <Title level={2}>
            <TrophyOutlined /> PET考试介绍
          </Title>
          
          <Divider />

          <Title level={3}>什么是PET考试？</Title>
          <Paragraph>
            PET（Preliminary English Test）是剑桥英语五级证书考试中的第二级，对应欧洲语言共同参考框架（CEFR）的B1级别。
            它证明你已掌握英语基础知识，能够在工作、学习和旅行中运用日常书面和口头英语。
          </Paragraph>

          <Title level={3}>
            <CheckCircleOutlined /> 考试内容
          </Title>
          <Paragraph>
            PET考试包含四个部分：
          </Paragraph>
          <ul className="info-list">
            <li><Text strong>阅读</Text>（45分钟）：包括6个部分，32道题</li>
            <li><Text strong>写作</Text>（45分钟）：包括2个部分</li>
            <li><Text strong>听力</Text>（30分钟）：包括4个部分，25道题</li>
            <li><Text strong>口语</Text>（10-12分钟）：包括4个部分，与另一位考生配对进行</li>
          </ul>

          <Title level={3}>
            <ClockCircleOutlined /> 口语考试流程
          </Title>
          <Paragraph>
            PET口语考试采用面对面交流形式，时长约10-12分钟：
          </Paragraph>
          <ul className="info-list">
            <li><Text strong>Part 1</Text>（2-3分钟）：考官提问，考生回答个人信息相关问题</li>
            <li><Text strong>Part 2</Text>（2-3分钟）：独立陈述，根据图片提示进行描述</li>
            <li><Text strong>Part 3</Text>（3-4分钟）：看图讨论，与搭档共同完成任务</li>
            <li><Text strong>Part 4</Text>（3-4分钟）：深入讨论Part 3的话题</li>
          </ul>

          <Title level={3}>适合人群</Title>
          <Paragraph>
            PET考试特别适合：
          </Paragraph>
          <ul className="info-list">
            <li>10-14岁的中学生</li>
            <li>英语学习2-3年的中级学习者</li>
            <li>已通过KET，希望进一步提升的学生</li>
            <li>需要B1级别英语能力证明的学习者</li>
          </ul>

          <Title level={3}>考试成绩</Title>
          <Paragraph>
            PET考试总分为150分，成绩分为五个等级：
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
            SpeakCube AI口语练习平台为PET考生提供：
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

export default PETIntro;
