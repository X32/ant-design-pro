import React, { useState } from 'react';
import { Card, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { FAQItem } from '../types';
import './FAQSection.less';

const { Panel } = Collapse;

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

/**
 * FAQ 常见问题组件
 * 支持手风琴式展开/收起，SEO友好
 */
const FAQSection: React.FC<FAQSectionProps> = ({ faqs, title = '常见问题' }) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const handleChange = (keys: string | string[]) => {
    setActiveKeys(Array.isArray(keys) ? keys : [keys]);
  };

  return (
    <Card className="faq-section-card">
      <div className="faq-header">
        <QuestionCircleOutlined className="faq-icon" />
        <h2 className="faq-title">{title}</h2>
      </div>
      <Collapse
        activeKey={activeKeys}
        onChange={handleChange}
        className="faq-collapse"
        ghost
      >
        {faqs.map((faq, index) => (
          <Panel
            header={<span className="faq-question">{faq.question}</span>}
            key={index.toString()}
            className="faq-panel"
          >
            <p className="faq-answer">{faq.answer}</p>
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

export default FAQSection;
