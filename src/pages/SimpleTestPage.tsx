import React from 'react';
import { Card } from 'antd';

const SimpleTestPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="简单测试页面" bordered={false}>
        <p>这是一个简单的测试页面，用于检查基本渲染是否正常。</p>
        <p>如果您能看到这个页面，说明基本的 React 组件渲染是正常的。</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </Card>
    </div>
  );
};

export default SimpleTestPage;