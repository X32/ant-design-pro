import React, { useState } from 'react';
import { Button, Card, Tabs, Space, Alert } from 'antd';
import { AudioOutlined, PlayCircleOutlined, UploadOutlined } from '@ant-design/icons';
import AudioRecorder from './index';

const { TabPane } = Tabs;

const AudioRecorderExample: React.FC = () => {
  const [recorderVisible, setRecorderVisible] = useState(false);
  const [recordedFile, setRecordedFile] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // 处理内联模式录音完成
  const handleInlineComplete = (filePath: string) => {
    console.log('内联模式录音完成，文件路径：', filePath);
    setRecordedFile(filePath);
    setUploadStatus('idle');
  };

  // 处理弹框模式录音完成
  const handleModalComplete = (filePath: string) => {
    console.log('弹框模式录音完成，文件路径：', filePath);
    setRecordedFile(filePath);
    setUploadStatus('idle');
    setRecorderVisible(false);
  };

  // 打开录音弹框
  const openRecorderModal = () => {
    setRecorderVisible(true);
  };

  // 关闭录音弹框
  const closeRecorderModal = () => {
    setRecorderVisible(false);
  };

  // 模拟上传录音文件
  const simulateUpload = () => {
    if (!recordedFile) return;

    setUploadStatus('uploading');

    // 模拟上传延迟
    setTimeout(() => {
      // 模拟上传成功
      setUploadStatus('success');

      // 3秒后重置状态
      setTimeout(() => {
        setUploadStatus('idle');
        setRecordedFile(null);
      }, 3000);
    }, 2000);
  };

  // 播放录音
  const playRecording = () => {
    if (recordedFile) {
      const audio = new Audio(recordedFile);
      audio.play();
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>音频录音组件示例</h1>

      <Tabs defaultActiveKey="1" type="card">
        {/* 内联模式示例 */}
        <TabPane tab="内联模式" key="1">
          <Card>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              内联模式下，录音组件直接嵌入到页面中，用户可以直接进行录音操作。
            </p>

            {/* 内联模式录音组件 */}
            <AudioRecorder
              maxDuration={120} // 设置最大录音时长为 120 秒
              mode="inline"
              onComplete={handleInlineComplete}
            />

            {/* 录音结果处理 */}
            {recordedFile && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f0f5ff', borderRadius: '4px' }}>
                <h4>录音完成</h4>
                <Space>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={playRecording}
                  >
                    播放录音
                  </Button>

                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={simulateUpload}
                    loading={uploadStatus === 'uploading'}
                    disabled={uploadStatus !== 'idle'}
                  >
                    {uploadStatus === 'success' ? '上传成功' : '上传录音'}
                  </Button>
                </Space>

                {uploadStatus === 'success' && (
                  <Alert
                    message="上传成功"
                    description="录音文件已成功上传到服务器"
                    type="success"
                    showIcon
                    style={{ marginTop: '12px' }}
                  />
                )}
              </div>
            )}
          </Card>
        </TabPane>

        {/* 弹框模式示例 */}
        <TabPane tab="弹框模式" key="2">
          <Card>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              弹框模式下，录音组件隐藏在弹框中，用户需要点击按钮打开弹框进行录音操作。
            </p>

            {/* 打开录音弹框的按钮 */}
            <Button
              type="primary"
              size="large"
              icon={<AudioOutlined />}
              onClick={openRecorderModal}
              style={{ marginBottom: '20px' }}
            >
              打开录音弹框
            </Button>

            {/* 弹框模式录音组件 */}
            <AudioRecorder
              maxDuration={60} // 设置最大录音时长为 60 秒（默认值）
              visible={recorderVisible}
              mode="modal"
              onCancel={closeRecorderModal}
              onComplete={handleModalComplete}
            />

            {/* 录音结果处理 */}
            {recordedFile && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f0f5ff', borderRadius: '4px' }}>
                <h4>录音完成</h4>
                <Space>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={playRecording}
                  >
                    播放录音
                  </Button>

                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={simulateUpload}
                    loading={uploadStatus === 'uploading'}
                    disabled={uploadStatus !== 'idle'}
                  >
                    {uploadStatus === 'success' ? '上传成功' : '上传录音'}
                  </Button>
                </Space>

                {uploadStatus === 'success' && (
                  <Alert
                    message="上传成功"
                    description="录音文件已成功上传到服务器"
                    type="success"
                    showIcon
                    style={{ marginTop: '12px' }}
                  />
                )}
              </div>
            )}
          </Card>
        </TabPane>

        {/* 功能说明 */}
        <TabPane tab="功能说明" key="3">
          <Card>
            <h3>主要功能</h3>
            <ul style={{ lineHeight: '1.8', color: '#666' }}>
              <li><strong>长按录音</strong>：长按录音按钮开始录音，松手自动暂停</li>
              <li><strong>分段录制</strong>：支持多次长按-松手的分段录音，自动保存每段录音数据</li>
              <li><strong>进度可视化</strong>：录音时显示实时进度条，同步展示当前录音时长、最大录音时长和总时长</li>
              <li><strong>配置灵活</strong>：支持自定义最大录音时长（默认 60 秒）</li>
              <li><strong>操作便捷</strong>：提供取消录音和完成录音按钮，按钮状态随录音状态动态变化</li>
              <li><strong>提示友好</strong>：录音完成、取消、权限拒绝时显示浮动提示</li>
              <li><strong>模式多样</strong>：支持内联模式和弹框模式两种使用方式</li>
            </ul>

            <h3>技术特点</h3>
            <ul style={{ lineHeight: '1.8', color: '#666' }}>
              <li>使用 Web Audio API 和 MediaRecorder API 实现音频录制</li>
              <li>支持回声消除、噪声抑制和自动增益控制</li>
              <li>录制格式为 audio/webm，合并后输出为 audio/wav</li>
              <li>完全适配移动端触摸操作</li>
              <li>使用 TypeScript 开发，类型安全</li>
              <li>基于 Ant Design 组件库，UI 美观</li>
            </ul>

            <h3>浏览器兼容性</h3>
            <ul style={{ lineHeight: '1.8', color: '#666' }}>
              <li>Chrome 49+</li>
              <li>Firefox 25+</li>
              <li>Safari 14+</li>
              <li>Edge 79+</li>
            </ul>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AudioRecorderExample;