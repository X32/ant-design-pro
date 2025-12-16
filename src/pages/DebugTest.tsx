import React from 'react';
import { Card, Typography, Button, Space, Alert } from 'antd';

const { Title, Paragraph } = Typography;

const DebugTestPage: React.FC = () => {
  console.log('DebugTestPage 组件已渲染');
  console.log('当前时间:', new Date().toLocaleString());
  
  React.useEffect(() => {
    console.log('DebugTestPage useEffect 执行');
    window.addEventListener('error', (event) => {
      console.error('全局错误:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的 Promise 拒绝:', event.reason);
    });
    
    return () => {
      console.log('DebugTestPage 清理函数执行');
    };
  }, []);
  
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>调试测试页面</Title>
      
      <Alert
        message="调试信息"
        description="请打开浏览器控制台，查看是否有任何错误信息或日志输出。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Card title="测试信息" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <p>如果您能看到这个页面，说明：</p>
          <p>1. 路由配置正确</p>
          <p>2. 组件渲染正常</p>
          <p>3. 样式加载成功</p>
          <p>4. React 生命周期正常</p>
          <Button 
            type="primary" 
            onClick={() => {
              console.log('按钮点击事件触发');
              alert('按钮点击正常');
            }}
          >
            点击测试
          </Button>
        </Space>
      </Card>
      
      <Card title="环境信息" style={{ marginTop: 16 }}>
        <p>用户代理: {navigator.userAgent}</p>
        <p>当前 URL: {window.location.href}</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </Card>
    </div>
  );
};

export default DebugTestPage;