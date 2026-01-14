import React from 'react';
import { Card, Space, Divider } from 'antd';
import AudioRecorder from './AudioRecorder';
import AudioRecorderMinimal from './AudioRecorderMinimal';
import AudioRecorderInline from './AudioRecorderInline';

/**
 * 录音组件使用示例
 * 展示如何使用原始组件和新的极简样式组件
 */
const AudioRecorderExample: React.FC = () => {
  const handleFinish = (filePath: string, audioBlob: Blob) => {
    console.log('录音完成:', filePath);
    console.log('音频数据大小:', audioBlob.size);
  };

  const handleCancel = () => {
    console.log('取消录音');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>录音组件样式对比</h1>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 原始样式 */}
        <Card title="原始样式 - AudioRecorder" bordered>
          <AudioRecorder
            maxDuration={60}
            onFinish={handleFinish}
            onCancel={handleCancel}
          />
        </Card>

        <Divider />

        {/* 极简样式 */}
        <Card title="极简样式 - AudioRecorderMinimal" bordered>
          <AudioRecorderMinimal
            maxDuration={60}
            onFinish={handleFinish}
            onCancel={handleCancel}
          />
        </Card>

        <Divider />

        {/* 内联样式 */}
        <Card title="内联样式 - AudioRecorderInline（用于SpokenPractice底部）" bordered>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <AudioRecorderInline
              maxDuration={60}
              onFinish={handleFinish}
              onCancel={handleCancel}
            />
          </div>
        </Card>

        <Divider />

        {/* 弹框模式对比 */}
        <Card title="弹框模式对比" bordered>
          <Space size="large">
            <AudioRecorder
              modalMode={true}
              maxDuration={60}
              onFinish={handleFinish}
              onCancel={handleCancel}
            />
            
            <AudioRecorderMinimal
              modalMode={true}
              maxDuration={60}
              onFinish={handleFinish}
              onCancel={handleCancel}
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default AudioRecorderExample;
