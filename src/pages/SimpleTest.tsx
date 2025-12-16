import React from 'react';
import { Card, Typography, Button, Space } from 'antd';

const { Title, Paragraph } = Typography;

const SimpleTestPage: React.FC = () => {
  console.log('SimpleTestPage 组件已渲染');
  
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>简单测试页面</Title>
      <Paragraph>
        这是一个完全独立的测试页面，用于验证路由系统是否正常工作。
      </Paragraph>
      
      <Card title="测试信息" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <p>如果您能看到这个页面，说明：</p>
          <p>1. 路由配置正确</p>
          <p>2. 组件渲染正常</p>
          <p>3. 样式加载成功</p>
          <Button type="primary" onClick={() => alert('按钮点击正常')}>
            点击测试
          </Button>
        </Space>
      </Card>
      
      <Card title="控制台测试" style={{ marginTop: 16 }}>
        <p>请打开浏览器控制台，查看是否有 "SimpleTestPage 组件已渲染" 的日志输出。</p>
      </Card>
    </div>
  );
};

export default SimpleTestPage;