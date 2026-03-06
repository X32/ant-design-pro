/**
 * 动态导入 Loading 组件
 *
 * 用于路由懒加载时显示的加载状态
 */
import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Loading: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 24,
              color: '#1890ff',
            }}
            spin
          />
        }
        size="large"
        tip="加载中..."
      />
    </div>
  );
};

export default Loading;
