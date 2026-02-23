import React from 'react';
import { Card, Typography, Divider, Table, Tag } from 'antd';
import { StarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ExamAreaLayout from '../components/ExamAreaLayout';
import PageSEO from '../components/PageSEO';
import { EXAM_CONFIGS } from '../types';
import './pages.less';

const { Title, Paragraph, Text } = Typography;

/**
 * KET评分标准页面
 */
const KETScoring: React.FC = () => {
  const config = EXAM_CONFIGS.KET;
  // 口语评分标准
  const scoringCriteria = [
    {
      key: '1',
      category: '语法和词汇',
      weight: '25%',
      description: '使用基础语法结构和词汇的准确性',
      excellent: '能够正确使用基础语法和词汇，偶有小错',
      good: '大部分能正确使用，有一些错误但不影响理解',
      pass: '基本能使用简单语法和词汇，虽有较多错误'
    },
    {
      key: '2',
      category: '发音',
      weight: '25%',
      description: '语音清晰度和语调准确性',
      excellent: '发音清晰，语调自然，易于理解',
      good: '发音基本清晰，偶有不标准但不影响理解',
      pass: '发音可理解，虽然有明显口音'
    },
    {
      key: '3',
      category: '互动交流',
      weight: '25%',
      description: '参与对话和回应的能力',
      excellent: '能够主动参与，回应及时且适当',
      good: '能够参与对话，回应基本适当',
      pass: '能够简单回应，但需要帮助'
    },
    {
      key: '4',
      category: '整体表现',
      weight: '25%',
      description: '完成交际任务的整体能力',
      excellent: '能够有效完成所有交际任务',
      good: '能够完成大部分交际任务',
      pass: '能够完成基本交际任务'
    }
  ];

  const columns = [
    {
      title: '评分项',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 80,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '评分说明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const detailColumns = [
    {
      title: '优秀（5分）',
      dataIndex: 'excellent',
      key: 'excellent',
    },
    {
      title: '良好（3-4分）',
      dataIndex: 'good',
      key: 'good',
    },
    {
      title: '及格（1-2分）',
      dataIndex: 'pass',
      key: 'pass',
    },
  ];

  return (
    <ExamAreaLayout examType="KET">
      <PageSEO seo={config.pages.scoring} examType="KET" />
      <div className="exam-info-page">
        <Card className="info-card">
          <Title level={2}>
            <StarOutlined /> KET口语评分标准
          </Title>
          
          <Divider />

          <Title level={3}>评分维度概览</Title>
          <Paragraph>
            KET口语考试从四个维度进行评分，每个维度占25%，满分为5分：
          </Paragraph>
          
          <Table 
            dataSource={scoringCriteria} 
            columns={columns}
            pagination={false}
            className="scoring-table"
          />

          <Divider />

          <Title level={3}>详细评分标准</Title>
          
          <Table 
            dataSource={scoringCriteria} 
            columns={detailColumns}
            pagination={false}
            className="scoring-detail-table"
          />

          <Divider />

          <Title level={3}>
            <CheckCircleOutlined /> 评分等级说明
          </Title>
          
          <div className="grade-section">
            <Title level={4}>优秀（Grade A: 5分）</Title>
            <ul className="info-list">
              <li>能够使用正确的语法和丰富的词汇</li>
              <li>发音清晰，语调自然流畅</li>
              <li>能够主动参与对话，回应得体</li>
              <li>完全理解问题并给出完整回答</li>
            </ul>

            <Title level={4}>良好（Grade B/C: 3-4分）</Title>
            <ul className="info-list">
              <li>能够使用基础语法，偶有错误</li>
              <li>发音基本清晰，可以理解</li>
              <li>能够参与对话，基本能回应</li>
              <li>理解大部分问题并尝试回答</li>
            </ul>

            <Title level={4}>及格（1-2分）</Title>
            <ul className="info-list">
              <li>语法和词汇有较多错误但可理解</li>
              <li>发音虽有口音但基本可懂</li>
              <li>需要帮助才能参与对话</li>
              <li>能够简单回应基本问题</li>
            </ul>

            <Title level={4}>未达标（0分）</Title>
            <ul className="info-list">
              <li>几乎无法使用英语交流</li>
              <li>发音难以理解</li>
              <li>无法参与对话或回应问题</li>
            </ul>
          </div>

          <Divider />

          <Title level={3}>SpeakCube AI评分优势</Title>
          <Paragraph>
            SpeakCube使用先进的AI技术，能够：
          </Paragraph>
          <ul className="info-list">
            <li>✅ 实时评估发音准确性和流利度</li>
            <li>✅ 分析语法使用和词汇丰富度</li>
            <li>✅ 提供详细的改进建议</li>
            <li>✅ 追踪学习进度和薄弱环节</li>
            <li>✅ 模拟真实考试评分标准</li>
          </ul>
        </Card>
      </div>
    </ExamAreaLayout>
  );
};

export default KETScoring;
