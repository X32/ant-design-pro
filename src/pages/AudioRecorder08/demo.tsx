import React, { useState } from 'react';
import { Card, Space, Typography, Alert, Button, message } from 'antd';
import AudioRecorder from './index';
import styles from './demo.less';

const { Title, Paragraph } = Typography;

const AudioRecorderDemo: React.FC = () => {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 处理录音完成回调
  const handleRecordingFinish = (blob: Blob, segments: any[]) => {
    console.log('录音完成：', blob);
    console.log('录音分段：', segments);
    setRecordedBlob(blob);
    
    // 创建音频播放地址
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    message.success('录音完成，可以开始试听');
  };

  return (
    <div className={styles.demoContainer}>
      <Title level={2}>AudioRecorder08 录音组件示例</Title>
      
      <Space direction="vertical" size="large" className={styles.demoSpace}>
        <Card title="嵌入模式" bordered={true}>
          <Paragraph>
            直接将录音组件嵌入到页面中，适用于需要在页面内直接提供录音功能的场景。
          </Paragraph>
          <Alert
            message="使用说明"
            description="长按录音按钮开始录音，松手自动暂停。支持多次分段录音，完成后可下载合并后的完整录音文件。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <AudioRecorder
            maxDuration={120}
            title="嵌入型录音组件"
            onFinish={handleRecordingFinish}
          />
        </Card>

        <Card title="弹框模式" bordered={true}>
          <Paragraph>
            通过触发按钮打开弹框进行录音，适用于需要按需调用录音功能的场景。
          </Paragraph>
          <Alert
            message="使用说明"
            description="点击下方按钮打开录音弹框，长按开始录音，支持分段录制，完成后自动下载录音文件。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <AudioRecorder
            modalMode={true}
            maxDuration={60}
            title="弹框型录音组件"
            onFinish={handleRecordingFinish}
          />
        </Card>

        <Card title="配置参数说明" bordered={true}>
          <ul>
            <li><strong>maxDuration:</strong> 最大录音时长，单位秒，默认60秒</li>
            <li><strong>modalMode:</strong> 是否启用弹框模式，默认false</li>
            <li><strong>title:</strong> 组件标题或弹框标题</li>
            <li><strong>onFinish:</strong> 录音完成回调，返回合并后的Blob文件和分段数据</li>
          </ul>
        </Card>

        {recordedBlob && (
          <Card title="音频试听" bordered={true}>
            <Alert
              message="录音已完成"
              description="您可以试听录制的音频，并选择下载保存"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <audio
                controls
                src={audioUrl || undefined}
                style={{ width: '100%', maxWidth: 400 }}
              >
                您的浏览器不支持音频播放
              </audio>
              <Button
                type="primary"
                onClick={() => {
                  if (!audioUrl) return;
                  const a = document.createElement('a');
                  a.href = audioUrl;
                  a.download = `recording-${Date.now()}.webm`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                下载录音文件
              </Button>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default AudioRecorderDemo;