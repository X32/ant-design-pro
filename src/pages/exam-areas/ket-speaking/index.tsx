import React, { useState } from 'react';
import { Tabs, Button, Space } from 'antd';
import { EditOutlined, TrophyOutlined, BookOutlined, StarOutlined, BulbOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import ExamAreaLayout from '../components/ExamAreaLayout';
import PaperList from '../components/PaperList';
import ExamPaperList from '../components/ExamPaperList';
import FAQSection from '../components/FAQSection';
import { EXAM_CONFIGS } from '../types';

/**
 * KET口语考试专区页面
 */
const KETSpeakingArea: React.FC = () => {
  const config = EXAM_CONFIGS.KET;
  const [activeTab, setActiveTab] = useState('practice');

  // 导航按钮
  const infoButtons = (
    <Space size="middle" style={{ marginBottom: 16 }}>
      <Button
        icon={<BookOutlined />}
        onClick={() => history.push('/ket-speaking/intro')}
      >
        考试介绍
      </Button>
      <Button
        icon={<StarOutlined />}
        onClick={() => history.push('/ket-speaking/scoring')}
      >
        评分标准
      </Button>
      <Button
        icon={<BulbOutlined />}
        onClick={() => history.push('/ket-speaking/tips')}
      >
        备考攻略
      </Button>
    </Space>
  );

  const tabItems = [
    {
      key: 'practice',
      label: (
        <span className="large-tab-label important-tab">
          <EditOutlined />
          真题练习
        </span>
      ),
      children: (
        <PaperList
          categoryId={config.categoryId}
          examType="KET"
          pageSize={20}
        />
      ),
    },
    {
      key: 'exam',
      label: (
        <span className="large-tab-label important-tab">
          <TrophyOutlined />
          真题模拟考试
        </span>
      ),
      children: (
        <ExamPaperList
          categoryId={config.categoryId}
          examType="KET"
          pageSize={20}
        />
      ),
    },
  ];

  return (
    <ExamAreaLayout examType="KET">
      <div className="tabs-container">
        <div className="info-buttons">
          {infoButtons}
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </div>

      {/* FAQ 常见问题 */}
      <FAQSection faqs={config.faqs} title="KET口语常见问题" />
    </ExamAreaLayout>
  );
};

export default KETSpeakingArea;
