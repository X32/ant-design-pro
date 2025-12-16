import React from 'react';
import { Card, Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

const AudioTest: React.FC = () => {
  console.log('AudioTest 组件已渲染');
  
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>AudioTest 简单测试页面</Title>
      <Paragraph>
        这是一个简单的音频测试页面，放在pages根目录。
      </Paragraph>
      
      <Card title="测试页面" style={{ marginTop: 16 }}>
        <p>如果您能看到这个页面，说明路由配置是正确的。</p>
        <Button type="primary">测试按钮</Button>
      </Card>
    </div>
  );
};

export default AudioTest;
