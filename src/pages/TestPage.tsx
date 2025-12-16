import React, { useEffect, useState } from 'react';

const TestPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    setMounted(true);
    console.log('测试页面已挂载');
    
    // 每秒更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => {
      clearInterval(timer);
      console.log('测试页面已卸载');
    };
  }, []);

  return (
    <div style={{ 
      padding: '24px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#1890ff', textAlign: 'center' }}>测试页面</h1>
        
        <div style={{ 
          backgroundColor: mounted ? '#f6ffed' : '#fff2e8',
          border: `1px solid ${mounted ? '#b7eb8f' : '#ffbb96'}`,
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ 
            color: mounted ? '#52c41a' : '#fa8c16',
            fontWeight: 'bold'
          }}>
            {mounted ? '✓ 页面已成功挂载' : '○ 页面正在加载...'}
          </p>
          <p>如果您能看到这个消息，说明基本的 React 组件渲染是正常的。</p>
        </div>
        
        <div style={{
          backgroundColor: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p>当前时间: {currentTime}</p>
          <p>页面状态: {mounted ? '已挂载' : '未挂载'}</p>
        </div>
        
        <button 
          onClick={() => {
            console.log('按钮点击测试');
            alert('按钮点击测试成功');
          }}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#1890ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          测试按钮
        </button>
        
        <button 
          onClick={() => {
            setMounted(!mounted);
          }}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#52c41a', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          切换状态
        </button>
      </div>
    </div>
  );
};

export default TestPage;