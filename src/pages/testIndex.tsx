import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { history } from '@umijs/max';

const TestIndex: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  // 点击按钮进入登录页面
  const handleLoginClick = () => {
    history.push('/user/login');
  };

  // 点击按钮弹出测试模态框
  const handleTestClick = () => {
    history.push('/TTsPage');
    // setModalVisible(true);TTsPage
  };
  const handleTestClick1 = () => {
    history.push('/testShowPaqe');
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
      <Button type="primary" onClick={handleLoginClick}>
        进入登录页面
      </Button>
      <Button type="default" onClick={handleTestClick}>
        测试按钮
      </Button>
       <Button type="default" onClick={handleTestClick1}>
        测试按钮1
      </Button>
      <Modal
        title="提示"
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="ok" type="primary" onClick={handleModalClose}>
            确定
          </Button>,
        ]}
      >
        <p>测试中</p>
      </Modal>
    </div>
  );
};

export default TestIndex;