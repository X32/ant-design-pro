import React, { useEffect } from 'react';

const ErrorTestPage: React.FC = () => {
  useEffect(() => {
    // 添加全局错误处理
    const handleError = (event: ErrorEvent) => {
      console.error('捕获到错误:', event.error);
      alert(`捕获到错误: ${event.error.message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('捕获到未处理的 Promise 拒绝:', event.reason);
      alert(`捕获到未处理的 Promise 拒绝: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 记录页面加载
    console.log('错误测试页面已加载');
    alert('错误测试页面已加载');

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1890ff' }}>错误测试页面</h1>
      <div style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '6px' }}>
        <p>这是一个错误测试页面，用于检查是否有任何 JavaScript 错误。</p>
        <p>如果您看到这个消息，说明基本的 React 组件渲染是正常的。</p>
        <p>如果您看到弹窗，说明 JavaScript 执行也是正常的。</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
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
            cursor: 'pointer'
          }}
        >
          测试按钮
        </button>
      </div>
    </div>
  );
};

export default ErrorTestPage;