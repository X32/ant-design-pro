import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography } from 'antd';
import React from 'react';

const NewAdminSubPage: React.FC = () => {
  return (
    <PageContainer
      content="新二级管理页面"
    >
      <Card>
        <Typography.Title level={2} style={{ textAlign: 'center' }}>
          <UserOutlined /> 新二级管理页面
        </Typography.Title>
        <Typography.Paragraph>
          这是一个新添加的管理员子页面。
        </Typography.Paragraph>
        <SettingOutlined style={{ fontSize: 48, display: 'block', margin: '20px auto', textAlign: 'center' }} />
      </Card>
    </PageContainer>
  );
};

export default NewAdminSubPage;