import React from 'react';

// 定义不显示侧边栏的布局
const RechargeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default RechargeLayout;