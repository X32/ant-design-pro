import React, { useState } from 'react';
import { Button } from 'antd';
import LoginModal from '@/components/LoginModal';

/**
 * LoginModal 组件使用示例
 */
const LoginModalDemo: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button type="primary" onClick={() => setVisible(true)}>
        打开登录弹框
      </Button>

      <LoginModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onSuccess={() => {
          console.log('登录成功');
          // 刷新用户信息等操作
        }}
      />
    </div>
  );
};

export default LoginModalDemo;
