import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import { Button, Card, theme } from 'antd';
import React from 'react';

const TestIndex: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
          padding: 24,
        }}
      >
        <Button
          type="primary"
          onClick={() => navigate('/user/login')}
          style={{ marginRight: 16 }}
        >
          Go to Login Page
        </Button>
        <Button
          type="default"
          onClick={() => {
            // Empty for testing
          }}
        >
          Test Button
        </Button>
      </Card>
    </PageContainer>
  );
};

export default TestIndex;
