import React, { useState, useRef } from 'react';
import AudioRecorder from './AudioRecorder';
import { Card, Tabs, Button, Input, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { uploadAudioFile } from '@/services/ant-design-pro/api';
import './index.less';

const { TabPane } = Tabs;

const Example: React.FC = () => {
  const [recordedFile, setRecordedFile] = useState<string | null>(null);
  const [modalRecordedFile, setModalRecordedFile] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [modalUploadResult, setModalUploadResult] = useState<any>(null);
  const [uploadToken, setUploadToken] = useState<string>('123'); // 默认token值，实际应用中应从认证系统获取
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 将WebM格式的音频转换为WAV格式
  const convertWebMToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 创建WAV文件头
          const length = audioBuffer.length * audioBuffer.numberOfChannels * 2;
          const buffer = new ArrayBuffer(44 + length);
          const view = new DataView(buffer);
          const sampleRate = audioBuffer.sampleRate;
          const numChannels = audioBuffer.numberOfChannels;

          // WAV文件头
          const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
              view.setUint8(offset + i, string.charCodeAt(i));
            }
          };

          // RIFF标识符
          writeString(0, 'RIFF');
          view.setUint32(4, 36 + length, true);
          writeString(8, 'WAVE');
          
          // fmt子块
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, numChannels, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * numChannels * 2, true);
          view.setUint16(32, numChannels * 2, true);
          view.setUint16(34, 16, true);
          
          // data子块
          writeString(36, 'data');
          view.setUint32(40, length, true);

          // 音频数据
          let offset = 44;
          for (let channel = 0; channel < numChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < audioBuffer.length; i++) {
              const sample = Math.max(-1, Math.min(1, channelData[i]));
              view.setInt16(offset, sample * 0x7FFF, true);
              offset += 2;
            }
          }

          const wavBlob = new Blob([buffer], { type: 'audio/wav' });
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('读取音频文件失败'));
      fileReader.readAsArrayBuffer(webmBlob);
    });
  };

  // 上传音频文件到服务器
  const uploadAudioToServer = async (audioBlob: Blob) => {
    try {
      // 转换为WAV格式
      const wavBlob = await convertWebMToWav(audioBlob);
      
      // 调用上传API，按照api.ts中的参数格式直接传入所需值
      const timestamp = new Date().getTime();
      const filename = `recording_${timestamp}.wav`;
      const response = await uploadAudioFile(wavBlob, filename, '/api/upload', uploadToken);
      return response;
    } catch (error) {
      console.error('音频上传失败:', error);
      throw error;
    }
  };

  // 处理录音完成
  const handleRecordFinish = async (filePath: string, audioBlob: Blob) => {
    setRecordedFile(filePath);
    message.success('录音完成，已保存录音文件');
    
    // 如果启用了上传功能，自动上传
    if (true) { // 这里可以根据需要添加条件判断
      try {
        const result = await uploadAudioToServer(audioBlob);
        handleUploadSuccess(result);
      } catch (error) {
        handleUploadError(error);
      }
    }
  };

  // 处理录音取消
  const handleRecordCancel = () => {
    setRecordedFile(null);
    setUploadResult(null);
    message.info('录音已取消');
  };

  // 处理上传成功
  const handleUploadSuccess = (response: any) => {
    setUploadResult(response);
    message.success('文件上传成功！');
    console.log('上传成功:', response);
  };

  // 处理上传失败
  const handleUploadError = (error: any) => {
    setUploadResult(null);
    message.error('文件上传失败');
    console.error('上传失败:', error);
  };

  // 处理弹框模式录音完成
  const handleModalRecordFinish = async (filePath: string, audioBlob: Blob) => {
    setModalRecordedFile(filePath);
    message.success('弹框模式录音完成，已保存录音文件');
    
    // 如果启用了上传功能，自动上传
    if (true) { // 这里可以根据需要添加条件判断
      try {
        const result = await uploadAudioToServer(audioBlob);
        handleModalUploadSuccess(result);
      } catch (error) {
        handleModalUploadError(error);
      }
    }
  };

  // 处理弹框模式录音取消
  const handleModalRecordCancel = () => {
    setModalRecordedFile(null);
    setModalUploadResult(null);
    message.info('弹框模式录音已取消');
  };

  // 处理弹框模式上传成功
  const handleModalUploadSuccess = (response: any) => {
    setModalUploadResult(response);
    message.success('弹框模式文件上传成功！');
    console.log('弹框模式上传成功:', response);
  };

  // 处理弹框模式上传失败
  const handleModalUploadError = (error: any) => {
    setModalUploadResult(null);
    message.error('弹框模式文件上传失败');
    console.error('弹框模式上传失败:', error);
  };

  // 播放录音
  const playRecording = (filePath: string | null) => {
    if (!filePath) {
      message.warning('没有录音文件可以播放');
      return;
    }

    try {
      const audio = new Audio(filePath);
      audio.play();
      message.info('开始播放录音');
    } catch (error) {
      console.error('播放录音失败:', error);
      message.error('播放录音失败，请重试');
    }
  };

  return (
    <div className="audio-recorder-example">
      <h2>录音组件使用示例（支持WAV格式上传）</h2>

      <Tabs defaultActiveKey="1" className="example-tabs">
        {/* 直接嵌入模式 */}
        <TabPane tab="直接嵌入模式（支持上传）" key="1">
          <Card title="录音组件（直接嵌入+上传）" bordered={false} className="example-card">
            <AudioRecorder
              maxDuration={60} // 最大录音时长，默认60秒
              onFinish={handleRecordFinish}
              onCancel={handleRecordCancel}
              modalMode={false} // 直接嵌入模式
            />

            {/* 录音结果展示 */}
            {recordedFile && (
              <div className="recording-result">
                <h4>录音结果</h4>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => playRecording(recordedFile)}
                >
                  播放录音
                </Button>
                <p>录音文件路径: {recordedFile}</p>
                
                {/* 上传结果显示 */}
                {uploadResult && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                    <h4 style={{ color: '#52c41a', marginBottom: 8 }}>上传成功！</h4>
                    <p><strong>原始文件名:</strong> {uploadResult.original_filename}</p>
                    <p><strong>保存文件名:</strong> {uploadResult.saved_filename}</p>
                    <p><strong>文件大小:</strong> {uploadResult.file_size} 字节</p>
                    <p><strong>服务器路径:</strong> {uploadResult.file_path}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabPane>

        {/* 弹框模式 */}
        <TabPane tab="弹框模式（支持上传）" key="2">
          <Card title="录音组件（弹框模式+上传）" bordered={false} className="example-card">
            <AudioRecorder
              maxDuration={60}
              onFinish={handleModalRecordFinish}
              onCancel={handleModalRecordCancel}
              modalMode={true} // 弹框模式
              triggerButton="打开录音弹框" // 自定义触发按钮文本
            />

            {/* 弹框模式录音结果展示 */}
            {modalRecordedFile && (
              <div className="recording-result">
                <h4>弹框模式录音结果</h4>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => playRecording(modalRecordedFile)}
                >
                  播放录音
                </Button>
                <p>录音文件路径: {modalRecordedFile}</p>
                
                {/* 弹框模式上传结果显示 */}
                {modalUploadResult && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                    <h4 style={{ color: '#52c41a', marginBottom: 8 }}>弹框模式上传成功！</h4>
                    <p><strong>原始文件名:</strong> {modalUploadResult.original_filename}</p>
                    <p><strong>保存文件名:</strong> {modalUploadResult.saved_filename}</p>
                    <p><strong>文件大小:</strong> {modalUploadResult.file_size} 字节</p>
                    <p><strong>服务器路径:</strong> {modalUploadResult.file_path}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabPane>

        {/* 自定义配置模式 */}
        <TabPane tab="自定义配置模式" key="3">
          <Card title="录音组件（自定义配置）" bordered={false} className="example-card">
            <AudioRecorder
              maxDuration={30} // 自定义最大录音时长为30秒
              onFinish={async (filePath, audioBlob) => {
                setRecordedFile(filePath);
                message.success('自定义配置模式录音完成');
                
                // 自动上传
                try {
                  const result = await uploadAudioToServer(audioBlob);
                  handleUploadSuccess(result);
                } catch (error) {
                  handleUploadError(error);
                }
              }}
              onCancel={() => {
                setRecordedFile(null);
                setUploadResult(null);
                message.info('自定义配置模式录音已取消');
              }}
              modalMode={false}
            />

            {/* 自定义配置模式录音结果展示 */}
            {recordedFile && (
              <div className="recording-result">
                <h4>自定义配置模式录音结果</h4>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => playRecording(recordedFile)}
                >
                  播放录音
                </Button>
                <p>录音文件路径: {recordedFile}</p>
                <p>自定义最大录音时长: 30秒</p>
                
                {/* 自定义配置模式上传结果显示 */}
                {uploadResult && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                    <h4 style={{ color: '#52c41a', marginBottom: 8 }}>自定义配置模式上传成功！</h4>
                    <p><strong>原始文件名:</strong> {uploadResult.original_filename}</p>
                    <p><strong>保存文件名:</strong> {uploadResult.saved_filename}</p>
                    <p><strong>文件大小:</strong> {uploadResult.file_size} 字节</p>
                    <p><strong>服务器路径:</strong> {uploadResult.file_path}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabPane>

        {/* 仅录音模式（不上传） */}
        <TabPane tab="仅录音模式（不上传）" key="4">
          <Card title="录音组件（仅录音，不上传）" bordered={false} className="example-card">
            <div style={{ marginBottom: 16 }}>
              <h4>Token配置</h4>
              <Input
                placeholder="输入上传认证token"
                value={uploadToken}
                onChange={(e) => setUploadToken(e.target.value)}
                style={{ maxWidth: 300 }}
              />
              <p style={{ color: '#888', marginTop: 8 }}>注：此token将用于所有上传请求的认证</p>
            </div>
            <AudioRecorder
              maxDuration={60}
              onFinish={(filePath) => {
                setRecordedFile(filePath);
                message.success('仅录音模式录音完成');
              }}
              onCancel={() => {
                setRecordedFile(null);
                message.info('仅录音模式录音已取消');
              }}
              modalMode={false}
            />

            {/* 仅录音模式录音结果展示 */}
            {recordedFile && (
              <div className="recording-result">
                <h4>仅录音模式录音结果</h4>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => playRecording(recordedFile)}
                >
                  播放录音
                </Button>
                <p>录音文件路径: {recordedFile}</p>
                <p style={{ color: '#999' }}>此模式仅提供录音功能，不支持文件上传</p>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Example;