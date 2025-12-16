import React from 'react';

const MinimalTestPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1890ff' }}>最小测试页面</h1>
      <div style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '6px' }}>
        <p>这是一个最小的测试页面，不依赖任何外部库。</p>
        <p>如果您能看到这个页面，说明基本的 React 组件渲染是正常的。</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default MinimalTestPage;