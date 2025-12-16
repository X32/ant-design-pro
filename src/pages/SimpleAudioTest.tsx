import React from 'react';
import { Button } from 'antd';

const SimpleAudioTest: React.FC = () => {
  console.log('SimpleAudioTest 页面已加载');
  
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#1890ff', marginBottom: '20px' }}>测试页面</h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>这是一个简单的测试页面</p>
      <Button type="primary" size="large">
        点击测试
      </Button>
    </div>
  );
};

export default SimpleAudioTest;
